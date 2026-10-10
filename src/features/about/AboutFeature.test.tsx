import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderWithRouter } from '@/_tests_/utils'
import type { CalendarEventItem } from '@services/CalendarService'
import { fetchPublicEvents } from '@services/CalendarService'
import { AboutFeature } from './AboutFeature'

vi.mock('@services/CalendarService', () => ({
  fetchPublicEvents: vi.fn(),
}))

const mockedFetch = vi.mocked(fetchPublicEvents)

const withEvents = (events: Array<CalendarEventItem>) => {
  mockedFetch.mockImplementation(async (_calendarId, _apiKey, setEvents) => {
    setEvents(events)
    return events
  })
}

describe('AboutFeature', () => {
  beforeEach(() => {
    mockedFetch.mockReset()
    vi.stubEnv('VITE_GOOGLE_API_KEY', 'test-key')
    vi.stubEnv('VITE_GOOGLE_CALENDAR_ID', 'test-calendar')
  })

  it('renders the story and links Learn More to home', () => {
    withEvents([])
    renderWithRouter(<AboutFeature />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Authentic Flavors from the Deep Blue')
    expect(screen.getByAltText('Our Culinary Heritage')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Learn More' })).toHaveAttribute('href', '/home')
  })

  it('warns and does not fetch when the env vars are missing', () => {
    vi.stubEnv('VITE_GOOGLE_API_KEY', '')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    renderWithRouter(<AboutFeature />)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('VITE_GOOGLE_API_KEY'))
    expect(mockedFetch).not.toHaveBeenCalled()
  })

  it('fetches events with the configured calendar and key', () => {
    withEvents([])
    renderWithRouter(<AboutFeature />)
    expect(mockedFetch).toHaveBeenCalledWith('test-calendar', 'test-key', expect.any(Function))
  })

  it('hides the events panel when there are no events', () => {
    withEvents([])
    renderWithRouter(<AboutFeature />)
    expect(screen.queryByText('Upcoming Events:')).not.toBeInTheDocument()
  })

  it('lists upcoming events with timed, all-day and missing dates', async () => {
    const dateTime = '2026-07-20T19:00:00+01:00'
    withEvents([
      { id: '1', summary: 'Jazz night', start: { dateTime } },
      { id: '2', summary: 'Closed for training', start: { date: '2026-07-21' } },
      { id: '3' },
    ])
    renderWithRouter(<AboutFeature />)

    expect(await screen.findByText('Upcoming Events:')).toBeInTheDocument()
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    const expectedTime = new Date(dateTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    expect(items[0]).toHaveTextContent(`Jazz night — ${expectedTime}`)
    expect(items[1]).toHaveTextContent('Closed for training — 2026-07-21')
    expect(items[2]).toHaveTextContent('Event — Date TBA')
  })
})
