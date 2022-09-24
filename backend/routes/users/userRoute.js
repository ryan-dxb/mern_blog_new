const express = require("express");
const {
  userRegisterCtrl,
  userLoginCtrl,
  allUsersCtrl,
  deleteUserCtrl,
  singleUserCtrl,
  userProfileCtrl,
} = require("../../controllers/users/userCtrl");
const authMiddleware = require("../../middlewares/auth/authMiddleware");

const userRoutes = express.Router();

userRoutes.post("/register", userRegisterCtrl);
userRoutes.post("/login", userLoginCtrl);
userRoutes.get("/allusers", authMiddleware, allUsersCtrl);
userRoutes.delete("/:id", deleteUserCtrl);
userRoutes.get("/:id", singleUserCtrl);

userRoutes.get("/profile/:id", authMiddleware, userProfileCtrl);

module.exports = userRoutes;
