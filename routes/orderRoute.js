import express from "express";
import middlewareController from "../middlewares/middlewareController.js";
import orderController from "../controllers/orderController.js";
const router = express.Router();

// * NEW ORDER
router.post(
    "/order/new",
    middlewareController.verifyToken,
    middlewareController.validateOrder,
    middlewareController.isRequestValidated,
    orderController.newOrder
);

// * MY ORDER
router.get(
    "/order/me",
    middlewareController.verifyToken,
    orderController.myOrder
);

// GET A ORDER v2
router.get(
    "/order/me/:id",
    middlewareController.verifyToken,
    orderController.getSingleOrderV2
);

// * GET SINGLE ORDER
router.get(
    "/order/:id",
    middlewareController.verifyToken,
    orderController.getSingleOrder
);

// CANCEL ORDER
router.put(
    "/order/cancel/:id",
    middlewareController.verifyToken,
    orderController.cancelOrder
);

export default router;