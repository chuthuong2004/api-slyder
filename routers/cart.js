import express from 'express';
import cartController from '../controllers/cartController.js';
import middlewareController from '../controllers/middlewareController.js';
const router = express.Router();

// ! GET ALL CART
router.get('/carts', cartController.getAllCart);

// ! GET A CART
router.get('/cart/:id', cartController.getCart);

// ! ADD ITEM CART
router.post('/cart/add-to-cart', middlewareController.verifyToken, middlewareController.validateAddToCart, middlewareController.isRequestValidated, cartController.addItemToCart);

// ! UPDATE CART
router.put('/cart/:id', middlewareController.verifyToken, middlewareController.validateUpdateCart, middlewareController.isRequestValidated, cartController.updateCart);

// ! REMOVE TO CART
router.put('cart/remove-to-cart/:id', middlewareController.verifyToken, cartController.removeToCart);


export default router;