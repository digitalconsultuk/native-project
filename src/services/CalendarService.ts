/**
 * For Calendar Service, we will use the Google Calendar API to fetch public events from a specified calendar.
 * The service will handle the API requests and return the events in a structured format.
 * 
 * Note: Ensure that the Google Calendar API is enabled in your Google Cloud project and that you have a valid API key.
 */


/**
 * Model for a Calendar Event fetched from Google Calendar API.
 * This interface represents the structure of the event data we expect to receive.
 */

import { formatDateTimeForCalendarwithOffSet, dateTimeSplitter, convertDateTimeToLondonWith2HoursAdded } from "@/utils/DateUtils";
import  dayjs  from 'dayjs';
import  utc  from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone'

 export interface CalendarEventItem {
  id?: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  status?: string;
  created?: string;
  updated?: string;
 }
 dayjs.extend(utc)
 dayjs.extend(timezone)
/**
 * Retrieves public events from specified Google Calendar via events endpoint.
 * @param calendarId - The ID of the Google Calendar to check for availability.
 * @param apiKey - The API key for accessing the Google Calendar API.
 */
export const fetchPublicEvents = async (calendarId: string, apiKey: string, setEvents: (events: Array<CalendarEventItem>) => void): Promise<Array<CalendarEventItem>> => {
  try {
    const now = new Date().toISOString();
    const params : Record<string, string> = {
      timeMin:`${now}`,singleEvents:"true",orderBy:"startTime",maxResults:"20"
    }
    const queryParams = new URLSearchParams(params)
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${queryParams}`;
    
    const response = await fetch(url,{
      method:"GET",
      headers:{
        "Content-Type":"application/json",
        "x-goog-api-key":apiKey
      }
    });
    if (!response.ok || response.status !== 200) {
      throw new Error(`Google Calendar API request failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    const eventItemsList: Array<CalendarEventItem> = data.items || [];
    setEvents(eventItemsList);
    console.log('Public Calendar Events:', data);
    return eventItemsList;
  } catch (error) {
    console.error('Error fetching public calendar events:', error);
    return [];
  }
};




// model for the freeBusy response
interface FreeBusyResponse {
  kind: string;
  timeMin: string;
  timeMax: string;
  calendars: {
    [calendarId: string]: {
      busy: Array<{ start: string; end: string }>;
    };
  };
}
// model for the available time slots
export interface AvailableTimeSlot {
  start: string;
  end: string;
} 
// model for the freeBusy request
interface FreeBusyRequest {
  timeMin: string;
  timeMax: string;
  timeZone: string;
  groupExpansionMax: number;
  calendarExpansionMax: number;
  items: Array<{ id: string }>;
}

/**
 * Retrieves available booking slots from google freeBusy API for a given calendar and time range.
 * @param calendarId - The ID of the Google Calendar to check for availability.
 * @param apiKey - The API key for accessing the Google Calendar API.
 */
