import { getSuggestions } from './suggestionProvider'

describe('getSuggestions', () => {
  it('filters field suggestions by partial match', () => {
    expect(getSuggestions('FIELD', 'pro')).toEqual(['project'])
  })

  it('filters operators for the current field', () => {
    expect(getSuggestions('OPERATOR', 'i', 'project')).toEqual(['IN'])
  })

  it('returns no suggestions for values in the MVP', () => {
    expect(getSuggestions('VALUE', 'act', 'status')).toEqual([])
  })

  it('returns connector suggestions after a completed clause', () => {
    expect(getSuggestions('CONNECTOR', '')).toEqual(['AND', 'OR', 'NOT'])
  })

  it('filters connector suggestions by partial match', () => {
    expect(getSuggestions('CONNECTOR', 'o')).toEqual(['OR', 'NOT'])
  })
})
