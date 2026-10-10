import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createCalendarBookingEvent,
  fetchAvailableBookingSlots,
  fetchBookedEventSlots,
  fetchPublicEvents,
  type CreateEventRequest,
} from './CalendarService'

const jsonResponse = (body: unknown, init: { ok?: boolean; status?: number; statusText?: string } = {}) => ({
  ok: init.ok ?? true,
  status: init.status ?? 200,
  statusText: init.statusText ?? 'OK',
  json: () => Promise.resolve(body),
})

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchPublicEvents', () => {
  it('requests the events endpoint with the api key header and hands items to setEvents', async () => {
    const items = [{ id: '1', summary: 'Jazz night' }]
    fetchMock.mockResolvedValue(jsonResponse({ items }))
    const setEvents = vi.fn()

    const result = await fetchPublicEvents('cal@group.calendar.google.com', 'KEY', setEvents)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/calendars/cal%40group.calendar.google.com/events?')
    expect(url).toContain('singleEvents=true')
    expect(init.headers['x-goog-api-key']).toBe('KEY')
    expect(setEvents).toHaveBeenCalledWith(items)
    expect(result).toEqual(items)
  })

  it('returns an empty list when the response has no items', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}))
    const setEvents = vi.fn()
    await expect(fetchPublicEvents('cal', 'KEY', setEvents)).resolves.toEqual([])
    expect(setEvents).toHaveBeenCalledWith([])
  })

  it('returns an empty list and does not call setEvents on a failed request', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, { ok: false, status: 403, statusText: 'Forbidden' }))
    const setEvents = vi.fn()
    await expect(fetchPublicEvents('cal', 'KEY', setEvents)).resolves.toEqual([])
    expect(setEvents).not.toHaveBeenCalled()
  })
})

describe('fetchAvailableBookingSlots', () => {
  it('posts a freeBusy request and returns the busy slots for the calendar', async () => {
    const busy = [{ start: '2026-07-15T18:00:00Z', end: '2026-07-15T20:00:00Z' }]
    fetchMock.mockResolvedValue(jsonResponse({ calendars: { cal: { busy } } }))

    await expect(fetchAvailableBookingSlots('cal', 'KEY')).resolves.toEqual(busy)

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://www.googleapis.com/calendar/v3/freeBusy')
    expect(init.method).toBe('POST')
    const body = JSON.parse(init.body)
    expect(body.items).toEqual([{ id: 'cal' }])
    expect(body.timeZone).toBe('Europe/London')
  })

  it('returns an empty list when the calendar is missing from the response', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ calendars: {} }))
    await expect(fetchAvailableBookingSlots('cal', 'KEY')).resolves.toEqual([])
  })

  it('throws on a non-200 response', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, { ok: false, status: 500, statusText: 'Server Error' }))
    await expect(fetchAvailableBookingSlots('cal', 'KEY')).rejects.toThrow('500 Server Error')
  })
})

describe('fetchBookedEventSlots', () => {
  it('maps timed events, maps all-day events to London day bounds and skips cancelled ones', async () => {
    fetchMock.mockResolvedValue(jsonResponse({
      items: [
        { status: 'confirmed', start: { dateTime: '2026-07-15T19:00:00+01:00' }, end: { dateTime: '2026-07-15T21:00:00+01:00' } },
        { status: 'cancelled', start: { dateTime: '2026-07-15T20:00:00+01:00' }, end: { dateTime: '2026-07-15T22:00:00+01:00' } },
        // all-day closure on 20 July; Google's end.date is exclusive
        { status: 'confirmed', start: { date: '2026-07-20' }, end: { date: '2026-07-21' } },
        { status: 'confirmed', start: {}, end: {} },
      ],
    }))

    await expect(fetchBookedEventSlots('cal', 'KEY')).resolves.toEqual([
      { start: '2026-07-15T18:00:00.000Z', end: '2026-07-15T20:00:00.000Z' },
      { start: '2026-07-19T23:00:00.000Z', end: '2026-07-20T22:59:59.999Z' },
    ])

    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toContain('/calendars/cal/events?')
    expect(url).toContain('showDeleted=false')
    expect(init.headers['x-goog-api-key']).toBe('KEY')
  })

  it('returns an empty list when there are no items', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}))
    await expect(fetchBookedEventSlots('cal', 'KEY')).resolves.toEqual([])
  })

  it('throws on a non-200 response', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, { ok: false, status: 404, statusText: 'Not Found' }))
    await expect(fetchBookedEventSlots('cal', 'KEY')).rejects.toThrow('404 Not Found')
  })
})

describe('createCalendarBookingEvent', () => {
  const makeEvent = (): CreateEventRequest => ({
    summary: 'Reservation for Ada (2 guests)',
    start: { dateTime: '2026-07-15T19:00:00+01:00', timeZone: 'Europe/London' },
  })

  it('adds an end two hours after the start and posts to /reservation', async () => {
    const response = { ok: true, status: 200 }
    fetchMock.mockResolvedValue(response)
    const event = makeEvent()

    await expect(createCalendarBookingEvent(event)).resolves.toBe(response)

    expect(event.end).toEqual({ dateTime: '2026-07-15T21:00:00+01:00', timeZone: 'Europe/London' })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/reservation')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body)).toEqual(event)
  })

  it('throws when the function responds with an error', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 400, statusText: 'Bad Request' })
    await expect(createCalendarBookingEvent(makeEvent())).rejects.toThrow('400 Bad Request')
  })

  it('rethrows network errors', async () => {
    fetchMock.mockRejectedValue(new Error('offline'))
    await expect(createCalendarBookingEvent(makeEvent())).rejects.toThrow('offline')
  })
})
