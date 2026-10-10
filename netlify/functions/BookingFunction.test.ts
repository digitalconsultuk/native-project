// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Context } from '@netlify/functions'
import handler from './BookingFunction'

const { insert, GoogleAuth, calendar } = vi.hoisted(() => {
  const insert = vi.fn()
  return {
    insert,
    GoogleAuth: vi.fn(),
    calendar: vi.fn(() => ({ events: { insert } })),
  }
})

vi.mock('googleapis', () => ({
  google: { auth: { GoogleAuth }, calendar },
}))

const PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n'

const baseEnv: Record<string, string> = {
  GOOGLE_CALENDAR_ID: 'cal@group.calendar.google.com',
  GOOGLE_CLIENT_EMAIL: 'svc@project.iam.gserviceaccount.com',
  GOOGLE_CALENDAR_SCOPE: 'https://www.googleapis.com/auth/calendar',
  GOOGLE_EVENTS_SCOPE: 'https://www.googleapis.com/auth/calendar.events',
  GOOGLE_PRIVATE_KEY_B64: Buffer.from(PRIVATE_KEY).toString('base64'),
  GOOGLE_CALENDAR_IMPERSONATE_USER: 'owner@nativecave.com',
}

let env: Record<string, string | undefined>

const context = { server: {}, requestId: 'req-123' } as unknown as Context

const eventPayload = {
  summary: 'Reservation for Ada (2 guests)',
  start: { dateTime: '2026-07-16T19:00:00+01:00', timeZone: 'Europe/London' },
  end: { dateTime: '2026-07-16T21:00:00+01:00', timeZone: 'Europe/London' },
}

const post = (body: string) =>
  new Request('http://localhost/reservation', { method: 'POST', body })

describe('BookingFunction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    env = { ...baseEnv }
    vi.stubGlobal('Netlify', { env: { get: (name: string) => env[name] } })
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('rejects non-POST requests with 405', async () => {
    const response = await handler(new Request('http://localhost/reservation'), context)
    expect(response.status).toBe(405)
    expect(response.headers.get('allow')).toBe('POST')
    expect(insert).not.toHaveBeenCalled()
  })

  it('names every missing environment variable', async () => {
    env.GOOGLE_CALENDAR_ID = undefined
    env.GOOGLE_PRIVATE_KEY_B64 = ''
    const response = await handler(post(JSON.stringify(eventPayload)), context)

    expect(response.status).toBe(500)
    const { message } = await response.json()
    expect(message).toContain('GOOGLE_CALENDAR_ID')
    expect(message).toContain('GOOGLE_PRIVATE_KEY_B64')
    expect(message).not.toContain('GOOGLE_CLIENT_EMAIL')
    expect(insert).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid JSON', async () => {
    const response = await handler(post('{not json'), context)
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ message: 'Invalid JSON in request body' })
    expect(insert).not.toHaveBeenCalled()
  })

  it('authenticates with the decoded key and impersonated user, then inserts the event', async () => {
    insert.mockResolvedValue({ status: 200, data: { id: 'evt_1' } })
    const response = await handler(post(JSON.stringify(eventPayload)), context)

    expect(GoogleAuth).toHaveBeenCalledWith({
      credentials: { client_email: baseEnv.GOOGLE_CLIENT_EMAIL, private_key: PRIVATE_KEY },
      scopes: [baseEnv.GOOGLE_CALENDAR_SCOPE, baseEnv.GOOGLE_EVENTS_SCOPE],
      clientOptions: { subject: baseEnv.GOOGLE_CALENDAR_IMPERSONATE_USER },
    })
    expect(calendar).toHaveBeenCalledWith(expect.objectContaining({ version: 'v3' }))
    expect(insert).toHaveBeenCalledWith({
      calendarId: baseEnv.GOOGLE_CALENDAR_ID,
      sendUpdates: 'all',
      requestBody: eventPayload,
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('application/json')
    expect(response.headers.get('x-request-id')).toBe('req-123')
    expect(await response.json()).toEqual({ message: { id: 'evt_1' }, requestId: 'req-123' })
  })

  it('passes a non-200 status from Google through', async () => {
    insert.mockResolvedValue({ status: 409, data: {} })
    const response = await handler(post(JSON.stringify(eventPayload)), context)

    expect(response.status).toBe(409)
    const body = await response.json()
    expect(body.message).toContain('409')
    expect(body.requestId).toBe('req-123')
  })

  it('returns 500 without leaking the error when Google throws', async () => {
    insert.mockRejectedValue(new Error('invalid_grant: secret detail'))
    const response = await handler(post(JSON.stringify(eventPayload)), context)

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ message: 'Failed to create the calendar event', requestId: 'req-123' })
    expect(console.error).toHaveBeenCalledWith('invalid_grant: secret detail')
  })
})
