const User = require("../../model/user/User");
const expressAsyncHandler = require("express-async-handler");
const generateToken = require("../../config/token/generateToken");
const validateMongoDbId = require("../../utils/validateMongoDbId");
const crypto = require("crypto");
const fs = require("fs");

const sgMail = require("@sendgrid/mail");
const cloudinaryUploadImage = require("../../utils/cloudinary");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const userRegisterCtrl = expressAsyncHandler(async (req, res) => {
  const userExists = await User.findOne({ email: req?.body?.email });

  if (userExists) throw new Error("User already exists");

  try {
    const user = await User.create({
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      password: req?.body?.password,
    });
    res.json(user);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

const userLoginCtrl = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: req?.body?.email });

  // Checking password match
  if (user && (await user.isPasswordMatched(password))) {
    res.json({
      id: user?._id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      profilePhoto: user?.profilePhoto,
      isAdmin: user?.isAdmin,
      token: generateToken(user),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Credentials");
  }
});

const allUsersCtrl = expressAsyncHandler(async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.json(error);
  }
});

const deleteUserCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req?.params;

  if (!id) throw new Error("Please Provide User ID");
  validateMongoDbId(id);

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    res.json(deletedUser);
  } catch (error) {
    res.json(error);
  }
});

const singleUserCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req?.params;

  if (!id) throw new Error("Please Provide User ID");
  validateMongoDbId(id);

  try {
    const singleUser = await User.findById(id);
    res.json(singleUser);
  } catch (error) {
    res.json(error);
  }
});

const userProfileCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req?.params;

  if (!id) throw new Error("Please Provide User ID");
  validateMongoDbId(id);

  try {
    const myProfile = await User.findById(id).populate("userPosts");
    res.json(myProfile);
  } catch (error) {
    res.json(error);
  }
});

const updateProfileCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req?.user;

  if (!id) throw new Error("Please Provide User ID");
  validateMongoDbId(id);

  const user = await User.findByIdAndUpdate(
    id,
    {
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      bio: req?.body?.bio,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.json(user);
});

const updatePasswordCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req?.user;
  const { password } = req?.body;

  if (!id) throw new Error("Please Provide User ID");
  validateMongoDbId(id);

  const user = await User.findById(id);

  try {
    if (password) {
      user.password = password;

      const updatedUser = await user.save();

      res.json({ updatedUser });
    }
  } catch (error) {
    res.json(error);
  }
});

const followingUserCtrl = expressAsyncHandler(async (req, res) => {
  const { followId } = req?.body;
  const loginUserId = req?.user.id;

  if (!followId) return res.json({ message: "Please select user to follow" });

  const targetUser = await User.findById(followId);

  const alreadyFollowing = targetUser?.followers?.find(
    (user) => user?.toString() === loginUserId.toString()
  );

  if (alreadyFollowing)
    return res.json({ message: "You are already following this user" });

  // Updated Target Followers List
  await User.findByIdAndUpdate(
    followId,
    {
      $push: {
        followers: loginUserId,
      },
      isFollowing: true,
    },
    { new: true }
  );

  // Updated Logged In User Following List
  await User.findByIdAndUpdate(
    loginUserId,
    {
      $push: {
        following: followId,
      },
    },
    { new: true }
  );

  res.json({ message: "You have started following this user" });
});

const unFollowingUserCtrl = expressAsyncHandler(async (req, res) => {
  const { unfollowId } = req?.body;
  const loginUserId = req?.user.id;

  if (!unfollowId)
    return res.json({ message: "Please select user to unfollow" });

  console.log(unfollowId);

  const targetUser = await User.findById(unfollowId);

  const alreadyFollowing = targetUser?.followers?.find(
    (user) => user?.toString() === loginUserId.toString()
  );

  console.log(alreadyFollowing);

  if (!alreadyFollowing)
    return res.json({ message: "You are not following this user" });

  // Updated Target Followers List
  await User.findByIdAndUpdate(
    unfollowId,
    {
      $pull: {
        followers: loginUserId,
      },
      isFollowing: false,
    },
    { new: true }
  );

  // Updated Logged In User Following List
  await User.findByIdAndUpdate(
    loginUserId,
    {
      $pull: {
        following: unfollowId,
      },
    },
    { new: true }
  );

  res.json({ message: "You have stopped following this user" });
});

