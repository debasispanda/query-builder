import type { Token, TokenType } from '../types/jql'

const TOKEN_PATTERN = /"[^"]*"|[^\s]+/g
const CONNECTORS = new Set(['AND', 'OR', 'NOT'])

type ExpectedTokenType = 'FIELD' | 'OPERATOR' | 'VALUE' | 'AFTER_VALUE'

function normalizeTokenValue(rawToken: string): string {
  if (rawToken.startsWith('"') && rawToken.endsWith('"')) {
    return rawToken.slice(1, -1)
  }

  return rawToken
}

function getTokenType(rawToken: string, expected: ExpectedTokenType): TokenType {
  if (expected === 'AFTER_VALUE') {
    return CONNECTORS.has(rawToken.toUpperCase()) ? 'CONNECTOR' : 'UNKNOWN'
  }

  return expected
}

export function tokenize(input: string): Token[] {
  const rawTokens = input.match(TOKEN_PATTERN) ?? []
  const tokens: Token[] = []
  let expected: ExpectedTokenType = 'FIELD'

  for (let index = 0; index < rawTokens.length; index += 1) {
    const initialToken = rawTokens[index]
    if (!initialToken) {
      continue
    }

    let rawToken = initialToken

    // Keep parenthesized list values intact (e.g. IN (High, Medium)).
    if (expected === 'VALUE' && rawToken.startsWith('(') && !rawToken.endsWith(')')) {
      while (index + 1 < rawTokens.length && !rawToken.endsWith(')')) {
        index += 1
        const nextToken = rawTokens[index]
        if (!nextToken) {
          break
        }

        rawToken = `${rawToken} ${nextToken}`
      }
    }

    const type = getTokenType(rawToken, expected)

    tokens.push({
      value: normalizeTokenValue(rawToken),
      type,
    })

    if (type === 'FIELD') {
      expected = 'OPERATOR'
      continue
    }

    if (type === 'OPERATOR') {
      expected = 'VALUE'
      continue
    }

    if (type === 'VALUE') {
      expected = 'AFTER_VALUE'
      continue
    }

    if (type === 'CONNECTOR') {
      expected = 'FIELD'
    }
  }

  return tokens
}
