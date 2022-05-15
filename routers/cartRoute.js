import express from "express";
import cartController from "../controllers/cartController.js";
import middlewareController from "../controllers/middlewareController.js";
const router = express.Router();

// * GET ALL CART
router.get("/carts", cartController.getAllCart);

// * GET MY CART
router.get(
    "/cart/my-cart",
    middlewareController.verifyToken,
    cartController.getMyCart
);

// * GET A CART
router.get("/cart/:id", cartController.getCart);

// * ADD ITEM TO CART
router.post(
    "/cart/add-to-cart",
    middlewareController.verifyToken,
    middlewareController.checkQuantityProduct,
    cartController.addItemToCart
);

// * UPDATE CART
router.put(
    "/cart/:id",
    middlewareController.verifyToken,
    middlewareController.validateUpdateCart,
    middlewareController.isRequestValidated,
    cartController.updateCart
);

// * REMOVE ITEM FROM CART
router.put(
    "/cart/remove-item-from-cart/:id",
    middlewareController.verifyToken,
    cartController.removeItemFromCart
);

// * DELETE CART
router.delete(
    "/cart/:id",
    middlewareController.verifyTokenAndAdminAuth,
    cartController.deleteCart
);

export default router;