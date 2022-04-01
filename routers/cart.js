import express from 'express';
import cartController from '../controllers/cartController.js';
import middlewareController from '../controllers/middlewareController.js';
const router = express.Router();

// GET ALL CART
router.get('/', cartController.getAllCart);

// ADD CART
router.post('/add-to-cart', middlewareController.verifyToken, cartController.addItemToCart);
// router.post('/add-product-to-cart/:id', cartController.addProductToCart);

// GET A CART
router.get('/:id', cartController.getCart);

// UPDATE CART
// router.put('/:id', cartController.updateCart);

// DELETE CART
// router.delete('/:id', cartController.deleteCart);


export default router;