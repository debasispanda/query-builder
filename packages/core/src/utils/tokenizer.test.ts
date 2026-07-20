import { tokenize } from './tokenizer'

describe('tokenize', () => {
  it('tokenizes a simple quoted query', () => {
    expect(tokenize('project = "Marketing"')).toEqual([
      { value: 'project', type: 'FIELD' },
      { value: '=', type: 'OPERATOR' },
      { value: 'Marketing', type: 'VALUE' },
    ])
  })

  it('keeps spaces inside quoted values', () => {
    expect(tokenize('project = "My Project"')).toEqual([
      { value: 'project', type: 'FIELD' },
      { value: '=', type: 'OPERATOR' },
      { value: 'My Project', type: 'VALUE' },
    ])
  })

  it('supports unquoted single-word values', () => {
    expect(tokenize('status = active')).toEqual([
      { value: 'status', type: 'FIELD' },
      { value: '=', type: 'OPERATOR' },
      { value: 'active', type: 'VALUE' },
    ])
  })

  it('tokenizes chained clauses joined by AND', () => {
    expect(tokenize('project = "Design" AND status = "ToDo"')).toEqual([
      { value: 'project', type: 'FIELD' },
      { value: '=', type: 'OPERATOR' },
      { value: 'Design', type: 'VALUE' },
      { value: 'AND', type: 'CONNECTOR' },
      { value: 'status', type: 'FIELD' },
      { value: '=', type: 'OPERATOR' },
      { value: 'ToDo', type: 'VALUE' },
    ])
  })

  it('tokenizes chained clauses joined by OR', () => {
    expect(tokenize('project = "Design" OR priority = "High"')).toEqual([
      { value: 'project', type: 'FIELD' },
      { value: '=', type: 'OPERATOR' },
      { value: 'Design', type: 'VALUE' },
      { value: 'OR', type: 'CONNECTOR' },
      { value: 'priority', type: 'FIELD' },
      { value: '=', type: 'OPERATOR' },
      { value: 'High', type: 'VALUE' },
    ])
  })

  it('ignores extra whitespace between tokens', () => {
    expect(tokenize('project  =  "value"')).toEqual([
      { value: 'project', type: 'FIELD' },
      { value: '=', type: 'OPERATOR' },
      { value: 'value', type: 'VALUE' },
    ])
  })

  it('returns no tokens for empty input', () => {
    expect(tokenize('')).toEqual([])
  })

  it('ignores trailing whitespace', () => {
    expect(tokenize('status = active   ')).toEqual([
      { value: 'status', type: 'FIELD' },
      { value: '=', type: 'OPERATOR' },
      { value: 'active', type: 'VALUE' },
    ])
  })

  it('tokenizes IN list values as a single value token', () => {
    expect(tokenize('priority IN (High, Medium, Low)')).toEqual([
      { value: 'priority', type: 'FIELD' },
      { value: 'IN', type: 'OPERATOR' },
      { value: '(High, Medium, Low)', type: 'VALUE' },
    ])
  })

  it('keeps IN list token intact in chained queries', () => {
    expect(tokenize('priority IN (High, Medium) AND status = active')).toEqual([
      { value: 'priority', type: 'FIELD' },
      { value: 'IN', type: 'OPERATOR' },
      { value: '(High, Medium)', type: 'VALUE' },
      { value: 'AND', type: 'CONNECTOR' },
      { value: 'status', type: 'FIELD' },
      { value: '=', type: 'OPERATOR' },
      { value: 'active', type: 'VALUE' },
    ])
  })
})
