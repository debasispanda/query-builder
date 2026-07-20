import type { FieldDef } from '../types/jql'

export const SCHEMA_FIELDS: FieldDef[] = [
  { name: 'project', type: 'string', operators: ['=', '!=', 'IN'] },
  { name: 'status', type: 'string', operators: ['=', '!=', 'IN'] },
  { name: 'assignee', type: 'string', operators: ['=', '!='] },
  { name: 'priority', type: 'string', operators: ['=', '!=', 'IN'] },
]

export function getOperatorsForField(fieldName: string): string[] {
  const field = SCHEMA_FIELDS.find(
    ({ name }) => name.toLowerCase() === fieldName.toLowerCase(),
  )

  return field?.operators ?? []
}

export function getFieldNames(): string[] {
  return SCHEMA_FIELDS.map(({ name }) => name)
}

export function isValidField(fieldName: string): boolean {
  return SCHEMA_FIELDS.some(
    ({ name }) => name.toLowerCase() === fieldName.toLowerCase(),
  )
}
