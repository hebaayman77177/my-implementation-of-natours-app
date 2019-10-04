const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router.use(authController.authMiddleware);

router
  .route("/")
  .get(reviewController.getReviews)
  .post(
    authController.checkRole("user"),
    reviewController.mainMiddleware,
    reviewController.addReview
  );
router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(authController.checkRole("user"), reviewController.editReview)
  .delete(
    authController.checkRole("user", "admin"),
    reviewController.deleteReview
  );
module.exports = router;
