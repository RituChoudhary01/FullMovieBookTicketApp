// import { clerkClient } from "@clerk/express";
// import Movie from "../models/Movie";

// // API controller function to get user Booking
// export const getUserBookings = async(req,res)=>{
// try{
//   const user = req.auth().userId;
//   const bookings = await Booking.find({user}).populate({
//     path:'show',
//     populate:{path:'movie'}
//   }).sort({createdAt: -1})
// res.json({success:true,bookings})
// } catch(error){
//   console.error(error.message);
//   res.json({success:false,message:error.message});
// }
// }
// // API Controller Function to add Favorite Movie in Clerk User Metadata
// export const addFavorite = async(req,res)=>{
//   try{
//     const { movieId } = req.body;
//     const userId = req.auth().userId;
//     const user = await clerkClient.users.getUser(userId)
//     if(!user.privateMetadata.favorites){
//       user.privateMetadata.favorites = []
//     }
//     if(!user.privateMetadata.favorites){
//       user.privateMetadata.favorites = []
//     }
//     if(!user.privateMetadata.favorites.includes(movieId)){
//       user.privateMetadata.favorites.push(movieId)
//     }else{
//       user.privateMetadata.favorites = user.privateMetadata.favorites.filter(item => item != movieId)
//     }
//     await clerkClient.users.updateUserMetadata(userId,{privateMetadata:user.privateMetadata})
//     res.json({success:true, message:'Favorite movies updated'})
//     }catch(error){
//   console.error(error.message);
//   res.json({success:false,message:error.message});
// }
// }

// export const getFavorites = async(req, res)=>{
//   try{
//      const user = await clerkClient.users.getUser(req.auth().userId)
//      const favorites = user.privateMetadata.favorites;
//     // Getting movies from database
//     const movies = await Movie.find({_id:{$in: favorites}})
//     res.json({success:true, movies})

//   } catch(error){
//     console.error(error.message);
//     res.json({success:false,message:error.message});
//   }
// }

import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";

//  API to get all bookings for a logged-in user
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.auth().userId;

    const bookings = await Booking.find({ user: userId })
      .populate({
        path: 'show',
        populate: { path: 'movie' }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to add/remove favorite movies in Clerk metadata
export const addFavorite = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.auth().userId;

    const user = await clerkClient.users.getUser(userId);

    const currentFavorites = user.privateMetadata.favorites || [];

    let updatedFavorites;

    if (currentFavorites.includes(movieId)) {
      updatedFavorites = currentFavorites.filter(id => id !== movieId);
    } else {
      updatedFavorites = [...currentFavorites, movieId];
    }

    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...user.privateMetadata,
        favorites: updatedFavorites
      }
    });

    res.json({ success: true, message: "Favorite movies updated" });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};

//  API to fetch all favorite movies for the logged-in user
export const getFavorites = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const user = await clerkClient.users.getUser(userId);
    const favorites = user.privateMetadata.favorites || [];

    const movies = await Movie.find({ _id: { $in: favorites } });

    res.json({ success: true, movies });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
};
