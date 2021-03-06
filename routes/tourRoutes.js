const express = require("express");
const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");
const reviewRouter = require("./reviewRoutes");

const router = express.Router();
// router.use(tourController.mainMiddleware);

router
  .route("/tours-withn/:distance/center/:latlng/unit/:unit")
  .get(tourController.getToursWithin);
router
  .route("/tours-withn/:distance/center/:latlng")
  .get(tourController.getToursWithin);
router
  .route("/get-distances/center/:latlng/unit/:unit")
  .get(tourController.getDistances);
router.route("/get-distances/center/:latlng").get(tourController.getDistances);
router.use("/:tourId/reviews", reviewRouter);
router
  .route("/top-cheap-5")
  .get(tourController.aliasTopTours, tourController.getTours);
router
  .route("/")
  .get(tourController.getTours)
  .post(
    authController.authMiddleware,
    authController.checkRole("admin", "tour-guide"),
    tourController.postTours
  );
router
  .route("/:id")
  .get(tourController.getTour)
  .patch(
    authController.authMiddleware,
    authController.checkRole("admin", "tour-guide"),
    tourController.editTour
  )
  .delete(
    authController.authMiddleware,
    authController.checkRole("admin", "tour-guide"),
    tourController.deleteTour
  );
module.exports = router;
