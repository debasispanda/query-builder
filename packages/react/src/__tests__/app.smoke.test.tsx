import { render, screen } from '@testing-library/react'
import App from '@/App'

describe('App scaffold', () => {
  it('renders the JQL heading', () => {
    render(<App />)
    expect(screen.getByText('JQL Query Builder')).toBeInTheDocument()
  })
})
