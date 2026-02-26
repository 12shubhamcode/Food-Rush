const express = require("express");
const isAuth = require("../middleware/isAuth");
const {
  register,
  login,
  logout,
  getCurrentUser,
  updateUserLocation,
} = require("../controller/user");

const router = express.Router();

// router.post("/register", register);
// router.post("/login", login);
// router.get("/logout", logout);
router.get("/current", isAuth, getCurrentUser);
router.post("/update-location", isAuth, updateUserLocation);

module.exports = router;
