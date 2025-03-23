const admin = require("firebase-admin");
const User = require("../models/User.js");

const checkAdmin = async (req, res, next) => {
  try {
    // Get the token from request headers
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided",token });

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebaseUID = decodedToken.uid;

    // Find user in MongoDB
    const user = await User.findOne({ firebaseUID });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if user is an admin
    if (!user.isAdmin) return res.status(403).json({ message: "Access denied" });

    // Attach user to request and proceed
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token", error: error.message });
  }
};

module.exports = checkAdmin;
