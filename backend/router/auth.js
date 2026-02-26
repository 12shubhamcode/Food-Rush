const express = require("express");
const {
  register,
  login,
  logout,
  sendOtp,
  verifyOtp,
  resetPassword,
  googleAuth,
} = require("../controller/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/google-auth", googleAuth);

module.exports = router;
