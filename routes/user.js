import express from "express";
import middlewareController from "../middlewares/middlewareController.js";
import userController from "../controllers/userController.js";
const router = express.Router();

import multer from "multer";
import shortid from "shortid"; // shortid.generate()
import path from "path";
import { fileURLToPath } from "url";
import moment from "moment";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const date = moment(Date.now()).format("yyyyMMDDhhmmss");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.dirname(__dirname), "uploads/avatars"));
  },
  filename: function (req, file, cb) {
    cb(null, date + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// * GET ALL USER ---- Admin
router.get(
  "/admin/users",
  middlewareController.verifyTokenAndAdminAuth,
  userController.getAllUser
);

// * GET A USER ---- Admin
router.get(
  "/admin/user/:id",
  middlewareController.verifyTokenAndAdminAuth,
  userController.getUser
);

// * UPDATE USER ROLE ----- Admin
router.put(
  "/admin/user/:id",
  middlewareController.verifyTokenAndAdminAuth,
  userController.updateUserRole
);

// * DELETE USER ----- Admin
router.delete(
  "/admin/user/:id",
  middlewareController.verifyTokenAndAdminAuth,
  userController.deleteUser
);

// * GET USER DETAILS
router.get("/me", middlewareController.verifyToken, userController.getProfile);

// * UPDATE USERs
router.put(
  "/me/update",
  middlewareController.verifyToken,
  upload.single("avatar"),
  userController.updateProfile
);

// * FORGOT PASSWORD
router.post(
  "/password/forgot",
  middlewareController.validateEmail,
  middlewareController.isRequestValidated,
  userController.forgotPassword
);

// * CHANGE PASSWORD
router.post(
  "/password/update",
  middlewareController.verifyToken,
  middlewareController.validateChangePassword,
  middlewareController.isRequestValidated,
  userController.changePassword
);
export default router;
