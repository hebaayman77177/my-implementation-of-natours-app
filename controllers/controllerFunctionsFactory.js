const ApiFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getDocsFactory = (Model, sarterFilter = {}) => {
  return catchAsync(async (req, res, next) => {
    console.log(req.query);
    const apiFeatures = new ApiFeatures(Model.find(sarterFilter), req.query);
    const docs = await apiFeatures
      .filter()
      .sort()
      .limit()
      .paginate().query;
    // const docs = await doc.find();
    return res.status(200).json({
      status: "succeed",
      legnth: docs.length,
      data: docs
    });
  });
};
exports.addDocFactory = Model => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    return res.status(201).json({
      status: "succeed",
      legnth: doc.legnth,
      data: doc //the created data
    });
  });
};
exports.getDocFactory = (Model, populate) => {
  return catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populate !== undefined) query = query.populate(populate);

    const doc = await query;
    if (!doc) {
      const err = new AppError(
        `this id ${req.params.id} doesn't exist :(`,
        404
      );
      return next(err);
    }
    return res.status(200).json({
      status: "succeed",
      data: { doc }
    });
  });
};
exports.editDocFactory = Model => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      validators: true,
      new: true
    });
    if (!doc) {
      return next(new AppError(`this id ${req.params.id} doesn't exist`, 404));
    }
    return res.status(200).json({
      status: "succeed",
      data: { doc }
    });
  });
};
exports.deleteDocFactory = Model => {
  return catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError(`this id ${req.params.id} doesn't exist`, 404));
    }
    return res.status(204).json({
      status: "succeed",
      data: null
    });
  });
};
