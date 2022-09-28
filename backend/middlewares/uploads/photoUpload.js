const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const expressAsyncHandler = require("express-async-handler");

// Server memory storage
const multerStorage = multer.memoryStorage();

// File Type checking
const multerFilter = (req, file, cb) => {
  // check file type

  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    // Rejected Files
    cb({ message: "Unsupported File Format" }, false);
  }
};

const photoUpload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 1000000 },
});

// Profile Image Resize
const profilePhotoResize = expressAsyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${Date.now()}-${req.file.originalname}`;

  await sharp(req.file.buffer)
    .resize(250, 250)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(path.join(`public/images/users/profile/${req.file.filename}`));
  next();
});

// Post Image Resize
const postPhotoResize = expressAsyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${Date.now()}-${req.file.originalname}`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(path.join(`public/images/posts/${req.file.filename}`));
  next();
});

module.exports = { photoUpload, profilePhotoResize, postPhotoResize };
