/*
 * For booking & notification email service
 * @params email, messageHTML
 * */

export const Send_Mail_Service = async (email: string, messageHTML: string) => {
  ///.netlify/functions/EmailFunction
  const response = await fetch("http://localhost:1571/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, messageHTML }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || `Failed to send email: ${response.statusText}`,
    );
  }
  return response;
};