/**
 * Booking availability rules used by the BookingForm date and time pickers.
 * Kept free of React so the rules can be unit tested with a fixed "now".
 */
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { TimeView } from "@mui/x-date-pickers";
import type { AvailableTimeSlot } from "@/services/CalendarService";

dayjs.extend(utc);
dayjs.extend(timezone);

// Bookable window in Europe/London: first selectable hour and last selectable hour.
// These must stay in sync with the TimePicker minTime/maxTime in BookingForm, otherwise a date
// can look available because of a free slot the TimePicker never offers.
export const FIRST_BOOKABLE_HOUR = 13;
export const LAST_BOOKABLE_HOUR = 20;

// Availability is decided from the busy block's start only, never its end. A reservation
// runs for two hours on the calendar, but the restaurant seats other parties during that
// window, so the rest of the 15 minute slots must stay selectable - only the exact slot
// already taken is blocked. Whole-day closures are handled by the all-day check in
// shouldDisableDate below, which is the one place that does need the end.
export const isTimeBooked = (target: Dayjs, bookedSlots: Array<AvailableTimeSlot>): boolean => {
  return bookedSlots.some((slot) => target.isSame(dayjs(slot.start).tz("Europe/London"), "minute"));
};

// The slots the TimePicker can actually offer for a given day: inside the bookable
// window, on the picker's step granularity, and in the future when the day is today.
export const getSelectableSlots = (day: Dayjs, stepMinutes: number, now: Dayjs = dayjs()): Array<Dayjs> => {
  const londonDay = day.tz("Europe/London");
  const londonNow = now.tz("Europe/London");
  const isToday = londonDay.isSame(londonNow, "day");
  const step = stepMinutes || 30;
  const slots: Array<Dayjs> = [];

  for (let h = FIRST_BOOKABLE_HOUR; h <= LAST_BOOKABLE_HOUR; h++) {
    for (let m = 0; m < 60; m += step) {
      // the closing hour only offers the slot on the hour (see maxTime on the TimePicker)
      if (h === LAST_BOOKABLE_HOUR && m > 0) {
        break;
      }
      const candidate = londonDay.hour(h).minute(m).second(0).millisecond(0);
      if (isToday && candidate.isBefore(londonNow)) {
        continue;
      }
      slots.push(candidate);
    }
  }

  return slots;
};

export const shouldDisableDate = (
  day: Dayjs,
  bookedSlots: Array<AvailableTimeSlot>,
  stepMinutes: number,
  now: Dayjs = dayjs()
): boolean => {
  const londonDay = day.tz("Europe/London");
  const londonNow = now.tz("Europe/London");

  if (londonDay.isBefore(londonNow.startOf("day"))) {
    return true;
  }

  // Check if the entire day is covered by an all-day busy event
  const dayStart = londonDay.startOf("day");
  const dayEnd = londonDay.endOf("day");

  const isAllDayBooked = bookedSlots.some((slot) => {
    const start = dayjs(slot.start).tz("Europe/London");
    const end = dayjs(slot.end).tz("Europe/London");
    return (start.isSame(dayStart) || start.isBefore(dayStart)) && (end.isSame(dayEnd) || end.isAfter(dayEnd));
  });

  if (isAllDayBooked) {
    return true;
  }

  // Disable the date when the bookable window has already passed (today) or when
  // every slot the TimePicker would offer on it is already booked.
  const selectableSlots = getSelectableSlots(londonDay, stepMinutes, now);

  return selectableSlots.length === 0 || selectableSlots.every((candidate) => isTimeBooked(candidate, bookedSlots));
};

export const shouldDisableTime = (
  value: Dayjs,
  view: TimeView,
  selectedDay: Dayjs | null,
  bookedSlots: Array<AvailableTimeSlot>,
  stepMinutes: number,
  now: Dayjs = dayjs()
): boolean => {
  if (!selectedDay) return false;

  const selectedDate = selectedDay.tz("Europe/London");
  const londonNow = now.tz("Europe/London");
  const isToday = selectedDate.isSame(londonNow, "day");

  if (view === "hours") {
    const hour = value.tz("Europe/London").hour();
    const slotsInHour = getSelectableSlots(selectedDate, stepMinutes, now).filter((candidate) => candidate.hour() === hour);

    return slotsInHour.length === 0 || slotsInHour.every((candidate) => isTimeBooked(candidate, bookedSlots));
  }

  if (view === "minutes") {
    const candidate = selectedDate
      .hour(value.tz("Europe/London").hour())
      .minute(value.tz("Europe/London").minute())
      .second(0)
      .millisecond(0);

    if (isToday && candidate.isBefore(londonNow)) {
      return true;
    }

    return isTimeBooked(candidate, bookedSlots);
  }

  return false;
};
