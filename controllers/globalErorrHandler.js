const AppError = require("../utils/appError");

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};
const handleJsonWebTokenError = () => {
  const message = "invalid token, please log in again";
  return new AppError(message, 401);
};
const handleTokenExpiredError = () => {
  const message = "your token is expired, please log in again";
  return new AppError(message, 401);
};
function operationResponse(err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
}
function productionResponse(err, res) {
  // Operational, trusted error: send message to client
  if (err.isOperation) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message
    });
    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error("ERROR 💥", err);

    // 2) Send generic message
    res.status(500).json({
      status: err.status,
      message: err.message
    });
  }
}
module.exports = (err, req, res, next) => {
  // initiators
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  //   two defferant paths to show the error messages depends on the production environment
  if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    // need to map the database errors to the user as they are not operational ,
    // they need to be known and customized
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJsonWebTokenError();
    if (error.name === "TokenExpiredError") error = handleTokenExpiredError();
    productionResponse(error, res);
  } else {
    operationResponse(err, res);
  }
};
