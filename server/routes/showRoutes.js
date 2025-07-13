import express from 'express';
import { 
  addShow, 
  getNowPlayingMovies, 
  getShows 
} from '../controllers/showController.js';
import { protectAdmin } from '../middleware/auth.js';

const showRouter = express.Router();

// Get now playing movies from TMDB (admin-only to avoid misuse)
showRouter.get('/now-playing', protectAdmin, getNowPlayingMovies);

// Add new show to the database (admin-only)
showRouter.post('/add', protectAdmin, addShow);

// Get all upcoming shows (public)
showRouter.get('/all', getShows);

export default showRouter;
