import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ModalComponent } from './ModalComponent'

describe('ModalComponent', () => {
  it('shows the menu text when open', () => {
    render(<ModalComponent open menu="Grilled prawns" onClose={vi.fn()} />)
    expect(screen.getByText('Grilled prawns')).toBeInTheDocument()
  })

  it('renders nothing when closed', () => {
    render(<ModalComponent open={false} menu="Grilled prawns" onClose={vi.fn()} />)
    expect(screen.queryByText('Grilled prawns')).not.toBeInTheDocument()
  })

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn()
    render(<ModalComponent open menu="Grilled prawns" onClose={onClose} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })
})
