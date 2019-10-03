const funFactory = require("./controllerFunctionsFactory");
const Review = require("../models/reviewModel");
// const catchAsync = require("../utils/catchAsync");
// const AppError = require("../utils/appError");
// tours/156/reviews get
//tours/152/reviews post
exports.mainMiddleware = (req, res, next) => {
  if (req.params.tourId) req.body.tour = req.params.tourId;
  if (req.currentUser && req.currentUser._id)
    req.body.user = req.currentUser._id;
  next();
};
exports.getReviews = (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  return funFactory.getDocsFactory(Review, filter)(req, res, next);
};
exports.addReview = funFactory.addDocFactory(Review);
exports.getReview = funFactory.getDocFactory(Review);
exports.editReview = funFactory.editDocFactory(Review);
exports.deleteReview = funFactory.deleteDocFactory(Review);
