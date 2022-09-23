const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const mongoDB = process.env.MONGODB_URL;

const dbConnect = async () => {
  try {
    await mongoose.connect(mongoDB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("DB is connected");
  } catch (error) {
    console.log(error);
  }
};

module.exports = dbConnect;
