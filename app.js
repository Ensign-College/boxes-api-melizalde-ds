// Load Environment Variables
require("dotenv").config();

// Express
const express = require("express");
const app = express();

// Body Parser
const bodyParser = require("body-parser");
app.use(bodyParser.json());

// Cookie Parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// CORS
const options = {
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Accepts, Authorization",
};
const cors = require("cors");
app.use(cors(options));

// Custom Error Handler
const errorHandler = require("./middleware/error_handler");
app.use(errorHandler);
// Custom Error Handler
const errorHandler = require("./middleware/error_handler");
app.use(errorHandler);

// Auth Middleware
const auth = require("./middleware/auth");
app.use("/cars", auth);

// Car Routes
const carRoutes = require("./routes/car_routes");
app.use("/cars", carRoutes);

// User Routes
const userRoutes = require("./routes/user_routes");
app.use("/users", userRoutes);

// MongoDB
const mongoose = require("mongoose");
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI);

// Redis
const redis = require("redis");
const redisClient = redis.createClient();
redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.connect();

// Define a port
const port = process.env.PORT || 3001;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
