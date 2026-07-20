import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'

import type { QueryInputContext, QueryOutput, Token } from '@repo/core/types/jql'
import { QueryInput } from '@/components/QueryInput'
import { SuggestionPopover } from '@/components/SuggestionPopover'
import { detectContext } from "@repo/core/utils/contextDetector";
import { buildQueryOutput } from "@repo/core/utils/queryBuilder";
import { getSuggestions } from '@repo/core/utils/suggestionProvider'
import { tokenize } from '@repo/core/utils/tokenizer'
import { validate } from '@repo/core/utils/validator'

const TOKEN_PATTERN = /"[^"]*"|[^\s]+/g

interface TokenRange {
  start: number
  end: number
}

interface SuggestionState {
  context: QueryInputContext
  partial: string
  currentField?: string
  replacementRange: TokenRange
}

function findCurrentField(tokens: Token[]): string | undefined {
  for (let index = tokens.length - 1; index >= 0; index -= 1) {
    const token = tokens[index]

    if (token?.type === 'FIELD') {
      return token.value
    }
  }

  return undefined
}

function findTokenRange(queryText: string, cursorPos: number): TokenRange | null {
  for (const match of queryText.matchAll(TOKEN_PATTERN)) {
    const start = match.index ?? 0
    const end = start + match[0].length

    if (cursorPos >= start && cursorPos <= end) {
      return { start, end }
    }
  }

  return null
}

function isInsideInList(queryText: string, cursorPos: number): boolean {
  const beforeCursor = queryText.slice(0, cursorPos)
  const openParenIndex = beforeCursor.lastIndexOf('(')

  if (openParenIndex < 0) {
    return false
  }

  const closeParenIndex = beforeCursor.lastIndexOf(')')
  if (closeParenIndex > openParenIndex) {
    return false
  }

  const prefixTokens = tokenize(beforeCursor.slice(0, openParenIndex).trim())
  const lastPrefixToken = prefixTokens[prefixTokens.length - 1]

  return (
    lastPrefixToken?.type === 'OPERATOR' &&
    lastPrefixToken.value.toUpperCase() === 'IN'
  )
}

function isInsideQuotes(queryText: string, cursorPos: number): boolean {
  let activeQuote: '"' | "'" | null = null

  for (let index = 0; index < cursorPos; index += 1) {
    const char = queryText[index]

    if (char !== '"' && char !== "'") {
      continue
    }

    if (activeQuote === null) {
      activeQuote = char
      continue
    }

    if (activeQuote === char) {
      activeQuote = null
    }
  }

  return activeQuote !== null
}

function getSuggestionState(queryText: string, cursorPos: number): SuggestionState {
  if (isInsideQuotes(queryText, cursorPos)) {
    const tokensBeforeCursor = tokenize(queryText.slice(0, cursorPos))

    return {
      context: 'VALUE',
      partial: '',
      currentField: findCurrentField(tokensBeforeCursor),
      replacementRange: {
        start: cursorPos,
        end: cursorPos,
      },
    }
  }

  if (isInsideInList(queryText, cursorPos)) {
    const tokensBeforeCursor = tokenize(queryText.slice(0, cursorPos))

    return {
      context: 'VALUE',
      partial: '',
      currentField: findCurrentField(tokensBeforeCursor),
      replacementRange: {
        start: cursorPos,
        end: cursorPos,
      },
    }
  }

  const beforeCursor = queryText.slice(0, cursorPos)
  const hasTrailingSpace = /\s$/.test(beforeCursor)
  const tokensBeforeCursor = tokenize(beforeCursor)
  const activeTokenRange = findTokenRange(queryText, cursorPos)

  if (!beforeCursor || hasTrailingSpace || !activeTokenRange) {
    return {
      context: detectContext(tokensBeforeCursor, tokensBeforeCursor.length),
      partial: '',
      currentField: findCurrentField(tokensBeforeCursor),
      replacementRange: {
        start: cursorPos,
        end: cursorPos,
      },
    }
  }

  const completedTokenText = queryText.slice(0, activeTokenRange.start).trim()
  const completedTokens = tokenize(completedTokenText)

  return {
    context: detectContext(completedTokens, completedTokens.length),
    partial: queryText.slice(activeTokenRange.start, cursorPos),
    currentField: findCurrentField(completedTokens),
    replacementRange: activeTokenRange,
  }
}

