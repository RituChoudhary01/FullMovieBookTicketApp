import Stripe from 'stripe';
import Booking from '../models/Booking.js';
import { inngest } from '../inngest/index.js';
console.log("Weebhook file is run");
export const stripeWebhooks = async (req, res) => {
  console.log("Weebhook functions  is run");
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    // Construct the Stripe event from raw body
    event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);


  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;

        // Get the session from Stripe to retrieve metadata
        const sessionList = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id,
        });

        const session = sessionList.data[0];
        const { bookingId } = session.metadata;

      console.log("Stripe Session:", session);
       console.log("Metadata:", session?.metadata);
       console.log("Booking ID:", session?.metadata?.bookingId);

        // Update booking status
        await Booking.findByIdAndUpdate(bookingId, {
          isPaid: true,
          paymentLink: "",
        }); 
        // Send Inngest event to trigger follow-up processing
        await inngest.send({
          name: 'app/show.booked',
          data: { bookingId },
        });

        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook processing failed:", err.message);
    res.status(500).send("Webhook handler error");
  }
  console.log("Hey is sonne error");
};



