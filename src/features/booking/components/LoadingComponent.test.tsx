import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoadingComponent } from './LoadingComponent'

describe('LoadingComponent', () => {
  it('renders nothing when not loading', () => {
    const { container } = render(<LoadingComponent isLoading={false} dataValue="Loading" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a polite status with the message when loading', () => {
    render(<LoadingComponent isLoading dataValue="Request is loading...." />)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveTextContent('Request is loading....')
  })
})
