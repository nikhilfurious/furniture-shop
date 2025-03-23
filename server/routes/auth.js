const express = require("express");
const User = require("../models/User.js");
const verifyFirebaseToken = require("../middleware/verifyFirebaseToken.js");
const router = express.Router();

router.post("/login", verifyFirebaseToken, (req, res) => {
  res.json({ message: "Login successful", user: req.userDoc });
});


router.get("/profile", verifyFirebaseToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ isAdmin: user.isAdmin });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;

