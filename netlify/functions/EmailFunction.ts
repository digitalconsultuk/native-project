import { Handler,HandlerContext,HandlerEvent} from "@netlify/functions";
import { Resend } from 'resend';

declare const process: any;

export const handler: Handler = async (event:HandlerEvent, context:HandlerContext) => {
  
  const resend = new Resend(process.env.VITE_RESEND_API_KEY);
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  };

  const { email, messageHTML } = JSON.parse(event.body || '{}');
  const { data, error } = await resend.emails.send({
    from: 'DigitalConsultUK <remi.osisanya@digitalconsult.uk>',
    to: [email],
    subject: 'Native-Cave Booking',
    html: messageHTML,
  });
  if (error) throw new Error(`Error sending email: ${error.message} \n status-code: ${error.statusCode}`);
  return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent successfully", data:{ data }}),
    };
}