import express from 'express';
import { 
  addShow, 
  getNowPlayingMovies, 
  getShows,
  getShow
} from '../controllers/showController.js';
import { protectAdmin } from '../middleware/auth.js';

const showRouter = express.Router();

// Get now playing movies from TMDB (admin-only to avoid misuse)
// protectAdmin
// showRouter.get('/now-playing',protectAdmin, getNowPlayingMovies);
showRouter.get('/now-playing',getNowPlayingMovies);

// Add new show to the database (admin-only)
showRouter.post('/add',addShow);

// Get all upcoming shows (public)
showRouter.get('/all', getShows);
showRouter.get('/:movieId', getShow);
export default showRouter;
