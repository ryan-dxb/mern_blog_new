const express = require("express");
const {
  createPostCtrl,
  fetchAllPostCtrl,
  fetchSinglePostCtrl,
  updatePostCtrl,
  deletePostCtrl,
  toggleLikePostCtrl,
  toggleDisLikePostCtrl,
} = require("../../controllers/posts/postCtrl");
const authMiddleware = require("../../middlewares/auth/authMiddleware");
const {
  photoUpload,
  postPhotoResize,
} = require("../../middlewares/uploads/photoUpload");

const postRoute = express.Router();

postRoute.post(
  "/",
  authMiddleware,
  photoUpload.single("image"),
  postPhotoResize,
  createPostCtrl
);

postRoute.get("/", fetchAllPostCtrl);
postRoute.get("/:id", fetchSinglePostCtrl);
postRoute.put("/:id", authMiddleware, updatePostCtrl);
postRoute.delete("/:id", authMiddleware, deletePostCtrl);

postRoute.post("/likes", authMiddleware, toggleLikePostCtrl);
postRoute.post("/dislikes", authMiddleware, toggleDisLikePostCtrl);

module.exports = postRoute;
