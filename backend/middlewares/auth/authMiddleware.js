const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../../model/user/User");

const authMiddleware = expressAsyncHandler(async (req, res, next) => {
  let token;

  if (req?.headers?.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        const user = await User.findById(decoded?.id).select("-password");

        req.user = user;
      }
    } catch (error) {
      throw new Error("Not Authorized");
    }
  } else {
    throw new Error("Token Invalid");
  }

  next();
});

module.exports = authMiddleware;
