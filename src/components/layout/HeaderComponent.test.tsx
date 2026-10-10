import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithRouter } from '@/_tests_/utils'
import { HeaderComponent } from './HeaderComponent'

describe('HeaderComponent', () => {
  it('links the logo to home and shows the phone number', () => {
    renderWithRouter(<HeaderComponent />)
    expect(screen.getByAltText('native_logo').closest('a')).toHaveAttribute('href', '/home')
    expect(screen.getByText('01913434344')).toBeInTheDocument()
  })

  it('renders the nav links', () => {
    renderWithRouter(<HeaderComponent />)
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/home')
    expect(screen.getByRole('link', { name: 'Menu' })).toHaveAttribute('href', '/home#menusection')
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact')
  })

  it('highlights the active route', () => {
    renderWithRouter(<HeaderComponent />, { route: '/contact' })
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveClass('text-amber-500')
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveClass('text-amber-500')
  })
})
