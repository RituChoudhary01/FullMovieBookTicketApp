import express from 'express';
import { getFavorites, getUserBookings, addFavorite } from '../controllers/userController.js';
const userRouter = express.Router();

// Get all bookings made by the user
userRouter.get('/booking', getUserBookings);

//  Add or remove a movie from user's favorites
userRouter.post('/update-favorite', addFavorite);

//  Get user's favorite movies
userRouter.get('/favorites', getFavorites);

export default userRouter;

