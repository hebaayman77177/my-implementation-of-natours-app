const User = require("../models/userModel");
const ApiFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
// const AppError = require("../utils/appError");
const funFactory = require("./controllerFunctionsFactory");

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
exports.putMe = (req, res, next) => {
  req.params.id = req.currentUser._id;
  next();
};
exports.editMe = catchAsync(async (req, res, next) => {
  //get the user
  const currentUser = await User.findById(req.currentUser._id);
  //filter the edit fields not to edit not allowed fields
  const allowedFields = ["name", "email", "photo"];
  const editObj = filterFields(req.body, allowedFields);
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
exports.getUsers = funFactory.getDocsFactory(User);
exports.postUsers = funFactory.addDocFactory(User);
exports.getUser = funFactory.getDocFactory(User);
exports.editUser = funFactory.editDocFactory(User);
exports.deleteUser = funFactory.deleteDocFactory(User);