interface JQLEditorProps {
  onValidChange?: (isValid: boolean) => void
  onOutputChange?: (output: QueryOutput) => void
}

export function JQLEditor({ onValidChange, onOutputChange }: JQLEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [queryText, setQueryText] = useState('')
  const [cursorPos, setCursorPos] = useState(0)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [isPopoverDismissed, setIsPopoverDismissed] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const tokens = useMemo(() => tokenize(queryText), [queryText])
  const validation = useMemo(() => validate(tokens), [tokens])

  const suggestionState = useMemo(
    () => getSuggestionState(queryText, cursorPos),
    [cursorPos, queryText],
  )

  const suggestions = useMemo(
    () =>
      getSuggestions(
        suggestionState.context,
        suggestionState.partial,
        suggestionState.currentField,
      ),
    [suggestionState.context, suggestionState.currentField, suggestionState.partial],
  )

  const isSuggestionOpen =
    isInputFocused &&
    !isPopoverDismissed &&
    suggestionState.context !== 'VALUE' &&
    suggestions.length > 0

  useEffect(() => {
    setActiveIndex(0)
  }, [suggestions, suggestionState.context, suggestionState.partial])

  useEffect(() => {
    onValidChange?.(validation.isValid)
  }, [onValidChange, validation.isValid])

  useEffect(() => {
    onOutputChange?.(
      buildQueryOutput(queryText, tokens, validation.isValid, validation.error),
    )
  }, [onOutputChange, queryText, tokens, validation.error, validation.isValid])

  function updateQuery(nextValue: string) {
    setQueryText(nextValue)
    setIsPopoverDismissed(false)
  }

  function applySuggestion(suggestion: string) {
    const { start, end } = suggestionState.replacementRange
    const nextValue = `${queryText.slice(0, start)}${suggestion}${queryText.slice(end)}`
    const nextCursorPos = start + suggestion.length

    setQueryText(nextValue)
    setCursorPos(nextCursorPos)
    setActiveIndex(0)
    setIsPopoverDismissed(true)

    requestAnimationFrame(() => {
      textareaRef.current?.focus()
      textareaRef.current?.setSelectionRange(nextCursorPos, nextCursorPos)
    })
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (!isSuggestionOpen) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((currentIndex) => (currentIndex + 1) % suggestions.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(
        (currentIndex) => (currentIndex - 1 + suggestions.length) % suggestions.length,
      )
      return
    }

    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault()
      const selectedSuggestion = suggestions[activeIndex]

      if (!selectedSuggestion) {
        return
      }

      applySuggestion(selectedSuggestion)
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setIsPopoverDismissed(true)
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <QueryInput
          value={queryText}
          onChange={updateQuery}
          onCursorChange={setCursorPos}
          onFocus={() => {
            setIsInputFocused(true)
            setIsPopoverDismissed(false)
          }}
          onContextChange={(context) => {
            if (context === null) {
              setIsInputFocused(false)
            }
          }}
          onKeyDown={handleKeyDown}
          textareaRef={textareaRef}
          isError={!validation.isValid}
          errorMessage={validation.error}
        />
        <SuggestionPopover
          isOpen={isSuggestionOpen}
          suggestions={suggestions}
          onSelect={applySuggestion}
          onActiveIndexChange={setActiveIndex}
          activeIndex={activeIndex}
          context={suggestionState.context}
          anchorEl={textareaRef.current}
          partial={suggestionState.partial}
        />
      </div>
      <p className="text-sm text-slate-600">
        Start typing a field name, then add an operator. Values remain plain text for
        the MVP.
      </p>
    </div>
  )
}
