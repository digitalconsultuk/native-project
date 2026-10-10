import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { renderWithRouter } from '@/_tests_/utils'
import { FooterComponent } from './FooterComponent'

describe('FooterComponent', () => {
  it('shows the current year in the copyright line', () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2031-03-01T12:00:00Z'))
    renderWithRouter(<FooterComponent />)
    expect(screen.getByText(/2031 Native Cave/)).toBeInTheDocument()
  })

  it('renders the quick links', () => {
    renderWithRouter(<FooterComponent />)
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/home')
    expect(screen.getByRole('link', { name: 'About Us' })).toHaveAttribute('href', '/home#about')
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact')
    expect(screen.getByRole('link', { name: 'Our Menu' })).toHaveAttribute('href', '/home#menusection')
  })

  it('renders the services and contact details', () => {
    renderWithRouter(<FooterComponent />)
    expect(screen.getByText('Fine Dining')).toBeInTheDocument()
    expect(screen.getByText('hello@nativecave.com')).toBeInTheDocument()
  })
})
