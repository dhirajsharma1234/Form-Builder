import express from "express";
import user from "../../controllers/user/profileController.js";
import { auth } from "../../auth/auth.js";

const router = new express.Router();

//get authenticated user
router.route("/profile").get(auth, user.getUser);

//edit profile
router.route("/profile").patch(auth, user.updateUser);

//verify email by otp and update email
router
  .route("/profile/updateEmail")
  .post(auth, user.verifyEmail)
  .patch(auth, user.updateEmail);

//verify email by otp and change password
router
  .route("/profile/updatePass")
  .post(auth, user.verifyEmailForPass)
  .patch(auth, user.updatePassword);

export default router;
