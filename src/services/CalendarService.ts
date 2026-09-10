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
  const minDateTime = new Date(new Date().setHours(0, 0, 0)).toISOString(); // today at 00:00
   // 2. Set maximum time to 1 month from today at 23:59:59
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 1);
  const maxDateTime = new Date(maxDate.setHours(23, 59, 59)).toISOString();

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
     const createEventRequest = fetch('/.netlify/functions/BookingFunction', {
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