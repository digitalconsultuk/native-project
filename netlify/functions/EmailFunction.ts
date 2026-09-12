import { Config, Context } from "@netlify/functions";
import { Resend } from 'resend';

declare const process: any;

export default async (req: Request, context:Context) => {

  console.log(context.server);

    const apiKey = process.env.VITE_RESEND_API_KEY;

  if(!apiKey){
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Resend API key is not defined in environment variables" }),
    };
  }
  const resend = new Resend(apiKey);

  let email: string;
  let messageHTML: string;

  try {
    const parsed = await req.json();
    email = parsed.email;
    messageHTML = parsed.messageHTML;
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid JSON in request body" }),
    };
  }

  if (req.method !== 'POST') {
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
      to: [email,'remi.osisanya@digitalconsult.uk'],
      subject: 'Native-Cave Booking',
      html: messageHTML,
    });
    if (error) {
      return {
        statusCode: error.statusCode ?? 500,
        body: JSON.stringify({ message: `Error sending email: ${error.message}` }),
      };
    }
    return new Response(JSON.stringify({message:"Email sent successfully", data}),{status:200, statusText:"OK"})
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Internal Server Error: ${err.message}` }),
    };
  }
}

// path alias
 export const config:Config = {
  path: "/send-email",
 }