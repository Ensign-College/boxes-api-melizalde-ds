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

// Routes
const gestionRoutes = require("./routes/gestion_routes");
app.use("/api/gestion", gestionRoutes);

// MongoDB
const mongoose = require("mongoose");
const uri = `mongodb://${process.env.HOST}:${process.env.PORT}/gestion`;
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI);

// Define a port
const port = process.env.PORT || 3001;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
