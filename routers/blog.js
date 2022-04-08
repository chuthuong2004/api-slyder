import express from 'express';
import blogController from '../controllers/blogController.js';
const router = express.Router();
import multer from 'multer'
import shortid from 'shortid'
import path from 'path'
import { fileURLToPath } from 'url';
import middlewareController from '../controllers/middlewareController.js';
const __filename = fileURLToPath(
    import.meta.url);
// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), 'uploads/blogs'));
    },
    filename: function(req, file, cb) {
        cb(null, shortid.generate() + '-' + file.originalname)
    }
})
const upload = multer({ storage })

//http://localhost:5000/posts

// ! GET ALL BLOGS --- PAGINATION
router.get('/blogs', blogController.getAllBlog);

// * GET BLOG DETAILS
router.get('/blog/:id', blogController.getAblog)

// * GET ALL BLOGS --- ADMIN
router.get('/admin/blogs', middlewareController.verifyTokenAndAdminAuth, blogController.getAdminBlog);

// * CREATE BLOG
router.post('/blog/new', middlewareController.verifyToken, upload.single('attachment'), blogController.createBlog);

// * UPDATE BLOG
router.put('/blog/:id', middlewareController.verifyToken, upload.single('attachment'), blogController.updateBlog); // update 1 blog
router.patch('/restore/:id', middlewareController.verifyToken, blogController.restoreBlog); // restore
router.delete('/:id', middlewareController.verifyToken, blogController.destroyBlog);
router.delete('/force/:id', middlewareController.verifyToken, blogController.forceDestroyBlog);
export default router;