import { Config, Context } from "@netlify/functions";
import { Resend } from 'resend';

declare const process: { env: Record<string, string | undefined> };

// Functions with a default export must answer with a Response; a plain { statusCode, body }
// object is the legacy handler format and reaches the browser as a generic server error.
const jsonResponse = (
  body: Record<string, unknown>,
  status: number,
  headers: Record<string, string> = {},
) =>
    new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });

export default async (req: Request, context:Context) => {

  console.log(context.server);

  if (req.method !== 'POST') {
    return jsonResponse({ message: "Method Not Allowed" }, 405, { allow: "POST" });
  }

  const apiKey = process.env.VITE_RESEND_API_KEY;

  if(!apiKey){
    return jsonResponse({ message: "Resend API key is not defined in environment variables" }, 500);
  }
  const resend = new Resend(apiKey);

  let email: string;
  let messageHTML: string;

  try {
    const parsed = await req.json();
    email = parsed.email;
    messageHTML = parsed.messageHTML;
  } catch {
    return jsonResponse({ message: "Invalid JSON in request body" }, 400);
  }

  if (!email || !messageHTML) {
    return jsonResponse({ message: "Missing email or messageHTML in request body" }, 400);
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'DigitalConsultUK <remi.osisanya@digitalconsult.uk>',
      to: [email,'remi.osisanya@digitalconsult.uk'],
      subject: 'Native-Cave Booking',
      html: messageHTML,
    });
    if (error) {
      return jsonResponse({ message: `Error sending email: ${error.message}` }, error.statusCode ?? 500);
    }
    return jsonResponse({ message: "Email sent successfully", data }, 200);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return jsonResponse({ message: `Internal Server Error: ${message}` }, 500);
  }
}

// path alias
 export const config:Config = {
  path: "/send-email",
 }
