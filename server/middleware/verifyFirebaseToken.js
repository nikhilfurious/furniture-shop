const admin =  require("../config/firebaseAdmin");
const  User = require("../models/User");

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify Firebase Token
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;

    // Check if user exists in MongoDB
    let user = await User.findOne({ firebaseUID: decodedToken.uid });

    // If user does not exist, create one
    if (!user) {
      user = new User({
        firebaseUID: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.displname,
      });
      await user.save();
    }

    req.userDoc = user;
    next();
  } catch (error) {
    console.error("Firebase Verification Error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};


module.exports = verifyFirebaseToken;
