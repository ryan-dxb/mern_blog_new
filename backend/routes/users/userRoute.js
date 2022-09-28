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
  followingUserCtrl,
  unFollowingUserCtrl,
  blockUserCtrl,
  unBlockUserCtrl,
  generateVerificationTokenCtrl,
  accountVerificationCtrl,
  forgetPasswordTokenCtrl,
  passwordResetCtrl,
  profilePhotoUploadCtrl,
} = require("../../controllers/users/userCtrl");
const authMiddleware = require("../../middlewares/auth/authMiddleware");
const {
  photoUpload,
  profilePhotoResize,
} = require("../../middlewares/uploads/photoUpload");

const userRoutes = express.Router();

userRoutes.post("/register", userRegisterCtrl);
userRoutes.post("/login", userLoginCtrl);
userRoutes.get("/allusers", authMiddleware, allUsersCtrl);
userRoutes.delete("/:id", deleteUserCtrl);
userRoutes.get("/:id", singleUserCtrl);

userRoutes.get("/profile/:id", authMiddleware, userProfileCtrl);
userRoutes.put("/profile/:id", authMiddleware, updateProfileCtrl);
userRoutes.put("/profile/password/:id/", authMiddleware, updatePasswordCtrl);

userRoutes.put("/follow", authMiddleware, followingUserCtrl);
userRoutes.put("/unfollow", authMiddleware, unFollowingUserCtrl);

userRoutes.put("/block-user/:id", authMiddleware, blockUserCtrl);
userRoutes.put("/unblock-user/:id", authMiddleware, unBlockUserCtrl);

userRoutes.post(
  "/generate-verify-email-token",
  authMiddleware,
  generateVerificationTokenCtrl
);

userRoutes.post("/verify-account", authMiddleware, accountVerificationCtrl);

userRoutes.post("/forget-password-token", forgetPasswordTokenCtrl);
userRoutes.post("/reset-password", passwordResetCtrl);

userRoutes.put(
  "/profile-photo-upload",
  authMiddleware,
  photoUpload.single("image"),
  profilePhotoResize,
  profilePhotoUploadCtrl
);

module.exports = userRoutes;
