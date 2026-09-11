/**
 * To trigger a Google Calendar event, you need to use the Google Calendar API. The API allows you to create, read, update, and delete events on a user's calendar. To trigger an event, you would typically make a POST request to the API with the event details.
 *
 * The netlify function will handle the request to create a new event on the specified Google Calendar. It will use the Google Calendar API to create the event based on the provided details.
 *
 * The function will require the following information to create an event:
 * - Calendar ID
 * - Event details (summary, location, description, start time, end time)
 */

//import { Handler, HandlerContext, HandlerEvent } from "@netlify/functions";
import type { Context, Config } from "@netlify/functions";
import { google } from 'googleapis';

const jsonResponse = (
  body: Record<string, unknown>,
  status: number,
  headers: Record<string, string> = {},
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });

export default async (req: Request, context: Context) => {
  
  console.log("BookingFunction version:", context.server);

  if (req.method !== 'POST') {
    return jsonResponse({ message: "Method Not Allowed" }, 405, { allow: "POST" });
  }

  const calendarId = Netlify.env.get("GOOGLE_CALENDAR_ID");
  const clientEmail = Netlify.env.get("GOOGLE_CLIENT_EMAIL");
  const calendarScope = Netlify.env.get("GOOGLE_CALENDAR_SCOPE");
  const eventScope = Netlify.env.get("GOOGLE_EVENTS_SCOPE");
  const privateKeyB64 = Netlify.env.get("GOOGLE_PRIVATE_KEY_B64");
  const impersonateUser = Netlify.env.get("GOOGLE_CALENDAR_IMPERSONATE_USER")

  if (
    !calendarId ||
    !clientEmail ||
    !calendarScope ||
    !eventScope ||
    !privateKeyB64 ||
    !impersonateUser
  ) {
    const missingEnv = Object.entries({
      GOOGLE_CALENDAR_ID: calendarId,
      GOOGLE_CLIENT_EMAIL: clientEmail,
      GOOGLE_CALENDAR_SCOPE: calendarScope,
      GOOGLE_EVENTS_SCOPE: eventScope,
      GOOGLE_PRIVATE_KEY_B64: privateKeyB64,
      GOOGLE_CALENDAR_IMPERSONATE_USER: impersonateUser,
    })
      .filter(([, value]) => !value)
      .map(([name]) => name);

    return jsonResponse(
      {
        message: `Required Google Calendar environment variables are undefined on the server: ${missingEnv.join(", ")}`,
      },
      400,
    );
  }

  // Decode the base64-encoded private key - no JSON parsing needed
  const private_key = Buffer.from(privateKeyB64, 'base64').toString('utf8');

  let eventPayload: Record<string, unknown>;
  try {
    eventPayload = await req.json();
  } catch {
    return jsonResponse({ message: "Invalid JSON in request body" }, 400);
  }
  // 1. create event on the events endpoint
  try{
    const authentication = new google.auth.GoogleAuth({
      credentials:{
        client_email: clientEmail,
        private_key: private_key,
      },
      scopes: [calendarScope, eventScope],
      clientOptions:{
        subject: impersonateUser
      }
     });

     const createCalendarClient = google.calendar({version:'v3',auth:authentication});
     const createdEvent = await createCalendarClient.events.insert({
            calendarId: calendarId,
            sendUpdates:"all",
            requestBody: eventPayload
           });

      if(createdEvent.status === 200){
        return jsonResponse(
          { message: createdEvent.data, requestId: context.requestId },
          200,
          { "x-request-id": context.requestId },
        );
      }

      return jsonResponse(
        {
          message: `Event cannot be created due to issues ${createdEvent.status}. please investigate`,
          requestId: context.requestId,
        },
        createdEvent.status,
        { "x-request-id": context.requestId },
      );

  }
  catch(error){
     const message = error instanceof Error ? error.message : error
     console.error(message)
     return jsonResponse(
       { message: "Failed to create the calendar event", requestId: context.requestId },
       500,
       { "x-request-id": context.requestId },
     );
  }
};
