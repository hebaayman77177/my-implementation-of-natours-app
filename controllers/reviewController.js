const funFactory = require("./controllerFunctionsFactory");
const Review = require("../models/reviewModel");
// const catchAsync = require("../utils/catchAsync");
// const AppError = require("../utils/appError");
// tours/156/reviews get
//tours/152/reviews post
exports.getReviews = funFactory.getDocsFactory(Review);
exports.addReview = funFactory.addDocFactory(Review);
exports.getReview = funFactory.getDocFactory(Review);
