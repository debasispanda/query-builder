import { detectContext } from './contextDetector'
import type { Token } from '../types/jql'

function makeTokens(types: Token['type'][]): Token[] {
  return types.map((type, index) => ({
    type,
    value: `${type.toLowerCase()}-${index}`,
  }))
}

describe('detectContext', () => {
  it('returns FIELD when there are no tokens', () => {
    expect(detectContext([], 0)).toBe('FIELD')
  })

  it('returns OPERATOR after a field token', () => {
    expect(detectContext(makeTokens(['FIELD']), 1)).toBe('OPERATOR')
  })

  it('returns VALUE after field and operator tokens', () => {
    expect(detectContext(makeTokens(['FIELD', 'OPERATOR']), 2)).toBe('VALUE')
  })

  it('returns CONNECTOR after a complete single clause', () => {
    expect(detectContext(makeTokens(['FIELD', 'OPERATOR', 'VALUE']), 3)).toBe(
      'CONNECTOR',
    )
  })

  it('returns OPERATOR when the cursor is after a field in the next clause', () => {
    expect(
      detectContext(
        makeTokens(['FIELD', 'OPERATOR', 'VALUE', 'CONNECTOR', 'FIELD']),
        5,
      ),
    ).toBe('OPERATOR')
  })
})
