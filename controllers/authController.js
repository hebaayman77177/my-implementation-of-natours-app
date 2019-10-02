const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("./../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

//middlewares
function createSendToken(user, res, code, message) {
  const token = user.getToken({ id: user._id });
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }
  res.cookie("jwt", token);
  return res.status(code).json({
    token: token,
    status: "success",
    data: { user },
    message: message
  });
}
exports.authMiddleware = catchAsync(async (req, res, next) => {
  //check that the token is in the header
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")
  ) {
    return next(new AppError("you must be loged in", 401));
  }
  const token = req.headers.authorization.split(" ")[1];
  // verifay the token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //check that there is an existed user for this token as a user might be deleted and his token
  //may still be valid
  const currentUser = await User.findOne({ _id: decode.id }).select(
    "+passwordChangedAt"
  );
  if (!currentUser) {
    return next(new AppError("please logi in", 401));
  }
  //check that the user doesn't change his password at the life time of an jwt token
  if (currentUser.passwordChangedAt) {
    if (
      parseInt(currentUser.passwordChangedAt.getTime() / 1000, 10) > decode.iat
    ) {
      return next(new AppError("you must be loged in", 401));
    }
  }
  req.currentUser = currentUser;
  next();
});
exports.checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.currentUser.role)) {
      return next(new AppError("you are not permitted to do this action", 403));
    }
    next();
  };
};
exports.signUp = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword
  });
  createSendToken(user, res, 201, "signed up successfully");
});
exports.logIn = catchAsync(async (req, res, next) => {
  //check the email and password exist
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("email or password are wrong", 400));
  }
  //check if there is a user with  correcthet password
  const user = await User.findOne({ email: email }).select("+password");
  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError("email or password are wrong", 400));
  }
  createSendToken(user, res, 200, "loged in successfully");
});
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //get the user
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("there is no user with this email", 404));
  }
  //get the token
  const resetToken = user.createPasswordResetToken();
  await user.save({
    validateBeforeSave: false
  });
  console.log(resetToken);
  //send the token to the email of the user
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/reset-password/${resetToken}`;
  const options = {
    email: user.email,
    subject: "token to reset your password",
    message: `please go to this url:${resetUrl} to reset your password`
  };
  try {
    await sendEmail(options);
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    return next(
      new AppError("some thing went wrong while sending the email", 500)
    );
  }
  res.status(200).json({
    status: "success",
    message: "Token sent to email!"
  });
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //get the user of the token
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpiresAt: { $gt: Date.now() }
  });
  // check it exist and the token doesn't expired
  if (!user) {
    return next(new AppError("your token is eather not valid or expired", 400));
  }
  //save the new password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  res.status(200).json({
    status: "success",
    message: "the password has been successfully changed"
  });
});

//change the password of logedin user
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) get the user
  const user = await User.findById(req.currentUser._id).select("+password");
  // 2) check the given password
  if (!user.checkPassword(req.body.password, user.password)) {
    return next(new AppError("your password is wrong", 404));
  }
  // 3) update the password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  // login and return the jwt
  const token = user.getToken({ id: user._id });
  return res.status(200).json({
    token,
    status: "succeed",
    message: "the password has been successfully changed"
  });
});
