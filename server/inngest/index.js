import { Inngest } from "inngest";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import User from "../models/User.js";
import sendEmail from "../configs/nodeMailer.js";

export const inngest = new Inngest({ id: "movie-ticket-booking" });

// 1. Sync Clerk user on creation
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      image: image_url,
    };
    await User.create(userData);
  }
);

// 2. Delete Clerk user
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  }
);

// 3. Update Clerk user
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    const userData = {
      email: email_addresses[0].email_address,
      name: first_name + " " + last_name,
      image: image_url,
    };
    await User.findByIdAndUpdate(id, userData);
  }
);

// 4. Cancel unpaid booking after 10 mins
const releaseSeatsAndDeleteBooking = inngest.createFunction(
  { id: "release-delete-booking" },
  { event: "app/checkpayment" },
  async ({ event, step }) => {
    const bookingId = event.data.bookingId;
    const tenMinutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil("wait-for-10-minutes", tenMinutesLater);

    await step.run("check-payment-status", async () => {
      const booking = await Booking.findById(bookingId);
      if (!booking.isPaid) {
        const show = await Show.findById(booking.show);
        booking.bookedSeats.forEach((seat) => {delete show.occupiedSeats[seat]});
        show.markModified("occupiedSeats");
        await booking.save();
        await show.save();
        await Booking.findByIdAndDelete(booking._id);
      }
    });
  }
);

// 5. Send booking confirmation email
const sendBookingConfirmationEmail = inngest.createFunction(
  { id: "send-booking-confirmation-email" },
  { event: "app/show.booked" },
  async ({ event }) => {
    const { bookingId } = event.data;
    const booking = await Booking.findById(bookingId).populate({ path: "show", populate: { path: "movie",model:"Movie"}}).populate("user");

    await sendEmail({
      to: booking.user.email,
      subject: `Payment Confirmation: "${booking.show.movie.title}" booked!`,
      body: `<div style='font-family:Arial, sans-serif; line-height:1.5;'>
        <h2>Hi ${booking.user.name},</h2>
        <p>Your booking for <strong style='color:#f84565;'>\"${booking.show.movie.title}\"</strong> is confirmed.</p>
        <p><strong>Date:</strong> ${new Date(booking.show.showDateTime).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })}<br/>
        <strong>Time:</strong> ${new Date(booking.show.showDateTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })}</p>
        <p>Enjoy the show!</p>
        <p>Thanks for booking with us!<br/>- QuickShow Team</p>
      </div>`
    });
  }
);

// 6. Send show reminders every 8 hours
const sendShowReminders = inngest.createFunction(
  { id: "send-show-reminders" },
  { cron: "0 */8 * * *" },
  async ({ step }) => {
    const now = new Date();
    const in8Hours = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const windowStart = new Date(in8Hours.getTime() - 10 * 60 * 1000);

    const reminderTasks = await step.run("prepare-reminder-tasks", async () => {
      const shows = await Show.find({
        showDateTime: { $gte: windowStart, $lte: in8Hours },
      }).populate("movie");

      const tasks = [];
      for (const show of shows) {
        if (!show.movie || !show.occupiedSeats) continue;
        const userIds = [...new Set(Object.values(show.occupiedSeats))];
        if (!userIds.length) continue;

        const users = await User.find({ _id: { $in: userIds } }).select("name email");
        for (const user of users) {
          tasks.push({
            userEmail: user.email,
            userName: user.name,
            movieTitle: show.movie.title,
            showTime: show.showDateTime,
          });
        }
      }
      return tasks;
    });

    if (!reminderTasks.length) return { sent: 0, message: "No reminders to send." };

    const result = await step.run("send-all-reminders", async () => {
      return await Promise.allSettled(
        reminderTasks.map(task => sendEmail({
          to: task.userEmail,
          subject: `Reminder: Your movie \"${task.movieTitle}\" starts soon!`,
          body: `<div style='font-family:Arial, sans-serif;'>
            <h2>Hi ${task.userName},</h2>
            <p>This is a quick reminder that your movie:</p>
            <h3 style='color:#F84565;'>\"${task.movieTitle}\"</h3>
            <p><strong>Date:</strong> ${new Date(task.showTime).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' })}<br/>
            <strong>Time:</strong> ${new Date(task.showTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })}</p>
            <p>It starts in approximately <strong>8 hours</strong>. Be ready!</p>
            <p>Enjoy the show!<br/>QuickShow Team</p>
          </div>`
        }))
      );
    });

    const sent = result.filter(r => r.status === "fulfilled").length;
    const failed = result.length - sent;
    return { sent, failed, message: `Sent ${sent} reminder(s), ${failed} failed.` };
  }
);

// 7. Send notifications when new show is added
const sendNewShowNotifications = inngest.createFunction(
  { id: "send-new-show-notifications" },
  { event: "app/show.added" },
  async ({ event }) => {
    const { movieTitle } = event.data;
    const users = await User.find({});

    for (const user of users) {
      await sendEmail({
        to: user.email,
        subject: `New Show Added: ${movieTitle}`,
        body: `<div style='font-family:Arial,sans-serif; padding:20px;'>
          <h2>Hi ${user.name},</h2>
          <p>We've just added a new show:</p>
          <h3 style='color:#F84565;'>\"${movieTitle}\"</h3>
          <p>Visit our website to book your seats now.</p>
          <p>Thanks,<br/>QuickShow Team</p>
        </div>`
      });
    }

    return { message: "Notifications sent." };
  }
);

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  releaseSeatsAndDeleteBooking,
  sendBookingConfirmationEmail,
  sendShowReminders,
  sendNewShowNotifications
];
