const JsonWebTokenError = require("jsonwebtoken").JsonWebTokenError;
const jsonwebtoken = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

module.exports = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      const err = new Error("Not authenticated");
      err.statusCode = 401;
      throw err;
    }
    const decodedToken = jsonwebtoken.verify(token, jwtSecret);
    if (!decodedToken) {
      const err = new Error("Not authenticated");
      err.statusCode = 401;
      throw err;
    }
    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      error.message = "Not authenticated. Please log in.";
      error.statusCode = 401;
    }
    next(error);
  }
};
