const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { body } = require("express-validator");

const router = express.Router();
const userController = require("../controllers/user_controller");

// Logout route
router.get("/logout", userController.logout);

// Get user route
router.get("/getuser", userController.getUser);

// Signup route
router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value) => {
        return User.findOne({ email: value }).then((foundUser) => {
          if (foundUser) {
            return Promise.reject("Email already exists");
          }
        });
      }),
    body("password")
      .isStrongPassword()
      .withMessage("Password is too weak")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("name").notEmpty().withMessage("Name cannot be empty"),
    body("lastName").notEmpty().withMessage("Last name cannot be empty"),
  ],
  userController.signup
);

// Login route
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value) => {
        return User.findOne({ email: value }).then((foundUser) => {
          if (!foundUser) {
            return Promise.reject(
              "User not found. Please enter a valid email."
            );
          }
        });
      }),
    body("password")
      .notEmpty()
      .withMessage("Password cannot be empty")
      .custom(async (value, { req }) => {
        const user = await User.findOne({ email: req.body.email });
        const isEqual = await bcrypt.compare(value, user.password);
        if (!isEqual) {
          return Promise.reject("Incorrect password");
        }
      }),
  ],
  userController.login
);

module.exports = router;
