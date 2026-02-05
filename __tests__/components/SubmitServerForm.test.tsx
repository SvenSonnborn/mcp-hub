import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SubmitServerForm } from '@/components/registry/SubmitServerForm'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('SubmitServerForm', () => {
  it('renders all form fields', () => {
    render(<SubmitServerForm />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/publisher/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/github url/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/install url/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/version/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    render(<SubmitServerForm />)

    const submitButton = screen.getByRole('button', { name: /submit server/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    })
  })

  it('shows character counter for description', () => {
    render(<SubmitServerForm />)

    const counter = screen.getByText(/0\/500 characters/i)
    expect(counter).toBeInTheDocument()
  })

  it('allows max 5 tags selection', async () => {
    const user = userEvent.setup()
    render(<SubmitServerForm />)

    const tagButtons = screen
      .getAllByRole('button')
      .filter((btn) =>
        ['api', 'tools', 'github', 'database', 'ai', 'cloud'].includes(
          btn.textContent?.toLowerCase() || ''
        )
      )

    // Click 6 tags
    for (let i = 0; i < Math.min(6, tagButtons.length); i++) {
      await user.click(tagButtons[i])
    }

    // Should show error for max tags
    await waitFor(() => {
      expect(screen.getByText(/maximum 5 tags/i)).toBeInTheDocument()
    })
  })
})
