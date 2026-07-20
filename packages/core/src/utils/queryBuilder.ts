import type { QueryOutput, Token } from '../types/jql'

const QUOTED_SEGMENT_PATTERN = /("[^"]*")/g
const NOT_EQUALS_PLACEHOLDER = '__JQL_NEQ__'

function normalizeOutsideQuotedSegment(segment: string): string {
  const withSpacedOperators = segment
    .replace(/!=/g, ` ${NOT_EQUALS_PLACEHOLDER} `)
    .replace(/=/g, ' = ')
    .replace(new RegExp(NOT_EQUALS_PLACEHOLDER, 'g'), '!=')
    .replace(/\b(AND|OR|NOT)\b/gi, ' $1 ')

  return withSpacedOperators.replace(/\s+/g, ' ').trim()
}

function normalizeSpacing(queryText: string): string {
  if (!queryText.trim()) {
    return ''
  }

  const segments = queryText.split(QUOTED_SEGMENT_PATTERN)

  return segments
    .map((segment, index) => {
      const isQuotedSegment = index % 2 === 1
      return isQuotedSegment ? segment : normalizeOutsideQuotedSegment(segment)
    })
    .filter((segment) => segment.length > 0)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function buildQueryOutput(
  queryText: string,
  tokens: Token[],
  isValid: boolean,
  error?: string,
): QueryOutput {
  return {
    raw: queryText,
    normalized: normalizeSpacing(queryText),
    tokens,
    isValid,
    error,
  }
}
