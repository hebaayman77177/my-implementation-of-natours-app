const funFactory = require("./controllerFunctionsFactory");
const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

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
///tours-withn/:distance/center/:latlng/unit/:unit
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");
  if (!lat || !lng) {
    return next(
      new AppError(`you must spacifay the latitude an lngtiude`, 400)
    );
  }
  const rad = unit === "mi" ? distance / 3963.2 : distance / 6378.1;
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], rad] }
    }
  });
  return res.status(200).json({
    status: "succeed",
    length: tours.length,
    data: { tours }
  });
});
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        "Please provide latitutr and longitude in the format lat,lng.",
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: "distance",
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: "success",
    data: {
      data: distances
    }
  });
});
exports.getTours = funFactory.getDocsFactory(Tour);
exports.postTours = funFactory.addDocFactory(Tour);
exports.getTour = funFactory.getDocFactory(Tour, {
  path: "reviews"
});
exports.editTour = funFactory.editDocFactory(Tour);
exports.deleteTour = funFactory.deleteDocFactory(Tour);
