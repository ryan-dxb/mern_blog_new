const Post = require("../../model/post/Post");
const expressAsyncHandler = require("express-async-handler");
const validateMongoDbId = require("../../utils/validateMongoDbId");
const Filter = require("bad-words");
const User = require("../../model/user/User");
const fs = require("fs");

const createPostCtrl = expressAsyncHandler(async (req, res) => {
  const id = req.user.id;
  const file = req.file;

  validateMongoDbId(id);

  const user = await User.findById(id);
  const filter = new Filter();
  const isProfane = filter.isProfane([req.body.title, req.body.description]);

  if (isProfane) {
    user.isBlocked = true;
    await user.save();

    throw new Error(
      "Creating Failed because it contains profane words. You have also been blocked"
    );
  }

  try {
    if (file) {
      const localPath = `public/images/posts/${req?.file?.filename}`;

      const imgUploaded = await cloudinaryUploadImage(localPath);

      const post = await Post.create({
        user: id,
        image: imgUploaded?.url,
        ...req.body,
      });

      res.json(post);

      // Remove Uploaded Images
      fs.unlinkSync(localPath);
    } else {
      const post = await Post.create({
        user: id,
        ...req.body,
      });

      res.json(post);
    }
  } catch (error) {
    res.json(error);
  }
});

const fetchAllPostCtrl = expressAsyncHandler(async (req, res) => {
  try {
    posts = await Post.find({})
      .populate("user", "-password")
      .populate("likes", "-password")
      .populate("disLikes", "-password");

    res.json({ posts });
  } catch (error) {
    res.json(error);
  }
});

const fetchSinglePostCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongoDbId(id);

  try {
    const singlePost = await Post.findByIdAndUpdate(
      id,
      {
        $inc: {
          numViews: 1,
        },
      },
      {
        new: true,
      }
    )
      .populate("user", "-password")
      .populate("likes", "-password")
      .populate("disLikes", "-password");

    // Update Number of views

    res.json(singlePost);
  } catch (error) {
    res.json(error);
  }
});

const updatePostCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  validateMongoDbId(id);

  try {
    const singlePost = await Post.findByIdAndUpdate(
      id,
      {
        user: userId,
        ...req.body,
      },
      {
        new: true,
      }
    ).where({ user: userId });
    res.json(singlePost);
  } catch (error) {
    res.json(error);
  }
});

const deletePostCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  validateMongoDbId(id);

  try {
    const deletedPost = await Post.findByIdAndDelete(id).where({
      user: userId,
    });
    res.json({ message: "Post deleted Successfully", deletedPost });
  } catch (error) {
    res.json(error);
  }
});

const toggleLikePostCtrl = expressAsyncHandler(async (req, res) => {
  const { postId } = req.body;
  const loggedInUserId = req.user.id;

  validateMongoDbId(postId);

  const post = await Post.findById(postId);

  try {
    // Find if user has disliked the post
    const alreadyDisliked = post.disLikes.find(
      (userId) => userId?.toString() === loggedInUserId?.toString()
    );

    // Remove user from dislikes
    if (alreadyDisliked) {
      await Post.findByIdAndUpdate(
        postId,
        {
          $pull: { disLikes: loggedInUserId },
        },
        { new: true }
      );
    }

    // Toggle Like
    const alreadyLiked = post.likes.find(
      (userId) => userId?.toString() === loggedInUserId?.toString()
    );

    if (alreadyLiked) {
      const post = await Post.findByIdAndUpdate(
        postId,
        {
          $pull: { likes: loggedInUserId },
        },
        { new: true }
      );

      res.json(post);
    } else {
      const post = await Post.findByIdAndUpdate(
        postId,
        {
          $push: { likes: loggedInUserId },
        },
        { new: true }
      );

      res.json(post);
    }
  } catch (error) {
    res.json(error);
  }
});

const toggleDisLikePostCtrl = expressAsyncHandler(async (req, res) => {
  const { postId } = req.body;
  const loggedInUserId = req.user.id;

  validateMongoDbId(postId);

  const post = await Post.findById(postId);

  try {
    // Find if user has disliked the post
    const alreadyLiked = post.likes.find(
      (userId) => userId?.toString() === loggedInUserId?.toString()
    );

    // Remove user from likes
    if (alreadyLiked) {
      await Post.findByIdAndUpdate(
        postId,
        {
          $pull: { likes: loggedInUserId },
        },
        { new: true }
      );
    }

    // Toggle DisLike
    const alreadyDisLiked = post.disLikes.find(
      (userId) => userId?.toString() === loggedInUserId?.toString()
    );

    if (alreadyDisLiked) {
      const post = await Post.findByIdAndUpdate(
        postId,
        {
          $pull: { disLikes: loggedInUserId },
        },
        { new: true }
      );

      res.json(post);
    } else {
      const post = await Post.findByIdAndUpdate(
        postId,
        {
          $push: { disLikes: loggedInUserId },
        },
        { new: true }
      );

      res.json(post);
    }
  } catch (error) {
    res.json(error);
  }
});

module.exports = {
  createPostCtrl,
  fetchAllPostCtrl,
  fetchSinglePostCtrl,
  updatePostCtrl,
  deletePostCtrl,
  toggleLikePostCtrl,
  toggleDisLikePostCtrl,
};
