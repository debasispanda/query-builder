import {
  useLayoutEffect,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEventHandler,
  type KeyboardEvent,
  type KeyboardEventHandler,
  type RefObject,
  type SyntheticEvent,
} from 'react'

import type { QueryInputContext } from '@repo/core/types/jql'
import { cn } from '../lib/utils'
import { Textarea } from './ui/textarea'
import { detectContext } from '@repo/core/utils/contextDetector'
import { tokenize } from '@repo/core/utils/tokenizer'

export interface QueryInputProps {
  value?: string
  onChange?: (value: string) => void
  onContextChange?: (context: QueryInputContext | null) => void
  onCursorChange?: (cursorPos: number) => void
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>
  onFocus?: FocusEventHandler<HTMLTextAreaElement>
  isError?: boolean
  errorMessage?: string
  textareaRef?: RefObject<HTMLTextAreaElement | null>
}

function getCursorTokenIndex(value: string, cursorPos: number): number {
  return tokenize(value.slice(0, cursorPos)).length
}

function getContextAtCursor(value: string, cursorPos: number): QueryInputContext {
  return detectContext(tokenize(value), getCursorTokenIndex(value, cursorPos))
}

function isInValueContext(value: string, cursorPos: number): boolean {
  const tokensBeforeCursor = tokenize(value.slice(0, cursorPos))
  const context = detectContext(tokensBeforeCursor, tokensBeforeCursor.length)

  if (context !== 'VALUE') {
    return false
  }

  for (let index = tokensBeforeCursor.length - 1; index >= 0; index -= 1) {
    const token = tokensBeforeCursor[index]

    if (token?.type === 'OPERATOR') {
      return token.value.toUpperCase() === 'IN'
    }
  }

  return false
}

