import express from 'express';
import catalogController from '../controllers/catalogController.js';
import middlewareController from '../controllers/middlewareController.js';
const router = express.Router();
// ! GET ALL CATALOG
router.get('/catalogs', catalogController.getAllCatalog);

// ! GET CATALOG
router.get('/catalog/:id', catalogController.getCatalog);

// ! CREATE CATALOG
router.post('/catalog/new', middlewareController.verifyTokenAndAdminAuth, middlewareController.validateCatalogRequest,
    middlewareController.isRequestValidated, catalogController.addCatalog);

// ! UPDATE CATALOG
router.put('/catalog/:id', middlewareController.verifyTokenAndAdminAuth, catalogController.updateCatalog);

// ! DELETE CATALOG
router.delete('/catalog/:id', middlewareController.verifyTokenAndAdminAuth, catalogController.deleteCatalog);
export default router;