import express from 'express';
import middlewareController from '../controllers/middlewareController.js';
import reviewController from '../controllers/reviewController.js';
const router = express.Router();
// GET ALL REVIEW
router.get('/', reviewController.getAllReview); // lấy tất cả sản phẩm
router.get('/:id', reviewController.getAReview); // lấy sản phẩm dựa trên :slug (name của producdt)
router.post('/', middlewareController.verifyToken, reviewController.addReview); // thêm mới 1 product
router.put('/:id', middlewareController.verifyToken, reviewController.updateReview); // update 1 product
router.patch('/restore/:id', middlewareController.verifyToken, middlewareController.verifyToken, reviewController.restoreReview);
router.delete('/:id', middlewareController.verifyToken, reviewController.destroyReview);
router.delete('/force/:id', middlewareController.verifyToken, reviewController.forceDestroyReview);

export default router;