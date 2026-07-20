export type TokenType = 'FIELD' | 'OPERATOR' | 'VALUE' | 'CONNECTOR' | 'UNKNOWN'
export type QueryInputContext = 'FIELD' | 'OPERATOR' | 'VALUE' | 'CONNECTOR'

export interface Token {
  value: string
  type: TokenType
}

export type FieldType = 'string' | 'number' | 'date'

export interface FieldDef {
  name: string
  type: FieldType
  operators: string[]
}

export interface ParsedQuery {
  tokens: Token[]
  isValid: boolean
  error?: string
}

export interface QueryOutput {
  raw: string
  normalized: string
  tokens: Token[]
  isValid: boolean
  error?: string
}
