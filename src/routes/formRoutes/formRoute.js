import express from "express";
import { auth } from "../../auth/auth.js";
import form from "../../controllers/form/formController.js";
const router = new express.Router();

//get and create form data
router.route("/").post(auth, form.createForm).get(auth, form.viewForm);

router.route("/:id").patch(auth, form.updateForm).delete(auth, form.deleteForm);

export default router;
