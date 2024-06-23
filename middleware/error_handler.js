function errorHandler(err, req, res, next) {
  // Check if the error has a status code
  const statusCode = err.statusCode || 500;

  console.error(err.message);

  return res.status(statusCode).json({
    error: {
      message: err.message,
      statusCode: statusCode,
    },
  });
}

module.exports = errorHandler;
