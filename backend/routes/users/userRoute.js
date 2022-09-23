const express = require("express");
const { userRegisterCtrl } = require("../../controllers/users/userCtrl");

const userRoutes = express.Router();

userRoutes.post("/register", userRegisterCtrl);

module.exports = userRoutes;
