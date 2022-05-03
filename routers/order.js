import express from "express";
import middlewareController from "../controllers/middlewareController.js";
import orderController from "../controllers/orderController.js";
const router = express.Router();

// * NEW ORDER
router.post(
    "/order/new",
    middlewareController.verifyToken,
    orderController.newOrder
);

// * MY ORDER
router.get(
    "/order/me",
    middlewareController.verifyToken,
    orderController.myOrder
);

// * GET SINGLE ORDER
router.get(
    "/order/:id",
    middlewareController.verifyToken,
    orderController.getSingleOrder
);

// * GET ALL ORDERS --- ADMIN
router.get(
    "/admin/orders",
    middlewareController.verifyTokenAndAdminAuth,
    orderController.getAllOrders
);

// * UPDATE ORDER --- ADMIN ---- design send mail
router.put(
    "/admin/order/:id",
    middlewareController.verifyTokenAndAdminAuth,
    middlewareController.checkStatusOrder,
    orderController.updateOrder
);

// * DELETE ORDER --- ADMIN
router.delete(
    "/admin/order/:id",
    middlewareController.verifyTokenAndAdminAuth,
    orderController.deleteOrder
);
export default router;