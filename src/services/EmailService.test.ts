import { describe, expect, it, vi } from 'vitest'
import { Send_Mail_Service } from './EmailService'

const mockFetch = (response: Partial<Response>) => {
  const fetchMock = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('Send_Mail_Service', () => {
  it('posts the email and html to /send-email', async () => {
    const response = { ok: true, status: 200 }
    const fetchMock = mockFetch(response)

    await expect(Send_Mail_Service('a@b.com', '<p>hi</p>')).resolves.toBe(response)
    expect(fetchMock).toHaveBeenCalledWith('/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com', messageHTML: '<p>hi</p>' }),
    })
  })

  it('throws the error message from the response body', async () => {
    mockFetch({ ok: false, statusText: 'Bad Request', json: () => Promise.resolve({ message: 'invalid email' }) })
    await expect(Send_Mail_Service('x', 'y')).rejects.toThrow('invalid email')
  })

  it('falls back to statusText when the body has no message', async () => {
    mockFetch({ ok: false, statusText: 'Server Error', json: () => Promise.resolve({}) })
    await expect(Send_Mail_Service('x', 'y')).rejects.toThrow('Failed to send email: Server Error')
  })
})
