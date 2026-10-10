import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'react-toastify'
import type { Dayjs } from 'dayjs'
import { createCalendarBookingEvent, fetchBookedEventSlots } from '@/services/CalendarService'
import { Send_Mail_Service } from '@/services/EmailService'
import { BookingForm } from './BookingForm'

vi.mock('@/services/CalendarService', () => ({
  fetchBookedEventSlots: vi.fn(),
  createCalendarBookingEvent: vi.fn(),
}))
vi.mock('@/services/EmailService', () => ({
  Send_Mail_Service: vi.fn(),
}))
vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
  ToastContainer: () => null,
}))

type PickerStubProps = {
  value: Dayjs | null
  onChange: (value: Dayjs | null) => void
  disabled?: boolean
}

// The MUI pickers are replaced by plain inputs so the form logic can be driven directly.
// Their availability rules are covered in availability.test.ts.
vi.mock('@mui/x-date-pickers/DatePicker', async () => {
  const { default: dayjs } = await import('dayjs')
  return {
    DatePicker: ({ value, onChange, disabled }: PickerStubProps) => (
      <input
        aria-label="Booking date"
        disabled={disabled}
        value={value ? value.format('YYYY-MM-DD') : ''}
        onChange={(e) => onChange(e.target.value ? dayjs(e.target.value) : null)}
      />
    ),
  }
})
vi.mock('@mui/x-date-pickers/TimePicker', async () => {
  const { default: dayjs } = await import('dayjs')
  return {
    TimePicker: ({ value, onChange }: PickerStubProps) => (
      <input
        aria-label="Booking time"
        value={value ? value.format('HH:mm') : ''}
        onChange={(e) => onChange(e.target.value ? dayjs(`2000-01-01T${e.target.value}`) : null)}
      />
    ),
  }
})

const mockedFetchSlots = vi.mocked(fetchBookedEventSlots)
const mockedCreateEvent = vi.mocked(createCalendarBookingEvent)
const mockedSendMail = vi.mocked(Send_Mail_Service)

const submitButton = () => screen.getByRole('button', { name: /Confirm Reservation/ })

const renderLoaded = async () => {
  render(<BookingForm />)
  await waitFor(() => expect(screen.getByLabelText('Booking date')).toBeEnabled())
}

// set in one go: the stand-in pickers are controlled and would reformat each keystroke
const pickDateAndTime = () => {
  fireEvent.change(screen.getByLabelText('Booking date'), { target: { value: '2026-07-16' } })
  fireEvent.change(screen.getByLabelText('Booking time'), { target: { value: '19:00' } })
}

const fillForm = async () => {
  const user = userEvent.setup()
  await user.type(screen.getByRole('textbox', { name: /Full Name/ }), 'Ada Lovelace')
  await user.type(screen.getByRole('textbox', { name: /Email Address/ }), 'ada@example.com')
  await user.type(screen.getByRole('textbox', { name: /Phone Number/ }), '07700900123')
  pickDateAndTime()
  await user.type(screen.getByRole('textbox', { name: /Special Requests/ }), 'Window seat')
  return user
}

