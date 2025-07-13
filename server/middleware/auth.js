import { clerkClient } from '@clerk/express';

export const protectAdmin = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    const user = await clerkClient.users.getUser(userId);

    if (user.privateMetadata.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    // If admin, allow next middleware or controller
    next();
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};