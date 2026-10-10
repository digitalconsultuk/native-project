import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MenuGrid } from './MenuGrid'

const SALAD_TEXT = 'showSalad Menu to add prices and menu'

describe('MenuGrid', () => {
  it('renders the menu heading and six cards', () => {
    render(<MenuGrid />)
    expect(screen.getByRole('heading', { level: 1, name: 'Menu' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'View' })).toHaveLength(6)
    expect(screen.getByRole('heading', { level: 2, name: 'Grill' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Vegetarian' })).toBeInTheDocument()
  })

  it('opens the grill menu in the modal', async () => {
    render(<MenuGrid />)
    await userEvent.click(screen.getAllByRole('button', { name: 'View' })[0])
    expect(await screen.findByText(/showGrill Menu/)).toBeInTheDocument()
  })

  it('opens the salad menu for the vegetarian card', async () => {
    render(<MenuGrid />)
    await userEvent.click(screen.getAllByRole('button', { name: 'View' })[1])
    expect(await screen.findByText(SALAD_TEXT)).toBeInTheDocument()
  })

  it('closes the modal on Escape', async () => {
    render(<MenuGrid />)
    await userEvent.click(screen.getAllByRole('button', { name: 'View' })[1])
    await screen.findByText(SALAD_TEXT)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByText(SALAD_TEXT)).not.toBeInTheDocument())
  })

  it('alerts when share is clicked', async () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {})
    render(<MenuGrid />)
    await userEvent.click(screen.getAllByTestId('ShareIcon')[0])
    expect(alert).toHaveBeenCalledWith('Share functionality API needed')
  })
})
