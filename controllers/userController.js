const User = require("../models/userModel");
const ApiFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

function filterFields(object, fields) {
  const obj = {};
  Object.keys(object).forEach(ele => {
    console.log("__", object[ele]);
    if (fields.includes(ele)) {
      console.log("ok");
      obj[ele] = object[ele];
    }
  });
  return obj;
}

exports.editMe = catchAsync(async (req, res, next) => {
  //get the user
  const currentUser = await User.findById(req.currentUser._id);
  //filter the edit fields not to edit not allowed fields
  const allowedFields = ["name", "email", "photo"];
  const editObj = filterFields(req.body, allowedFields);
  console.log(editObj);
  //update the user
  const updatedUser = await User.findByIdAndUpdate(currentUser._id, editObj, {
    validators: true,
    new: true
  });
  return res.status(200).json({
    status: "succeed",
    message: "the information was updated successfully",
    data: updatedUser
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  //get the user
  const user = await User.findById(req.currentUser._id);
  //make active = false
  await User.findByIdAndUpdate(user._id, { active: false });
  //return the status
  res.status(204).json({
    status: "succeed",
    message: "you have been deleted successfully",
    data: null
  });
});
exports.getUsers = catchAsync(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(User.find(), req.query);
  const users = await apiFeatures
    .filter()
    .sort()
    .limit()
    .paginate().query;
  // const users = await user.find();
  return res.status(200).json({
    status: "succeed",
    legnth: users.length,
    data: users
  });
});
exports.postUsers = (req, res) => {
  return res.status(201).json({
    status: "succeed",
    data: req.params.id * 1 //the created data
  });
};

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    const err = new AppError(`this id ${req.params.id} doesn't exist :(`, 404);
    return next(err);
  }
  return res.status(200).json({
    status: "succeed",
    data: { user }
  });
});
exports.editUser = (req, res) => {
  return res.status(200).json({
    status: "succeed",
    data: req.params.id * 1
  });
};
exports.deleteUser = (req, res) => {
  return res.status(204).json({
    status: "succeed",
    data: null
  });
};
