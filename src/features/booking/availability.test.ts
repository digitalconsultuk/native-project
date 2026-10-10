import { describe, expect, it } from 'vitest'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import {
  FIRST_BOOKABLE_HOUR,
  LAST_BOOKABLE_HOUR,
  getSelectableSlots,
  isTimeBooked,
  shouldDisableDate,
  shouldDisableTime,
} from './availability'
import type { AvailableTimeSlot } from '@/services/CalendarService'

dayjs.extend(utc)
dayjs.extend(timezone)

const STEP = 15
const london = (value: string) => dayjs.tz(value, 'Europe/London')
// "now" is Wednesday 15 July 2026, 14:20 in London (BST)
const NOW = london('2026-07-15T14:20')
const TODAY = london('2026-07-15')
const TOMORROW = london('2026-07-16')

const bookingAt = (londonTime: string): AvailableTimeSlot => {
  const start = london(londonTime)
  return { start: start.toISOString(), end: start.add(2, 'hour').toISOString() }
}

const format = (slots: Array<dayjs.Dayjs>) => slots.map((slot) => slot.format('HH:mm'))

describe('getSelectableSlots', () => {
  it('offers every 15 minutes from 13:00 up to and including 20:00 on a future day', () => {
    const slots = format(getSelectableSlots(TOMORROW, STEP, NOW))
    expect(slots[0]).toBe(`${FIRST_BOOKABLE_HOUR}:00`)
    expect(slots.at(-1)).toBe(`${LAST_BOOKABLE_HOUR}:00`)
    expect(slots).not.toContain('20:15')
    expect(slots).toHaveLength(29)
  })

  it('drops slots already in the past today', () => {
    const slots = format(getSelectableSlots(TODAY, STEP, NOW))
    expect(slots[0]).toBe('14:30')
    expect(slots).not.toContain('14:15')
    expect(slots).toHaveLength(23)
  })

  it('offers nothing once today\'s window has passed', () => {
    expect(getSelectableSlots(TODAY, STEP, london('2026-07-15T20:05'))).toEqual([])
  })

  it('falls back to a 30 minute step when no step is given', () => {
    expect(format(getSelectableSlots(TOMORROW, 0, NOW)).slice(0, 3)).toEqual(['13:00', '13:30', '14:00'])
  })
})

describe('isTimeBooked', () => {
  const booked = [bookingAt('2026-07-16T18:00')]

  it('matches the exact booked start', () => {
    expect(isTimeBooked(london('2026-07-16T18:00'), booked)).toBe(true)
  })

  it('does not block other slots inside the two hour booking', () => {
    expect(isTimeBooked(london('2026-07-16T18:15'), booked)).toBe(false)
    expect(isTimeBooked(london('2026-07-16T19:00'), booked)).toBe(false)
  })
})

describe('shouldDisableDate', () => {
  it('disables days before today', () => {
    expect(shouldDisableDate(london('2026-07-14'), [], STEP, NOW)).toBe(true)
  })

  it('keeps today and future days open when nothing is booked', () => {
    expect(shouldDisableDate(TODAY, [], STEP, NOW)).toBe(false)
    expect(shouldDisableDate(TOMORROW, [], STEP, NOW)).toBe(false)
  })

  it('disables today once the bookable window has passed', () => {
    expect(shouldDisableDate(TODAY, [], STEP, london('2026-07-15T21:00'))).toBe(true)
  })

  it('disables a day covered by an all-day closure', () => {
    const closure = {
      start: TOMORROW.startOf('day').toISOString(),
      end: TOMORROW.endOf('day').toISOString(),
    }
    expect(shouldDisableDate(TOMORROW, [closure], STEP, NOW)).toBe(true)
  })

  it('disables a day when every selectable slot is booked', () => {
    const fullyBooked = getSelectableSlots(TOMORROW, STEP, NOW).map((slot) => ({
      start: slot.toISOString(),
      end: slot.add(2, 'hour').toISOString(),
    }))
    expect(shouldDisableDate(TOMORROW, fullyBooked, STEP, NOW)).toBe(true)
  })

  it('keeps a day open when at least one slot is free', () => {
    const almostFull = getSelectableSlots(TOMORROW, STEP, NOW)
      .slice(1)
      .map((slot) => ({ start: slot.toISOString(), end: slot.add(2, 'hour').toISOString() }))
    expect(shouldDisableDate(TOMORROW, almostFull, STEP, NOW)).toBe(false)
  })
})

describe('shouldDisableTime', () => {
  const hourFifteenBooked = ['15:00', '15:15', '15:30', '15:45'].map((time) => bookingAt(`2026-07-16T${time}`))

  it('allows everything when no date is selected', () => {
    expect(shouldDisableTime(london('2026-07-16T15:00'), 'hours', null, hourFifteenBooked, STEP, NOW)).toBe(false)
  })

  it('disables an hour when every slot in it is booked', () => {
    expect(shouldDisableTime(london('2026-07-16T15:00'), 'hours', TOMORROW, hourFifteenBooked, STEP, NOW)).toBe(true)
    expect(shouldDisableTime(london('2026-07-16T16:00'), 'hours', TOMORROW, hourFifteenBooked, STEP, NOW)).toBe(false)
  })

  it('disables hours outside the bookable window', () => {
    expect(shouldDisableTime(london('2026-07-16T12:00'), 'hours', TOMORROW, [], STEP, NOW)).toBe(true)
    expect(shouldDisableTime(london('2026-07-16T21:00'), 'hours', TOMORROW, [], STEP, NOW)).toBe(true)
  })

  it('disables only the booked minute within an hour', () => {
    const booked = [bookingAt('2026-07-16T17:30')]
    expect(shouldDisableTime(london('2026-07-16T17:30'), 'minutes', TOMORROW, booked, STEP, NOW)).toBe(true)
    expect(shouldDisableTime(london('2026-07-16T17:45'), 'minutes', TOMORROW, booked, STEP, NOW)).toBe(false)
  })

  it('disables past minutes today', () => {
    expect(shouldDisableTime(london('2026-07-15T14:15'), 'minutes', TODAY, [], STEP, NOW)).toBe(true)
    expect(shouldDisableTime(london('2026-07-15T14:30'), 'minutes', TODAY, [], STEP, NOW)).toBe(false)
  })

  it('ignores other views', () => {
    expect(shouldDisableTime(london('2026-07-16T15:00'), 'seconds', TOMORROW, hourFifteenBooked, STEP, NOW)).toBe(false)
  })
})
