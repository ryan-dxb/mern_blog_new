const express = require("express");
const {
  userRegisterCtrl,
  userLoginCtrl,
  allUsersCtrl,
  deleteUserCtrl,
  singleUserCtrl,
  userProfileCtrl,
  updateProfileCtrl,
  updatePasswordCtrl,
} = require("../../controllers/users/userCtrl");
const authMiddleware = require("../../middlewares/auth/authMiddleware");

const userRoutes = express.Router();

userRoutes.post("/register", userRegisterCtrl);
userRoutes.post("/login", userLoginCtrl);
userRoutes.get("/allusers", authMiddleware, allUsersCtrl);
userRoutes.delete("/:id", deleteUserCtrl);
userRoutes.get("/:id", singleUserCtrl);

userRoutes.get("/profile/:id", authMiddleware, userProfileCtrl);
userRoutes.put("/profile/:id", authMiddleware, updateProfileCtrl);
userRoutes.put("/profile/password/:id/", authMiddleware, updatePasswordCtrl);

module.exports = userRoutes;
