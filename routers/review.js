import express from 'express';
import reviewController from '../controllers/reviewController.js';
const router = express.Router();
// GET ALL REVIEW
router.get('/', reviewController.getAllReview); // lấy tất cả sản phẩm
router.get('/:id', reviewController.getAReview); // lấy sản phẩm dựa trên :slug (name của producdt)
router.post('/', reviewController.addReview); // thêm mới 1 product
router.put('/:id', reviewController.updateReview); // update 1 product
// router.delete('/:id', deleteProduct);
router.patch('/restore/:id', reviewController.restoreReview);
router.delete('/:id', reviewController.destroyReview);
router.delete('/force/:id', reviewController.forceDestroyReview);

export default router;