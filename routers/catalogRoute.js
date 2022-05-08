import express from "express";
import catalogController from "../controllers/catalogController.js";
const router = express.Router();

// * GET ALL CATALOG --- PAGINATION
router.get("/catalogs", catalogController.getAllCatalogV2);

// * GET CATALOG DETAILS
router.get("/catalog/:id", catalogController.getCatalogV2);
export default router;