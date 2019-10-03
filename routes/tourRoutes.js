const express = require("express");
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRouter = require("./reviewRoutes");

const router = express.Router();
// router.use(tourController.mainMiddleware);

router.use("/:tourId/reviews", reviewRouter);
router
  .route("/top-cheap-5")
  .get(tourController.aliasTopTours, tourController.getTours);
router
  .route("/")
  .get(tourController.getTours)
  .post(tourController.postTours);
router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.authMiddleware,
    authController.checkRole("admin"),
    tourController.editTour
  )
  .delete(tourController.deleteTour);
module.exports = router;
