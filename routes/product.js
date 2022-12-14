import express, { Router } from "express";
import middlewareController from "../middlewares/middlewareController.js";
import productController from "../controllers/productController.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import moment from "moment";

const __filename = fileURLToPath(
    import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);
const router = express.Router();
const date = moment(Date.now()).format("yyyyMMDDhhmmss");
console.log(date);
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), "uploads/products"));
    },
    filename: function(req, file, cb) {
        cb(null, date + "-" + file.originalname);
    },
});

const upload = multer({ storage });

// * GET ALL PRODUCTS ---- PAGINATION ---DONE---
router.get("/products", productController.getAllProduct);

// * GET PRODUCT DETAIL
router.get("/product/:id", productController.getProductDetails);

// * GET ALL PRODUCTS -- ADMIN
router.get(
    "/admin/products",
    middlewareController.verifyTokenAndAdminAuth,
    productController.getAllProduct
);
// * GET PRODUCT DETAIL
router.get("/admin/product/:id", productController.getProductDetails);
// ! CREATE PRODUCT --- ADMIN ---- Many size color
router.post(
    "/admin/product/new",
    // middlewareController.verifyTokenAndAdminAuth,
    upload.array("images"),
    productController.createProduct
);

// ! UPDATE PRODUCT -- kiểm tra size color amount khi update
// * UPDATE PRODUCT ---- ADMIN
router.put(
    "/admin/product/:id",
    middlewareController.verifyTokenAndAdminAuth,
    upload.array("images"),
    productController.updateProduct
); // update 1 product

// * RESTORE PRODUCT
router.patch(
    "/admin/product/restore/:id",
    middlewareController.verifyTokenAndAdminAuth,
    productController.restoreProduct
);

// * SOFT DELETE PRODUCT
router.delete(
    "/admin/product/:id",
    middlewareController.verifyTokenAndAdminAuth,
    productController.destroyProduct
);

// ! DELETE PRODUCT ---- delete image
router.delete(
    "/admin/product/force/:id",
    middlewareController.verifyTokenAndAdminAuth,
    productController.forceDestroyProduct
);

export default router;