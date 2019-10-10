const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can not be empty!"]
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour."]
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"]
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
reviewSchema.index({ user: 1, tour: 1 }, { unique: true });
reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: "user",
    select: "name photo"
  });
  next();
});
reviewSchema.post("save", function(next) {
  this.constructor.calcAvgRating(this.tour);
});
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne();
  console.log("r", this.r);
  next();
});
reviewSchema.post(/^findOneAnd/, async function() {
  // console.log(this);
  await this.r.constructor.calcAvgRating(this.r.tour);
});
reviewSchema.statics.calcAvgRating = async function(tourId) {
  const stat = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" }
      }
    }
  ]);
  if (stat.length !== 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stat[0].nRating,
      ratingsAverage: stat[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 0
    });
  }
};
const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
