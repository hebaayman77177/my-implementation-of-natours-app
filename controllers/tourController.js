const funFactory = require("./controllerFunctionsFactory");
const Tour = require("../models/tourModel");
// const catchAsync = require("../utils/catchAsync");
// const AppError = require("../utils/appError");

// exports.mainMiddleware = (req, res, next) => {
//   console.log("you requested tour router");
//   next();
// };
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage price";
  req.query.fields = "name price ratingsAverage summary difficulty";
  next();
};
// exports.getTop5Tours = async function(req, res) {
//   req.query = {
//     sort: "-duration",
//     page: 1,
//     limit: 5,
//     fields: "name"
//   };
//   return getTours(req, res);
// };
exports.getTours = funFactory.getDocsFactory(Tour);
exports.postTours = funFactory.addDocFactory(Tour);
exports.getTour = funFactory.getDocFactory(Tour, {
  path: "reviews"
});
exports.editTour = funFactory.editDocFactory(Tour);
exports.deleteTour = funFactory.deleteDocFactory(Tour);
