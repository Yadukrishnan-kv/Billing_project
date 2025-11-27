// routes/adminRoutes.js
const express = require("express");
const router = express.Router();

// ✅ Import ALL needed controller functions
const { 
  registerAdmin, 
  loginAdmin, 
  getMe, 
  changePassword,editProfile
} = require("../controllers/adminController");

const protect = require('../middleware/authMiddleware');

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/viewloginedprofile", protect, getMe); // ✅ Now getMe is defined
router.put("/change-password", protect, changePassword);
router.put("/editprofile", protect, editProfile); // ← Add this line

module.exports = router;