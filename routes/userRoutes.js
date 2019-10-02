const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();
router.route("/sign-up").post(authController.signUp);
router.route("/log-in").post(authController.logIn);

router.route("/forgot-password").post(authController.forgotPassword);
router.route("/reset-password/:token").post(authController.resetPassword);
router
  .route("/update-password")
  .patch(authController.authMiddleware, authController.updatePassword);
router
  .route("/edit-me")
  .patch(authController.authMiddleware, userController.editMe);
router
  .route("/delete-me")
  .delete(authController.authMiddleware, userController.deleteMe);
router
  .route("/")
  .get(userController.getUsers)
  .post(userController.postUsers);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.editUser)
  .delete(userController.deleteUser);

module.exports = router;
