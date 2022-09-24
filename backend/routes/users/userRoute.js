const express = require("express");
const {
  userRegisterCtrl,
  userLoginCtrl,
  allUsersCtrl,
  deleteUserCtrl,
  singleUserCtrl,
} = require("../../controllers/users/userCtrl");

const userRoutes = express.Router();

userRoutes.post("/register", userRegisterCtrl);
userRoutes.post("/login", userLoginCtrl);
userRoutes.get("/allusers", allUsersCtrl);
userRoutes.delete("/:id", deleteUserCtrl);
userRoutes.get("/:id", singleUserCtrl);

module.exports = userRoutes;