describe('BookingForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('VITE_GOOGLE_API_KEY', 'test-key')
    vi.stubEnv('VITE_GOOGLE_CALENDAR_ID', 'test-calendar')
    mockedFetchSlots.mockResolvedValue([])
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('loading booked slots', () => {
    it('keeps the date picker disabled until the booked slots arrive', async () => {
      let resolveSlots!: (slots: []) => void
      mockedFetchSlots.mockReturnValue(new Promise((resolve) => { resolveSlots = resolve }))
      render(<BookingForm />)

      expect(screen.getByLabelText('Booking date')).toBeDisabled()
      resolveSlots([])
      await waitFor(() => expect(screen.getByLabelText('Booking date')).toBeEnabled())
      expect(mockedFetchSlots).toHaveBeenCalledWith('test-calendar', 'test-key')
    })

    it('enables the date picker and logs when the env vars are missing', async () => {
      vi.stubEnv('VITE_GOOGLE_CALENDAR_ID', '')
      await renderLoaded()
      expect(mockedFetchSlots).not.toHaveBeenCalled()
      expect(console.error).toHaveBeenCalledWith('Could not read Google API key or calendarID')
    })

    it('still enables the date picker when the fetch fails', async () => {
      mockedFetchSlots.mockRejectedValue(new Error('offline'))
      await renderLoaded()
      expect(console.error).toHaveBeenCalledWith('Failed to fetch available booked slots', expect.any(Error))
    })
  })

  it('defaults to 2 guests', async () => {
    await renderLoaded()
    expect(screen.getByRole('combobox', { name: /Number of Guests/ })).toHaveTextContent('2 Guests')
  })

  it('enables Confirm only once name, date, time and special request are filled', async () => {
    await renderLoaded()
    const user = userEvent.setup()
    expect(submitButton()).toBeDisabled()

    await user.type(screen.getByRole('textbox', { name: /Full Name/ }), 'Ada')
    pickDateAndTime()
    expect(submitButton()).toBeDisabled()

    await user.type(screen.getByRole('textbox', { name: /Special Requests/ }), 'Window seat')
    expect(submitButton()).toBeEnabled()
  })

  it('creates the calendar event, sends the email, shows success and resets the form', async () => {
    mockedCreateEvent.mockResolvedValue({ ok: true } as Response)
    mockedSendMail.mockResolvedValue({ ok: true, status: 200 } as Response)
    await renderLoaded()
    const user = await fillForm()

    await user.click(submitButton())

    await waitFor(() => expect(toast.success).toHaveBeenCalled())
    expect(mockedCreateEvent).toHaveBeenCalledWith(expect.objectContaining({
      summary: 'Reservation for Ada Lovelace (2 guests)',
      start: { dateTime: '2026-07-16T19:00:00+01:00', timeZone: 'Europe/London' },
    }))
    expect(mockedCreateEvent.mock.calls[0][0].description).toContain('Email: ada@example.com')
    expect(mockedSendMail).toHaveBeenCalledWith('ada@example.com', expect.stringContaining('Ada Lovelace'))
    expect(vi.mocked(toast.success).mock.calls[0][0]).toContain('2 guests on 2026-07-16 at 19:00')

    expect(screen.getByRole('textbox', { name: /Full Name/ })).toHaveValue('')
    expect(screen.getByLabelText('Booking date')).toHaveValue('')
    // the booked slots are refetched so the new booking is blocked straight away
    await waitFor(() => expect(mockedFetchSlots).toHaveBeenCalledTimes(2))
  })

  it('shows the loading overlay while the booking is in flight', async () => {
    let resolveEvent!: (value: Response) => void
    mockedCreateEvent.mockReturnValue(new Promise((resolve) => { resolveEvent = resolve }))
    await renderLoaded()
    const user = await fillForm()

    await user.click(submitButton())
    expect(await screen.findByRole('status')).toHaveTextContent('Request is loading....')

    resolveEvent({ ok: false } as Response)
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
  })

  it('shows an error toast and keeps the form when the calendar rejects the booking', async () => {
    mockedCreateEvent.mockResolvedValue({ ok: false } as Response)
    await renderLoaded()
    const user = await fillForm()

    await user.click(submitButton())

    await waitFor(() => expect(toast.error).toHaveBeenCalled())
    expect(vi.mocked(toast.error).mock.calls[0][0]).toContain('Network Issues')
    expect(mockedSendMail).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox', { name: /Full Name/ })).toHaveValue('Ada Lovelace')
  })

  it('shows the unexpected-error toast when the request throws', async () => {
    mockedCreateEvent.mockRejectedValue(new Error('boom'))
    await renderLoaded()
    const user = await fillForm()

    await user.click(submitButton())

    await waitFor(() => expect(toast.error).toHaveBeenCalled())
    expect(vi.mocked(toast.error).mock.calls[0][0]).toContain('unexpected error')
  })

  describe('when the booking is created but the confirmation email fails', () => {
    beforeEach(() => {
      mockedCreateEvent.mockResolvedValue({ ok: true } as Response)
    })

    it('warns the guest, resets the form and refreshes the slots when the email service throws', async () => {
      mockedSendMail.mockRejectedValue(new Error('Failed to send email: Bad Gateway'))
      await renderLoaded()
      const user = await fillForm()

      await user.click(submitButton())

      await waitFor(() => expect(toast.warning).toHaveBeenCalled())
      const message = vi.mocked(toast.warning).mock.calls[0][0]
      expect(message).toContain('has been received')
      expect(message).toContain('could not send your confirmation email')
      expect(toast.error).not.toHaveBeenCalled()
      expect(toast.success).not.toHaveBeenCalled()
      expect(console.error).toHaveBeenCalledWith('Email service failed:', expect.any(Error))
      expect(screen.getByRole('textbox', { name: /Full Name/ })).toHaveValue('')
      await waitFor(() => expect(mockedFetchSlots).toHaveBeenCalledTimes(2))
    })

    it('warns the guest when the email service responds with a failure', async () => {
      mockedSendMail.mockResolvedValue({ ok: false, status: 502, statusText: 'Bad Gateway' } as Response)
      await renderLoaded()
      const user = await fillForm()

      await user.click(submitButton())

      await waitFor(() => expect(toast.warning).toHaveBeenCalled())
      expect(console.error).toHaveBeenCalledWith('Email service failed:', 502, 'Bad Gateway')
      expect(toast.error).not.toHaveBeenCalled()
    })
  })
})
