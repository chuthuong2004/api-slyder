import express from "express";
import middlewareController from "../controllers/middlewareController.js";
import userController from "../controllers/userController.js";
const router = express.Router();

import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import moment from "moment";

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);
const date = moment(Date.now()).format("yyyyMMDDhhmmss");
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), "uploads/avatars"));
    },
    filename: function(req, file, cb) {
        cb(null, date + "-" + file.originalname);
    },
});

const upload = multer({ storage });

// * GET USER DETAILS
router.get(
    "/me",
    middlewareController.verifyToken,
    userController.getUserDetailsV2
);

// * UPDATE USER
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