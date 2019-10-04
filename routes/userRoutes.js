const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

const router = express.Router();

router.route("/sign-up").post(authController.signUp);
router.route("/log-in").post(authController.logIn);
router.route("/forgot-password").post(authController.forgotPassword);
router.route("/reset-password/:token").post(authController.resetPassword);

router.use(authController.authMiddleware);

router.route("/update-password").patch(authController.updatePassword);
// TODO: see how we can refactor editme and delete me
router.route("/edit-me").patch(userController.editMe);
router.route("/delete-me").delete(userController.deleteMe);
router.route("/get-me").get(userController.putMe, userController.getUser);

router.use(authController.checkRole("admin"));

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