// Block User

const blockUserCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req?.params;

  if (!id) throw new Error("Please Provide User ID");
  validateMongoDbId(id);

  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: true,
    },
    {
      new: true,
    }
  );
});

const unBlockUserCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req?.params;

  if (!id) throw new Error("Please Provide User ID");
  validateMongoDbId(id);

  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: false,
    },
    {
      new: true,
    }
  );
});

// Account Verification - Send Mail

const generateVerificationTokenCtrl = expressAsyncHandler(async (req, res) => {
  const loginUserId = req?.user?.id;

  const user = await User.findById(loginUserId);
  console.log(user);

  try {
    const verificationToken = await user.createAccountVerificationToken();

    // Save User
    await user.save();

    // EMAIL
    const resetURL = `Please click on the link to verify account <a href="http://localhost:3000/verify-account/${verificationToken}>Verify Now</a>`;

    const msg = {
      to: user?.email, // Change to your recipient
      from: process.env.SENDGRID_FROM_EMAIL, // Change to your verified sender
      subject: "Email Verification",
      html: resetURL,
    };

    res.json({ message: msg });

    // sgMail
    //   .send(msg)
    //   .then(() => {
    //     console.log("Email sent");
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //     res.json({ message: error });
    //   });
  } catch (error) {
    res.json(error);
  }
});

const accountVerificationCtrl = expressAsyncHandler(async (req, res) => {
  const { token } = req?.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const userFound = await User.findOne({
    accountVerificationToken: hashedToken,
    accountVerificationTokenExpires: { $gt: new Date() },
  });

  if (!userFound) throw new Error("Token invalid or expired");

  // Update Verified Status

  userFound.isAccountVerified = true;
  userFound.accountVerificationToken = null;
  userFound.accountVerificationTokenExpires = null;

  await userFound.save();

  res.json({ user: userFound });
});

// Forget Password

const forgetPasswordTokenCtrl = expressAsyncHandler(async (req, res) => {
  const { email } = req?.body;

  const user = await User.findOne({ email });

  if (!user) throw new Error("User Not Found");

  try {
    const token = await user.createPasswordResetToken();

    await user.save(); // EMAIL
    const resetURL = `Please click on the link to reset password <a href="http://localhost:3000/reset-password/${token}>Reset Password</a>`;

    const msg = {
      to: user?.email, // Change to your recipient
      from: process.env.SENDGRID_FROM_EMAIL, // Change to your verified sender
      subject: "Password Reset",
      html: resetURL,
    };

    res.json({ message: msg });

    // sgMail
    //   .send(msg)
    //   .then(() => {
    //     console.log("Email sent");
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //     res.json({ message: error });
    //   });
  } catch (error) {
    res.json(error);
  }
});

const passwordResetCtrl = expressAsyncHandler(async (req, res) => {
  const { token, password } = req?.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const userFound = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  });

  if (!userFound) throw new Error("Token invalid or expired");

  // Update New Password
  userFound.password = password;
  userFound.passwordResetToken = null;
  userFound.passwordResetExpires = null;

  await userFound.save();

  res.json({ user: userFound });
});

// Profile Photo Upload
const profilePhotoUploadCtrl = expressAsyncHandler(async (req, res) => {
  const loggedInUserId = req?.user.id;

  const localPath = `public/images/users/profile/${req.file.filename}`;

  const imgUploaded = await cloudinaryUploadImage(localPath);

  const loggedInUser = await User.findByIdAndUpdate(
    loggedInUserId,
    {
      profilePhoto: imgUploaded?.url,
    },
    {
      new: true,
    }
  );

  fs.unlinkSync(localPath);

  res.json({
    user: loggedInUser,
  });
});

module.exports = {
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
};
