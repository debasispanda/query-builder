import { describe, expect, it } from 'vitest'

import { tokenize } from './tokenizer'
import { validate } from './validator'

describe('validate', () => {
  it('treats an empty query as valid', () => {
    expect(validate([])).toEqual({ isValid: true })
  })

  it('accepts a complete single-clause query', () => {
    const result = validate(tokenize('project = "Marketing"'))

    expect(result).toEqual({ isValid: true })
  })

  it('rejects an incomplete query missing a value', () => {
    const result = validate(tokenize('project ='))

    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Incomplete query: expected VALUE after operator')
  })

  it('rejects an incomplete query missing an operator and value', () => {
    const result = validate(tokenize('project'))

    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Incomplete query: expected OPERATOR after field')
  })

  it('rejects an unknown field', () => {
    const result = validate(tokenize('unknown_field = "value"'))

    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Invalid field name: unknown_field')
  })

  it('rejects an invalid operator for a valid field', () => {
    const result = validate(tokenize('project ~ "value"'))

    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Invalid operator: ~ for field project')
  })

  it('accepts a complete chained query', () => {
    const result = validate(tokenize('project = "Design" AND status = "ToDo"'))

    expect(result).toEqual({ isValid: true })
  })

  it('rejects an incomplete chained query', () => {
    const result = validate(tokenize('project = "Design" AND status ='))

    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Incomplete query: expected VALUE after operator')
  })

  it('rejects an invalid connector token', () => {
    const result = validate(tokenize('project = "Design" XOR status = "ToDo"'))

    expect(result.isValid).toBe(false)
    expect(result.error).toBe('Invalid connector: XOR')
  })

  it('accepts IN with a parenthesized comma-separated list', () => {
    const result = validate(tokenize('priority IN (High, Medium, Low)'))

    expect(result).toEqual({ isValid: true })
  })

  it('accepts IN with a single list value', () => {
    const result = validate(tokenize('priority IN (High)'))

    expect(result).toEqual({ isValid: true })
  })

  it('accepts IN list items with spaces when quoted', () => {
    const result = validate(tokenize('priority IN ("Very High")'))

    expect(result).toEqual({ isValid: true })
  })

  it('rejects IN without list syntax', () => {
    const result = validate(tokenize('priority IN High'))

    expect(result.isValid).toBe(false)
    expect(result.error).toBe(
      'Invalid IN value: expected parenthesized comma-separated list',
    )
  })

  it('rejects IN with an empty list', () => {
    const result = validate(tokenize('priority IN ()'))

    expect(result.isValid).toBe(false)
    expect(result.error).toBe(
      'Invalid IN value: expected parenthesized comma-separated list',
    )
  })

  it('rejects IN list values missing commas', () => {
    const result = validate(tokenize('priority IN (High Medium)'))

    expect(result.isValid).toBe(false)
    expect(result.error).toBe(
      'Invalid IN value: expected parenthesized comma-separated list',
    )
  })

  it('rejects IN list items with spaces when unquoted', () => {
    const result = validate(tokenize('priority IN (Very High)'))

    expect(result.isValid).toBe(false)
    expect(result.error).toBe(
      'Invalid IN value: expected parenthesized comma-separated list',
    )
  })

  it('rejects non-IN space-separated values when unquoted', () => {
    const result = validate(tokenize('status = In Progress'))

    expect(result.isValid).toBe(false)
  })
})
