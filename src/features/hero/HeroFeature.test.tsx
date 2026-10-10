import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithRouter } from '@/_tests_/utils'
import { HeroFeature } from './HeroFeature'

describe('HeroFeature', () => {
  it('renders the headline and hero image', () => {
    renderWithRouter(<HeroFeature />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Bold Flavors,Fresh Catches')
    expect(screen.getByAltText('Delicious Gourmet Seafood')).toBeInTheDocument()
  })

  it('links Book Now to the booking page', () => {
    renderWithRouter(<HeroFeature />)
    expect(screen.getByRole('link', { name: 'Book Now' })).toHaveAttribute('href', '/booking')
  })
})
