import { config as reactConfig } from '@repo/configs/eslint/react-internal.js'

export default [
  ...reactConfig,
  {
    ignores: ['dist/**', 'storybook-static/**'],
  },
]