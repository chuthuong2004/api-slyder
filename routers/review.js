import express from 'express';
import middlewareController from '../controllers/middlewareController.js';
import reviewController from '../controllers/reviewController.js';
const router = express.Router();

// ! GET ALL REVIEWS
router.get('/reviews', reviewController.getAllReview); // lấy tất cả sản phẩm

// ! GET REVIEW
router.get('/review/:id', reviewController.getAReview); // lấy sản phẩm dựa trên :slug (name của producdt)

// ! CREATE REVIEW ---  midleware để đã giao hàng mới được thêm nhận xét
router.post('/review/new', middlewareController.verifyToken, reviewController.addReview); // thêm mới 1 product

// ! UPDATE REVIEW
router.put('/review/:id', middlewareController.verifyToken, reviewController.updateReview); // update 1 product

// ! RESTORE REVIEW
router.patch('/reivew/restore/:id', middlewareController.verifyToken, reviewController.restoreReview);

// ! SOFT DELETE REVIEW
router.delete('/review/:id', middlewareController.verifyToken, reviewController.destroyReview);

// ! DELETE REVIEW
router.delete('/review/force/:id', middlewareController.verifyToken, reviewController.forceDestroyReview);

export default router;