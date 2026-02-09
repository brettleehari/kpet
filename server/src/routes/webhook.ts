import { Router, Request, Response } from 'express';
import { processInboundResponse } from '../services/poll';

const router = Router();

// Twilio inbound WhatsApp webhook
router.post('/twilio', async (req: Request, res: Response) => {
  try {
    const { From, Body } = req.body;

    if (!From || !Body) {
      res.status(400).send('<Response></Response>');
      return;
    }

    const replyMessage = await processInboundResponse(From, Body);

    // Respond with TwiML
    res.type('text/xml');
    res.send(`<Response><Message>${replyMessage}</Message></Response>`);
  } catch (error) {
    console.error('Webhook error:', error);
    res.type('text/xml');
    res.send('<Response><Message>An error occurred processing your response.</Message></Response>');
  }
});

export default router;
