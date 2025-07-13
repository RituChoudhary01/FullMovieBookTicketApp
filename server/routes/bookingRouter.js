import express from 'express';
import { createBooking , getOccupiedSeats} from '../controllers/bookingController.js'
const BookingRouter = express.Router();
BookingRouter.post('/create',createBooking);
BookingRouter.get('/seats/:showId',getOccupiedSeats)

export default BookingRouter;
