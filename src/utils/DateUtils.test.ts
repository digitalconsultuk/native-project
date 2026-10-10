import { describe, expect, it, vi } from 'vitest'
import {
  convertDateTimeToLondonWith2HoursAdded,
  dateTimeSplitter,
  formatDateTimeForCalendarwithOffSet,
} from './DateUtils'

describe('formatDateTimeForCalendarwithOffSet', () => {
  it('uses +00:00 during GMT (winter)', () => {
    expect(formatDateTimeForCalendarwithOffSet('2026-01-15', '18:30')).toBe('2026-01-15T18:30:00+00:00')
  })

  it('uses +01:00 during BST (summer)', () => {
    expect(formatDateTimeForCalendarwithOffSet('2026-07-15', '13:15')).toBe('2026-07-15T13:15:00+01:00')
  })
})

describe('dateTimeSplitter', () => {
  it('splits date and time and drops a positive offset', () => {
    expect(dateTimeSplitter('2026-07-15T15:15:00+01:00')).toEqual(['2026-07-15', '15:15:00'])
  })

  it('splits a +00:00 value', () => {
    expect(dateTimeSplitter('2026-01-15T20:30:00+00:00')).toEqual(['2026-01-15', '20:30:00'])
  })

  it('returns an empty array and logs for a null input', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    // @ts-expect-error - guarding a runtime null
    expect(dateTimeSplitter(null)).toEqual([])
    expect(error).toHaveBeenCalled()
  })
})

describe('convertDateTimeToLondonWith2HoursAdded', () => {
  it('adds two hours in winter', () => {
    expect(convertDateTimeToLondonWith2HoursAdded('2026-01-15T18:30:00+00:00')).toBe('2026-01-15T20:30:00+00:00')
  })

  it('adds two hours in summer and keeps the BST offset', () => {
    expect(convertDateTimeToLondonWith2HoursAdded('2026-07-15T19:00:00+01:00')).toBe('2026-07-15T21:00:00+01:00')
  })

  it('rolls over midnight', () => {
    expect(convertDateTimeToLondonWith2HoursAdded('2026-01-15T23:00:00+00:00')).toBe('2026-01-16T01:00:00+00:00')
  })

  it('converts a UTC input into London time', () => {
    expect(convertDateTimeToLondonWith2HoursAdded('2026-07-15T12:00:00Z')).toBe('2026-07-15T15:00:00+01:00')
  })
})
