import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithRouter } from '@/_tests_/utils'
import MobileNavigation from './MobileComponent'

describe('MobileNavigation', () => {
  it('keeps the drawer closed at first', () => {
    renderWithRouter(<MobileNavigation />)
    expect(screen.queryByText('Services')).not.toBeInTheDocument()
  })

  it('opens the drawer with links to each section', async () => {
    renderWithRouter(<MobileNavigation />)
    await userEvent.click(screen.getByRole('button', { name: 'menu' }))

    const linkFor = (text: string) => screen.getByText(text).closest('a')
    expect(linkFor('Home')).toHaveAttribute('href', '/home')
    expect(linkFor('Menu')).toHaveAttribute('href', '/home#menusection')
    expect(linkFor('Services')).toHaveAttribute('href', '/home#service')
    expect(linkFor('Contact')).toHaveAttribute('href', '/contact')
  })

  it('closes the drawer when an item is clicked', async () => {
    renderWithRouter(<MobileNavigation />)
    await userEvent.click(screen.getByRole('button', { name: 'menu' }))
    await userEvent.click(screen.getByText('Services'))
    await waitFor(() => expect(screen.queryByText('Services')).not.toBeInTheDocument())
  })
})
