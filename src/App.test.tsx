import { act, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithRouter } from '@/_tests_/utils'
import App from './App'

// The pages are covered by their own feature tests; here we only check routing and scrolling.
vi.mock('./pages/HomePage', () => ({
  HomePage: () => <div id="menusection">home page</div>,
}))
vi.mock('./pages/BookingPage', () => ({
  BookingPage: () => <div>booking page</div>,
}))
vi.mock('./pages/ContactPage.tsx', () => ({
  ContactPage: () => <div>contact page</div>,
}))

describe('App', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    Element.prototype.scrollIntoView = vi.fn()
  })

  it('redirects / to the home page', () => {
    renderWithRouter(<App />, { route: '/' })
    expect(screen.getByText('home page')).toBeInTheDocument()
  })

  it.each([
    ['/booking', 'booking page'],
    ['/contact', 'contact page'],
  ])('renders %s', (route, text) => {
    renderWithRouter(<App />, { route })
    expect(screen.getByText(text)).toBeInTheDocument()
  })

  it('renders the header, mobile nav and footer on every page', () => {
    renderWithRouter(<App />, { route: '/contact' })
    expect(screen.getByRole('button', { name: 'menu' })).toBeInTheDocument()
    expect(screen.getByText(/Native Cave. All rights reserved/)).toBeInTheDocument()
  })

  it('scrolls to the top when there is no hash', () => {
    renderWithRouter(<App />, { route: '/home' })
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('scrolls the hash target into view after a short delay', () => {
    vi.useFakeTimers()
    renderWithRouter(<App />, { route: '/home#menusection' })
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    expect(window.scrollTo).not.toHaveBeenCalled()
  })
})
