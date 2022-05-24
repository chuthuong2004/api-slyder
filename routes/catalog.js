import express from "express";
import catalogController from "../controllers/catalogController.js";
import middlewareController from "../controllers/middlewareController.js";
const router = express.Router();

// * GET ALL CATALOG --- PAGINATION
router.get("/catalogs", catalogController.getAllCatalog);

// * GET ALL CATALOG --- ADMIN
router.get(
    "/admin/catalogs",
    middlewareController.verifyTokenAndAdminAuth,
    catalogController.getAdminCatalogs
);

// * GET CATALOG DETAILS
router.get("/catalog/:id", catalogController.getCatalog);

// * CREATE CATALOG
router.post(
    "admin/catalog/new",
    middlewareController.verifyTokenAndAdminAuth,
    middlewareController.validateCatalogRequest,
    middlewareController.isRequestValidated,
    catalogController.addCatalog
);

// * UPDATE CATALOG
router.put(
    "/admin/catalog/:id",
    middlewareController.verifyTokenAndAdminAuth,
    catalogController.updateCatalog
);

// * DELETE CATALOG
router.delete(
    "/admin/catalog/:id",
    middlewareController.verifyTokenAndAdminAuth,
    catalogController.deleteCatalog
);

export default router;