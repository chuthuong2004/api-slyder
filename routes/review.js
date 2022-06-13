import express from "express";
import middlewareController from "../middlewares/middlewareController.js";
import reviewController from "../controllers/reviewController.js";
const router = express.Router();

// * GET ALL REVIEWS
router.get("/reviews", reviewController.getAllReview); //

// * GET ALL REVIEWS --- ADMIN
router.get(
    "/reviews",
    middlewareController.verifyTokenAndAdminAuth,
    reviewController.getAllReview
); //

// * GET REVIEW
router.get("/review/:id", reviewController.getAReview); //

// * CREATE REVIEW ---  midleware để đã giao hàng mới được thêm nhận xét --DONE--
router.post(
    "/review/new",
    middlewareController.verifyToken,
    middlewareController.verifyOrderDelivered,
    reviewController.addReview
); // thêm mới 1 reviews

// * UPDATE REVIEW
router.put(
    "/review/:id",
    middlewareController.verifyToken,
    reviewController.updateReview
); // update 1 review

// * RESTORE REVIEW
router.patch(
    "/reivew/restore/:id",
    middlewareController.verifyToken,
    reviewController.restoreReview
);

// * SOFT DELETE REVIEW
router.delete(
    "/review/:id",
    middlewareController.verifyToken,
    reviewController.destroyReview
);

// * DELETE REVIEW
router.delete(
    "/review/force/:id",
    middlewareController.verifyToken,
    reviewController.forceDestroyReview
);

export default router;