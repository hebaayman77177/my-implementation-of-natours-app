const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require("./../models/tourModel");

dotenv.config({ path: `./env.env` });
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/data/tours-simple.json`, "utf-8")
);
const importData = async () => {
  try {
    console.log("start uploade");
    await Tour.create(tours);
    console.log("Data successfully loaded!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
const deleteData = async () => {
  try {
    console.log("start deleting....");
    await Tour.deleteMany({});
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