function isInsideInList(value: string, cursorPos: number): boolean {
  const beforeCursor = value.slice(0, cursorPos)
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

interface PendingQuoteAction {
  sourceValue: string
  cursorPos: number
  hasSelection: boolean
  quoteChar: '"' | "'"
  nextCharIsQuote: boolean
  timerId: number | null
}

export function QueryInput({
  value = '',
  onChange,
  onContextChange,
  onCursorChange,
  onKeyDown,
  onFocus,
  isError = false,
  errorMessage,
  textareaRef,
}: QueryInputProps) {
  const [queryText, setQueryText] = useState(value)
  const [cursorPos, setCursorPos] = useState(value.length)
  const errorId = useId()
  const internalTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  const pendingQuoteActionRef = useRef<PendingQuoteAction | null>(null)

  function attachTextareaRef(element: HTMLTextAreaElement | null) {
    internalTextareaRef.current = element

    if (textareaRef) {
      textareaRef.current = element
    }
  }

  useEffect(() => {
    setQueryText(value)
  }, [value])

  useEffect(() => {
    const safeCursorPos = Math.min(cursorPos, queryText.length)
    const context = detectContext(
      tokenize(queryText),
      getCursorTokenIndex(queryText, safeCursorPos),
    )

    onContextChange?.(context)
  }, [cursorPos, onContextChange, queryText])

  useLayoutEffect(() => {
    const textarea = internalTextareaRef.current

    if (!textarea || typeof textarea.setSelectionRange !== 'function') {
      return
    }

    const safeCursorPos = Math.min(cursorPos, queryText.length)
    textarea.setSelectionRange(safeCursorPos, safeCursorPos)
  }, [cursorPos, queryText, textareaRef])

  function updateCursorPosition(event: SyntheticEvent<HTMLTextAreaElement>) {
    const nextCursorPos = event.currentTarget.selectionStart

    setCursorPos(nextCursorPos)
    onCursorChange?.(nextCursorPos)
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const pendingQuoteAction = pendingQuoteActionRef.current
    const nextValue = event.currentTarget.value
    const nextCursorPos = event.currentTarget.selectionStart ?? nextValue.length

    if (pendingQuoteAction) {
      if (pendingQuoteAction.timerId !== null) {
        window.clearTimeout(pendingQuoteAction.timerId)
      }

      pendingQuoteActionRef.current = null

      if (!pendingQuoteAction.hasSelection && pendingQuoteAction.nextCharIsQuote) {
        setQueryText(pendingQuoteAction.sourceValue)
        setCursorPos(pendingQuoteAction.cursorPos + 1)
        onCursorChange?.(pendingQuoteAction.cursorPos + 1)
        onChange?.(pendingQuoteAction.sourceValue)
        return
      }

      const correctedValue = `${nextValue.slice(0, nextCursorPos)}${pendingQuoteAction.quoteChar}${nextValue.slice(nextCursorPos)}`

      setQueryText(correctedValue)
      setCursorPos(nextCursorPos)
      onCursorChange?.(nextCursorPos)
      onChange?.(correctedValue)
      return
    }

    setQueryText(nextValue)
    setCursorPos(nextCursorPos)
    onCursorChange?.(nextCursorPos)
    onChange?.(nextValue)
  }

  function commitValueChange(
    nextValue: string,
    nextCursorStart: number,
    nextCursorEnd = nextCursorStart,
  ) {
    setQueryText(nextValue)
    setCursorPos(nextCursorEnd)
    onCursorChange?.(nextCursorEnd)
    onChange?.(nextValue)

    const textarea = internalTextareaRef.current

    if (textarea) {
      textarea.focus()
      textarea.selectionStart = nextCursorStart
      textarea.selectionEnd = nextCursorEnd
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const selectionStart = event.currentTarget.selectionStart ?? cursorPos
    const selectionEnd = event.currentTarget.selectionEnd ?? selectionStart
    const hasSelection = selectionStart !== selectionEnd
    const insideInList = isInsideInList(queryText, selectionStart)

    if (event.key === '(' && isInValueContext(queryText, selectionStart)) {
      event.preventDefault()

      if (!hasSelection && queryText[selectionStart] === ')') {
        commitValueChange(queryText, selectionStart + 1)
        return
      }

      const selectedText = queryText.slice(selectionStart, selectionEnd)
      const nextValue = `${queryText.slice(0, selectionStart)}(${selectedText})${queryText.slice(selectionEnd)}`
      const nextCursorStart = selectionStart + 1
      const nextCursorEnd = hasSelection ? selectionEnd + 1 : nextCursorStart

      commitValueChange(nextValue, nextCursorStart, nextCursorEnd)
      return
    }

    const stepOverCursorPos = queryText[selectionStart] === ')' ? selectionStart : cursorPos

    if (
      event.key === ')' &&
      !hasSelection &&
      queryText[stepOverCursorPos] === ')' &&
      isInsideInList(queryText, stepOverCursorPos)
    ) {
      event.preventDefault()
      commitValueChange(queryText, stepOverCursorPos + 1)
      return
    }

    const context = getContextAtCursor(queryText, selectionStart)
    const quoteChar = event.key === '"' || event.key === "'" ? event.key : null
    const hasQuoteAhead =
      quoteChar !== null && queryText.slice(selectionStart, selectionStart + 2).includes(quoteChar)

    if (quoteChar !== null && (context === 'VALUE' || hasQuoteAhead || insideInList)) {
      event.preventDefault()

      const pendingQuoteAction: PendingQuoteAction = {
        sourceValue: queryText,
        cursorPos: selectionStart,
        hasSelection: selectionStart !== selectionEnd,
        quoteChar,
        nextCharIsQuote:
          queryText.slice(selectionStart, selectionStart + 2).includes(quoteChar) ||
          queryText.includes(quoteChar === '"' ? '""' : "''"),
        timerId: window.setTimeout(() => {
          if (pendingQuoteActionRef.current !== pendingQuoteAction) {
            return
          }

          pendingQuoteActionRef.current = null

          if (pendingQuoteAction.nextCharIsQuote) {
            commitValueChange(pendingQuoteAction.sourceValue, pendingQuoteAction.cursorPos + 1)
            return
          }

          const nextValue = `${pendingQuoteAction.sourceValue.slice(0, pendingQuoteAction.cursorPos)}${pendingQuoteAction.quoteChar}${pendingQuoteAction.quoteChar}${pendingQuoteAction.sourceValue.slice(pendingQuoteAction.cursorPos)}`
          commitValueChange(nextValue, pendingQuoteAction.cursorPos + 1)
        }, 0),
      }

      pendingQuoteActionRef.current = pendingQuoteAction
      return
    }

    onKeyDown?.(event)
  }

  function handleBlur() {
    onContextChange?.(null)
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={queryText}
        ref={attachTextareaRef}
        onChange={handleChange}
        onClick={updateCursorPosition}
        onKeyUp={updateCursorPosition}
        onKeyDown={handleKeyDown}
        onSelect={updateCursorPosition}
        onFocus={onFocus}
        onBlur={handleBlur}
        aria-invalid={isError || undefined}
        aria-describedby={errorMessage ? errorId : undefined}
        className={cn(isError && 'jql-input--error border-red-500 focus:border-red-500 focus:ring-red-100')}
      />
      {errorMessage ? (
        <p id={errorId} className="text-sm text-red-600">
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}
