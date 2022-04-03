import express from 'express';
import middlewareController from '../controllers/middlewareController.js';
import productController from '../controllers/productController.js';
import multer from 'multer'
import shortid from 'shortid'
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);
const router = express.Router();

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), 'uploads/products'));
    },
    filename: function(req, file, cb) {
        cb(null, shortid.generate() + '-' + file.originalname)
    }
})

const upload = multer({ storage })

router.get('/', productController.getAllProduct); // lấy tất cả sản phẩm
// router.get('/:slug', productController.getProduct); // lấy sản phẩm dựa trên :slug (name của producdt)
router.get('/:id', productController.getProduct); // lấy sản phẩm dựa trên :slug (name của producdt)
router.post('/', middlewareController.verifyTokenAndAdminAuth, upload.array('images'), productController.addProduct); // thêm mới 1 product
router.put('/:id', middlewareController.verifyTokenAndAdminAuth, upload.array('images'), productController.updateProduct); // update 1 product
// router.delete('/:id', deleteProduct);
router.patch('/restore/:id', middlewareController.verifyTokenAndAdminAuth, productController.restoreProduct);
router.delete('/:id', middlewareController.verifyTokenAndAdminAuth, productController.destroyProduct);
router.delete('/force/:id', middlewareController.verifyTokenAndAdminAuth, productController.forceDestroyProduct);
export default router;