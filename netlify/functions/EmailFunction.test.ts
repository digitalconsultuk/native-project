// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Context } from '@netlify/functions'
import handler from './EmailFunction'

const send = vi.fn()
vi.mock('resend', () => ({
  Resend: class {
    emails = { send }
  },
}))

const context = { server: {} } as unknown as Context

const post = (body: string) =>
  new Request('http://localhost/send-email', { method: 'POST', body })

const validBody = JSON.stringify({ email: 'ada@example.com', messageHTML: '<p>hi</p>' })

describe('EmailFunction', () => {
  beforeEach(() => {
    send.mockReset()
    vi.stubEnv('VITE_RESEND_API_KEY', 're_test')
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('rejects non-POST requests with 405', async () => {
    const response = await handler(new Request('http://localhost/send-email'), context)
    expect(response.status).toBe(405)
    expect(response.headers.get('allow')).toBe('POST')
  })

  it('returns 500 with a JSON message when the API key is missing', async () => {
    vi.stubEnv('VITE_RESEND_API_KEY', '')
    const response = await handler(post(validBody), context)
    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ message: 'Resend API key is not defined in environment variables' })
  })

  it('returns 400 for invalid JSON', async () => {
    const response = await handler(post('{not json'), context)
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ message: 'Invalid JSON in request body' })
  })

  it('returns 400 when email or messageHTML is missing', async () => {
    const response = await handler(post(JSON.stringify({ email: 'ada@example.com' })), context)
    expect(response.status).toBe(400)
  })

  it('sends the email and returns 200', async () => {
    send.mockResolvedValue({ data: { id: 'email_1' }, error: null })
    const response = await handler(post(validBody), context)

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('application/json')
    expect(await response.json()).toEqual({ message: 'Email sent successfully', data: { id: 'email_1' } })
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ html: '<p>hi</p>', to: expect.arrayContaining(['ada@example.com']) }))
  })

  it('passes a Resend error through with its status code', async () => {
    send.mockResolvedValue({ data: null, error: { statusCode: 422, message: 'Invalid `to` field' } })
    const response = await handler(post(validBody), context)
    expect(response.status).toBe(422)
    expect(await response.json()).toEqual({ message: 'Error sending email: Invalid `to` field' })
  })

  it('returns 500 when Resend throws', async () => {
    send.mockRejectedValue(new Error('network down'))
    const response = await handler(post(validBody), context)
    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ message: 'Internal Server Error: network down' })
  })
})
