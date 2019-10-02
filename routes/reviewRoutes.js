const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(authController.authMiddleware, reviewController.getReviews)
  .post(
    authController.authMiddleware,
    authController.checkRole("user"),
    reviewController.addReview
  );
