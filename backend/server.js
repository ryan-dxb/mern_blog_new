const express = require("express");
const dbConnect = require("./config/db/dbConnect");
const dotenv = require("dotenv");
const userRoutes = require("./routes/users/userRoute");
const { errorHandler, notFound } = require("./middlewares/error/errorHandler");
const postRoute = require("./routes/posts/postRoute");

dotenv.config();

const app = express();

dbConnect();

app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoute);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server is running on port ${PORT}`));
