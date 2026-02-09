import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

let client: twilio.Twilio | null = null;

function getClient(): twilio.Twilio | null {
  if (!accountSid || !authToken) {
    console.warn('Twilio credentials not configured, WhatsApp messages will be logged only');
    return null;
  }
  if (!client) {
    client = twilio(accountSid, authToken);
  }
  return client;
}

export interface SendResult {
  success: boolean;
  sid?: string;
  error?: string;
}

export async function sendWhatsApp(to: string, body: string): Promise<SendResult> {
  const twilioClient = getClient();
  const whatsappTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

  if (!twilioClient) {
    console.log(`[WhatsApp Mock] To: ${whatsappTo} | Body: ${body}`);
    return { success: true, sid: `mock_${Date.now()}` };
  }

  try {
    const message = await twilioClient.messages.create({
      from: fromNumber,
      to: whatsappTo,
      body,
    });
    return { success: true, sid: message.sid };
  } catch (error: any) {
    console.error(`WhatsApp send failed to ${whatsappTo}:`, error.message);
    return { success: false, error: error.message };
  }
}