export const fetchAvailableBookingSlots = async (_calendarId: string, _apiKey: string): Promise<Array<AvailableTimeSlot>> => {

    // 1. Set minimum time to today at 00:00
  const minDateTime = dayjs().startOf('day').format("YYYY-MM-DDTHH:mm:ssZ"); // today at 00:00
   // 2. Set maximum time to 1 month from today at 23:59:59. This has to be a rolling month,
   // not endOf('month') - on the 28th that would only look 2 days ahead and every booking
   // past it would still read as free.
  const maxDateTime = dayjs().add(1, 'month').endOf('day').format("YYYY-MM-DDTHH:mm:ssZ");

    const url = `https://www.googleapis.com/calendar/v3/freeBusy`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': `${_apiKey}`,
      },
      body: JSON.stringify({
        timeMin: minDateTime,
        timeMax: maxDateTime,
        timeZone: 'Europe/London',
        groupExpansionMax: 10,
        calendarExpansionMax: 10,
        items: [{ id: _calendarId }],
      } as FreeBusyRequest),
    });

    if (!response.ok || response.status !== 200) {
      throw new Error(`Google Calendar API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const bookedDateTimeResponse: FreeBusyResponse = data;
    const bookedTimeSlots: Array<AvailableTimeSlot> = bookedDateTimeResponse.calendars[_calendarId]?.busy || [];
    return bookedTimeSlots;
}

/**
 * Retrieves the individual booked slots from the events endpoint for a given calendar.
 *
 * The freeBusy endpoint cannot be used for this: it returns *merged* busy windows, so two
 * reservations that overlap (a booking runs for 2 hours while slots are 15 minutes apart, so
 * overlap is the normal case here) come back as a single block. Only the merged block's start
 * is then known, and every later reservation inside it reads as free again on the TimePicker.
 * The events endpoint keeps one entry per reservation, which is what the exact-start check in
 * BookingForm needs.
 *
 * @param calendarId - The ID of the Google Calendar to check for availability.
 * @param apiKey - The API key for accessing the Google Calendar API.
 */
export const fetchBookedEventSlots = async (_calendarId: string, _apiKey: string): Promise<Array<AvailableTimeSlot>> => {
  const params: Record<string, string> = {
    timeMin: dayjs().startOf('day').format("YYYY-MM-DDTHH:mm:ssZ"),
    timeMax: dayjs().add(1, 'month').endOf('day').format("YYYY-MM-DDTHH:mm:ssZ"),
    singleEvents: "true",
    orderBy: "startTime",
    showDeleted: "false",
    maxResults: "2500",
  };
  const queryParams = new URLSearchParams(params);
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(_calendarId)}/events?${queryParams}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': `${_apiKey}`,
    },
  });

  if (!response.ok || response.status !== 200) {
    throw new Error(`Google Calendar API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const eventItems: Array<CalendarEventItem> = data.items || [];

  return eventItems.reduce<Array<AvailableTimeSlot>>((slots, item) => {
    if (item.status === "cancelled") {
      return slots;
    }
    // A timed event carries start.dateTime; an all-day closure carries start.date instead.
    if (item.start?.dateTime && item.end?.dateTime) {
      slots.push({
        start: dayjs(item.start.dateTime).toISOString(),
        end: dayjs(item.end.dateTime).toISOString(),
      });
      return slots;
    }
    if (item.start?.date && item.end?.date) {
      // Google's all-day end.date is exclusive, so step back a day before taking the end of it.
      // This lands on the exact London day boundaries shouldDisableDate compares against.
      slots.push({
        start: dayjs.tz(item.start.date, "Europe/London").startOf('day').toISOString(),
        end: dayjs.tz(item.end.date, "Europe/London").subtract(1, 'day').endOf('day').toISOString(),
      });
    }
    return slots;
  }, []);
}

// event request model for creating a new event on the specified Google Calendar
export interface CreateEventRequest {
  summary: string;
  location?: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end?: {
    dateTime?: string;
    timeZone?: string;
  };
}

// create an event on the specified Google Calendar using the events via netlify function endpoint
export const createCalendarBookingEvent = async (_event: CreateEventRequest): Promise<any> => {

  // Derive end time as start + 2hrs (end may not be set by the caller)
  // const startMs = new Date(_event.start.dateTime).getTime();
  // const dateTimeUTCWith2hrs = new Date(startMs + 2 * 60 * 60 * 1000).toISOString();
  const dateTimeWith2hrs = convertDateTimeToLondonWith2HoursAdded(_event.start.dateTime)

  // split datetime for function formatDateTimeForCalendarwithOffSet below
  const [dateValue,timeValue] = dateTimeSplitter(dateTimeWith2hrs)
  const dateTimeWithOffset = formatDateTimeForCalendarwithOffSet(dateValue,timeValue);
  _event.end = {
    dateTime: dateTimeWithOffset,
    timeZone: _event.start.timeZone,
  };
  try{
    ///.netlify/functions/BookingFunction
     const createEventRequest = fetch(`${import.meta.env.VITE_URL}/reservation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(_event),
    });
    const dataResponse = await createEventRequest;
    if (!dataResponse.ok) throw new Error(`Google Calendar API request failed: ${dataResponse.status} ${dataResponse.statusText}`);
    return dataResponse;
  }
  catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error creating calendar event:', message);
    throw error; 
  }
}