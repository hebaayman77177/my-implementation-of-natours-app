const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(reviewController.getReviews)
  .post(
    authController.authMiddleware,
    authController.checkRole("user"),
    reviewController.mainMiddleware,
    reviewController.addReview
  );
router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(
    authController.authMiddleware,
    authController.checkRole("user"),
    reviewController.editReview
  )
  .delete(
    authController.authMiddleware,
    authController.checkRole("user"),
    reviewController.deleteReview
  );
module.exports = router;
