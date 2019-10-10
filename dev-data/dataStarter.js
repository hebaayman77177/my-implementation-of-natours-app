//////////////////////////////////////////////////////////////////
// how to use this
//node dev-data/dataStarter --import Review reviews.json
//node dev-data/dataStarter --delete Review
////////////////////////////////////////////////////////////////////
const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require("./../models/tourModel");
const User = require("./../models/userModel");
const Review = require("./../models/reviewModel");

dotenv.config({ path: `./env.env` });
const docs = JSON.parse(
  fs.readFileSync(
    `${__dirname}/data/${
      process.argv[4] ? process.argv[4] : "tours-simple.json"
    }`,
    "utf-8"
  )
);
const importData = async () => {
  try {
    console.log("start uploade");
    if (process.argv[3] === "Tour") await Tour.create(docs);
    else if (process.argv[3] === "User") await User.create(docs);
    else if (process.argv[3] === "Review") await Review.create(docs);
    console.log("Data successfully loaded!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
const deleteData = async () => {
  try {
    console.log("start deleting....");
    if (process.argv[3] === "Tour") await Tour.deleteMany({});
    else if (process.argv[3] === "User") await User.deleteMany({});
    else if (process.argv[3] === "Review") await Review.deleteMany({});
    console.log("finish deleting....");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// const DB = process.env.DATABASE.replace(
//   "<PASSWORD>",
//   process.env.DATABASE_PASSWORD
// );
// const DB = process.env.DATABASE_LOCAL;
const DB = process.env.DATABASE_LOCAL;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("DB connection successful!");
    if (process.argv[2] === "--import") {
      importData();
    } else if (process.argv[2] === "--delete") {
      deleteData();
    } else {
      process.exit();
    }
  })
  .catch(err => console.log(err));
