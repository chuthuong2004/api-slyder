import express from 'express';
import categoryController from '../controllers/categoryController.js';
import middlewareController from '../controllers/middlewareController.js';
const router = express.Router();

import multer from 'multer'
import shortid from 'shortid'
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), 'uploads/categories'));
    },
    filename: function(req, file, cb) {
        cb(null, shortid.generate() + '-' + file.originalname)
    }
})

const upload = multer({ storage })



router.get('/', categoryController.getAllCategory);
router.get('/:id', categoryController.getCategory);
router.post('/', middlewareController.verifyTokenAndAdminAuth, upload.single('imageCate'), categoryController.addCategory);
router.put('/:id', middlewareController.verifyTokenAndAdminAuth, upload.single('imageCate'), categoryController.updateCategory);
router.delete('/:id', middlewareController.verifyTokenAndAdminAuth, categoryController.deleteCategory);
export default router;