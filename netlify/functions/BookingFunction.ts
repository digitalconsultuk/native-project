/**
 * To trigger a Google Calendar event, you need to use the Google Calendar API. The API allows you to create, read, update, and delete events on a user's calendar. To trigger an event, you would typically make a POST request to the API with the event details.
 *
 * The netlify function will handle the request to create a new event on the specified Google Calendar. It will use the Google Calendar API to create the event based on the provided details.
 *
 * The function will require the following information to create an event:
 * - Calendar ID
 * - Event details (summary, location, description, start time, end time)
 */

import { Handler, HandlerContext, HandlerEvent } from "@netlify/functions";
import { google } from 'googleapis';

 declare const process: any;

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  console.log("BookingFunction version:", context.functionVersion);

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const calendarScope = process.env.GOOGLE_CALENDAR_SCOPE;
  const eventScope = process.env.GOOGLE_EVENTS_SCOPE;
  const privateKeyB64 = process.env.GOOGLE_PRIVATE_KEY_B64;
  const impersonateUser = process.env.GOOGLE_CALENDAR_IMPERSONATE_USER

  if (!calendarId || !clientEmail || !calendarScope || !eventScope || !privateKeyB64 || !impersonateUser) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Required Google Calendar environment variables (calendarId, clientEmail, privateKeyB64, calendarScope, eventScope) are undefined on the server",
      }),
    };
  }

  // Decode the base64-encoded private key - no JSON parsing needed
  const private_key = Buffer.from(privateKeyB64, 'base64').toString('utf8');

  let eventPayload: Record<string, unknown>;
  try {
    eventPayload = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid JSON in request body" }),
    };
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
     const createdEvent = createCalendarClient.events.insert({
            calendarId: calendarId,
            sendUpdates:"all",
            requestBody: eventPayload
           });
      if((await createdEvent).status == 200){
        return{
          statusCode: 200,
          request_ID: context.awsRequestId,
          body: JSON.stringify({message: (await createdEvent).data})
        }
      }
      return {
        statusCode: (await createdEvent).status,
        request_ID: context.awsRequestId,
        body: JSON.stringify({message: `Event cannot be created due to issues ${(await createdEvent).status}. please investigate`})
      }
      
  }
  catch(error){
     const message = error instanceof Error ? error.message : error
     console.error(message)
     throw error
  }
};