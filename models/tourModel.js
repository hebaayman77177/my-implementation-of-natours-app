const mongoose = require("mongoose");
const slugify = require("slugify");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "a tour must have a name"],
      unique: [true, "there exist a tour with the same name"],
      maxLength: [
        100,
        "the character lengrh must be less 100 characters or less"
      ],
      minLength: [
        10,
        "the character lengrh must be less 10 characters or more"
      ],
      trim: true
    },
    duration: {
      type: Number,
      required: [true, "the duration must be spacified"]
    },
    maxGroupSize: {
      type: Number,
      required: [true, "the max group size must be spacified"]
    },
    difficulty: {
      type: String,
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "the deficulty must be either easy or medium or hard"
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"]
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, "the price must be spacified"]
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(value) {
          return this.price > value;
        }
      },
      message: "discount price must be less than the original price"
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a description"]
    },
    description: {
      type: String,
      required: [true, "the description must be spacified"],
      maxLength: [
        500,
        "the character lengrh must be less 500 characters or less"
      ],
      minLength: [
        10,
        "the character lengrh must be less 10 characters or more"
      ],
      trim: true
    },
    imageCover: String,
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: {
      type: [Date],
      required: [true, "the start dates must be spacified"]
    },
    secretTour: {
      type: Boolean,
      default: false
    },
    startQuery: Date,
    slug: String,
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: "Point",
        enum: ["Point"]
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"]
        },
        coordinates: [Number],
        address: String,
        description: String
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    toJson: { virtual: true },
    toObject: { virtual: true }
  }
);
tourSchema.virtual("durationWeek").get(function() {
  return this.duration / 7;
});
tourSchema.pre("save", function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt -role -active"
  });
  next();
});
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.startQuery = Date.now();
  next();
});
// tourSchema.post(/^find/, function(doc, next) {
//   console.log(`the query took ${Date.now() - this.startQuery} milliseconds`);
//   next();
// });
const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
