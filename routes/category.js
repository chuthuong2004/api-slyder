import express from "express";
import categoryController from "../controllers/categoryController.js";
import middlewareController from "../middlewares/middlewareController.js";
const router = express.Router();

import multer from "multer";
import shortid from "shortid"; // shortid.generate()
import path from "path";
import { fileURLToPath } from "url";
import moment from "moment";

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);
const date = moment(Date.now()).format("yyyyMMDDhhmmss");
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), "uploads/categories"));
    },
    filename: function(req, file, cb) {
        cb(null, date + "-" + file.originalname);
    },
});

const upload = multer({ storage });

// * GET ALL CATEGORY --- PAGINATION
router.get("/categories", categoryController.getAllCategory);

// * GET CATEGORY DETAILS
router.get("/category/:id", categoryController.getCategoryDetails);

// * GET ALL CATEGORIES --- ADMIN
router.get(
    "/admin/categories",
    middlewareController.verifyTokenAndAdminAuth,
    categoryController.getAllCategory
);

// * CREATE CATEGORY --- ADMIN
router.post(
    "/admin/category/new",
    middlewareController.verifyTokenAndAdminAuth,
    upload.single("imageCate"),
    categoryController.createCategory
);

// * UPDATE CATEGORY --- ADMIN
router.put(
    "/admin/category/:id",
    middlewareController.verifyTokenAndAdminAuth,
    upload.single("imageCate"),
    categoryController.updateCategory
);

// * DELETE CATEGORY --- ADMIN
// ! handle delete image
router.delete(
    "/admin/category/:id",
    middlewareController.verifyTokenAndAdminAuth,
    categoryController.deleteCategory
);
export default router;