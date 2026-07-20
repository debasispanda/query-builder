import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { QueryInput } from '@/components/QueryInput'

describe('QueryInput', () => {
  it('renders an editable textarea and reports context while typing', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    const handleContextChange = vi.fn()

    render(
      <QueryInput
        onChange={handleChange}
        onContextChange={handleContextChange}
      />,
    )

    const input = screen.getByRole('textbox')

    await user.type(input, 'project')

    expect(input).toHaveValue('project')
    expect(handleChange).toHaveBeenLastCalledWith('project')
    expect(handleContextChange).toHaveBeenLastCalledWith('OPERATOR')
  })

  it('shows error styling and message when invalid', () => {
    render(<QueryInput value="project" isError errorMessage="Expected operator" />)

    const input = screen.getByRole('textbox')

    expect(input).toHaveClass('jql-input--error')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Expected operator')).toBeInTheDocument()
  })

  it('clears context on blur', async () => {
    const user = userEvent.setup()
    const handleContextChange = vi.fn()

    render(<QueryInput value="project" onContextChange={handleContextChange} />)

    await user.click(screen.getByRole('textbox'))
    await user.tab()

    expect(handleContextChange).toHaveBeenLastCalledWith(null)
  })

  it('auto-inserts a closing quote in value context', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    const handleCursorChange = vi.fn()

    render(
      <QueryInput
        value="project = "
        onChange={handleChange}
        onCursorChange={handleCursorChange}
      />,
    )

    const input = screen.getByRole('textbox') as HTMLTextAreaElement
    input.focus()
    input.setSelectionRange(input.value.length, input.value.length)
    fireEvent.select(input)

    await user.type(input, '"')

    expect(input).toHaveValue('project = ""')
    expect(handleChange).toHaveBeenLastCalledWith('project = ""')
    expect(handleCursorChange).toHaveBeenLastCalledWith('project = "'.length)
  })

  it('auto-inserts a closing single quote in value context', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<QueryInput value="project = " onChange={handleChange} />)

    const input = screen.getByRole('textbox') as HTMLTextAreaElement
    input.focus()
    input.setSelectionRange(input.value.length, input.value.length)
    fireEvent.select(input)

    await user.type(input, "'")

    expect(input).toHaveValue("project = ''")
    expect(handleChange).toHaveBeenLastCalledWith("project = ''")
  })

  it('auto-inserts closing parenthesis for IN values', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    const handleCursorChange = vi.fn()

    render(
      <QueryInput
        value="priority IN "
        onChange={handleChange}
        onCursorChange={handleCursorChange}
      />,
    )

    const input = screen.getByRole('textbox') as HTMLTextAreaElement
    input.focus()
    input.setSelectionRange(input.value.length, input.value.length)
    fireEvent.select(input)

    await user.type(input, '(')

    expect(input).toHaveValue('priority IN ()')
    expect(handleChange).toHaveBeenLastCalledWith('priority IN ()')
    expect(handleCursorChange).toHaveBeenLastCalledWith('priority IN ('.length)
  })

  it('auto-inserts closing double quote inside IN list items', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<QueryInput value="priority IN (" onChange={handleChange} />)

    const input = screen.getByRole('textbox') as HTMLTextAreaElement
    input.focus()
    input.setSelectionRange(input.value.length, input.value.length)
    fireEvent.select(input)

    await user.type(input, '"')

    expect(input).toHaveValue('priority IN (""')
    expect(handleChange).toHaveBeenLastCalledWith('priority IN (""')
  })

  it('auto-inserts closing single quote inside IN list items', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(<QueryInput value="priority IN (" onChange={handleChange} />)

    const input = screen.getByRole('textbox') as HTMLTextAreaElement
    input.focus()
    input.setSelectionRange(input.value.length, input.value.length)
    fireEvent.select(input)

    await user.type(input, "'")

    expect(input).toHaveValue("priority IN (''")
    expect(handleChange).toHaveBeenLastCalledWith("priority IN (''")
  })

  it('preserves normal quote typing outside value context', async () => {
    const user = userEvent.setup()

    render(<QueryInput />)

    const input = screen.getByRole('textbox')

    await user.type(input, '"')

    expect(input).toHaveValue('"')
  })
})
