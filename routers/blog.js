import express from 'express';
import blogController from '../controllers/blogController.js';

const router = express.Router();
//http://localhost:5000/posts

router.get('/', blogController.getAllBlog);
router.get('/:id', blogController.getAblog)
    // router.get('/:slug', blogController.getBlog); // lấy blog dựa trên :slug 
router.post('/', blogController.createBlog);
router.put('/:id', blogController.updateBlog); // update 1 blog
// router.patch('/restore/:id', restoreBlog); // restore
// router.delete('/:id', deleteProduct);
router.delete('/:id', blogController.deleteBlog);
// router.delete('/force/:id', forceDestroyBlog);
export default router;