import express from "express";
import user from "../../controllers/user/userController.js";

const router = new express.Router();

//register route
router.route("/register").post(user.register);

//register route
router.route("/register/:token").get(user.verifyEmail);

// login route
router.route("/login").post(user.login);

export default router;
