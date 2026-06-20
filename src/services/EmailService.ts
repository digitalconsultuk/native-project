
/*
* For booking & notification email service
* @params email, messageHTML 
* */
export const Send_Mail_Service = async (email: string, messageHTML: string) => {
  await fetch('/.netlify/functions/EmailFunction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, messageHTML }),
    })
}