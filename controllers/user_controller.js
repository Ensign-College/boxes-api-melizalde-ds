const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const { validationResult } = require("express-validator");

exports.logout = async (req, res, next) => {
  try {
    res.clearCookie("token").json({ message: "User logged out" });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    res.status(error.statusCode).json({ error: error.data });
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(201)
        .json({ message: "No user logged in. Please log in" });
    }
    const decodedToken = jwt.verify(token, jwtSecret);
    if (!decodedToken) {
      return res
        .status(201)
        .json({ message: "Token not valid. Please log in." });
    }
    const user = await User.findById(decodedToken.userId);
    res.status(200).json({
      message: "User authenticated and logged in",
      user: {
        _id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    res.status(error.statusCode).json({ error: error.data });
  }
};

exports.signup = async (req, res, next) => {
  try {
    // Error handling
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("Validation failed");
      err.statusCode = 422;
      err.data = errors.array();
      throw err;
    }

    if (!req.body) {
      return res.status(400).json({ message: "No user data provided" });
    }
    // Hash the password and create a new user
    const hashedPassword = bcrypt.hashSync(req.body.password, 12);
    const user = new User({
      email: req.body.email,
      password: hashedPassword,
      name: req.body.name,
      lastName: req.body.lastName,
    });
    await user.save();

    // Create a token
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      jwtSecret,
      { expiresIn: "1h" }
    );

    // Create & Send Cookie
    res
      .status(201)
      .cookie("token", token, { httpOnly: true })
      .json({ message: "User created" });
  } catch (error) {
    return res.send(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    // Error handling
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error("Validation failed");
      err.statusCode = 422;
      err.data = errors.array();
      throw err;
    }

    // Create a token
    const user = await User.findOne({ email: req.body.email });
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      jwtSecret,
      { expiresIn: "1h" }
    );

    // Create & Send Cookie
    res
      .status(200)
      .cookie("token", token, { httpOnly: true })
      .json({ message: "User logged in!" });
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({ error: error.data });
  }
};
