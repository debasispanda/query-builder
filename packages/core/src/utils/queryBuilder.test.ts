import { describe, expect, it } from 'vitest'

import { buildQueryOutput } from './queryBuilder'
import { tokenize } from './tokenizer'

describe('buildQueryOutput', () => {
  it('normalizes spacing around assignment operators', () => {
    const raw = 'project="Marketing"'

    const output = buildQueryOutput(raw, tokenize(raw), false)

    expect(output.normalized).toBe('project = "Marketing"')
  })

  it('normalizes multiple spaces to single spaces', () => {
    const raw = 'project  =  "value"'

    const output = buildQueryOutput(raw, tokenize(raw), true)

    expect(output.normalized).toBe('project = "value"')
  })

  it('preserves spaces inside quoted values', () => {
    const raw = 'project = "My Project"'

    const output = buildQueryOutput(raw, tokenize(raw), true)

    expect(output.normalized).toBe('project = "My Project"')
  })

  it('normalizes chained queries with connectors and operators', () => {
    const raw = 'project="Design"AND status="ToDo"'

    const output = buildQueryOutput(raw, tokenize(raw), false)

    expect(output.normalized).toBe('project = "Design" AND status = "ToDo"')
  })

  it('returns raw and normalized strings in the query output payload', () => {
    const raw = '  priority  !=  "High"  '

    const output = buildQueryOutput(raw, tokenize(raw), true)

    expect(output.raw).toBe(raw)
    expect(output.normalized).toBe('priority != "High"')
    expect(output.isValid).toBe(true)
  })
})
