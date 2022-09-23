const User = require("../../model/user/User");
const expressAsyncHandler = require("express-async-handler");

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
  const user = await User.findOne({ email: req?.body?.email });

  if (!user) throw new Error(`Login Failed. Credentials Invalid`);

  res.json("user login");
});

module.exports = { userRegisterCtrl, userLoginCtrl };
