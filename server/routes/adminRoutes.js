import express from 'express';
import {protectAdmin} from '../middleware/auth.js'
import { getAllBookings,getDashboardData,getAllShows,isAdmin } from '../controllers/adminController.js';
const adminRouter = express.Router();
// adminRouter.get('/is-admin',protectAdmin, isAdmin)
// adminRouter.get('/dashboard',protectAdmin,getDashboardData)
// adminRouter.get('/all-shows',protectAdmin, getAllShows)
// adminRouter.get('/all-bookings', protectAdmin,getAllBookings)
// Make for all user
adminRouter.get('/is-admin', isAdmin)
adminRouter.get('/dashboard',getDashboardData)
adminRouter.get('/all-shows', getAllShows)
adminRouter.get('/all-bookings', getAllBookings)

export default adminRouter;
