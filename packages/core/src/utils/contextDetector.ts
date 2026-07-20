import type { QueryInputContext, Token } from '../types/jql'

export function detectContext(
  tokens: Token[],
  cursorTokenIndex: number,
): QueryInputContext {
  const relevantTokens = tokens.slice(0, Math.max(cursorTokenIndex, 0))

  if (relevantTokens.length === 0) {
    return 'FIELD'
  }

  const lastToken = relevantTokens[relevantTokens.length - 1]

  if (lastToken?.type === 'FIELD') {
    return 'OPERATOR'
  }

  if (lastToken?.type === 'OPERATOR') {
    return 'VALUE'
  }

  if (lastToken?.type === 'VALUE') {
    return 'CONNECTOR'
  }

  if (lastToken?.type === 'CONNECTOR') {
    return 'FIELD'
  }

  return 'FIELD'
}
