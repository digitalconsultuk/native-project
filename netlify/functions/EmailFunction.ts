import { Handler,HandlerContext,HandlerEvent} from "@netlify/functions";
import { Resend } from 'resend';

declare const process: any;

export const handler: Handler = async (event:HandlerEvent, context:HandlerContext) => {
  
  const resend = new Resend(process.env.VITE_RESEND_API_KEY);
  let email: string;
  let messageHTML: string;

  try {
    const parsed = JSON.parse(event.body || '{}');
    email = parsed.email;
    messageHTML = parsed.messageHTML;
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid JSON in request body" }),
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  if (!email || !messageHTML) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing email or messageHTML in request body" }),
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'DigitalConsultUK <remi.osisanya@digitalconsult.uk>',
      to: [email],
      subject: 'Native-Cave Booking',
      html: messageHTML,
    });
    if (error) {
      return {
        statusCode: error.statusCode || 500,
        body: JSON.stringify({ message: `Error sending email: ${error.message}` }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent successfully", data: { data } }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Internal Server Error: ${err.message}` }),
    };
  }
}