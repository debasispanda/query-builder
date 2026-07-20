import type { QueryInputContext } from '../types/jql'
import { getFieldNames, getOperatorsForField } from './schema'

const CONNECTORS = ['AND', 'OR', 'NOT']

function filterSuggestions(values: string[], partial: string): string[] {
  const normalizedPartial = partial.trim().toLowerCase()

  if (!normalizedPartial) {
    return values
  }

  return values.filter((value) => value.toLowerCase().includes(normalizedPartial))
}

export function getSuggestions(
  context: QueryInputContext,
  partial: string,
  currentField?: string,
): string[] {
  if (context === 'FIELD') {
    return filterSuggestions(getFieldNames(), partial)
  }

  if (context === 'OPERATOR') {
    if (!currentField) {
      return []
    }

    return filterSuggestions(getOperatorsForField(currentField), partial)
  }

  if (context === 'CONNECTOR') {
    return filterSuggestions(CONNECTORS, partial)
  }

  return []
}
