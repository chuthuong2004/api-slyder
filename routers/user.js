import express from 'express';
import middlewareController from '../controllers/middlewareController.js';
import userController from '../controllers/userController.js';
const router = express.Router();

// GET ALL USER
router.get('/', middlewareController.verifyToken, userController.getAllUser);

// GET A USER
router.get('/:id', middlewareController.verifyToken, userController.getUser);

// UPDATE USER
router.put('/:id', middlewareController.verifyToken, userController.updateUser);

// DELETE USER
router.delete('/:id', middlewareController.verifyTokenAndAdminAuth, userController.deleteUser);

// FORGOT PASSWORD
router.post('/forgot-password', middlewareController.validateEmail, userController.forgotPassword);

// CHANGE PASSWORD
router.post('/change-password/:id', middlewareController.verifyToken, middlewareController.validateChangePassword, middlewareController.isRequestValidated, userController.changePassword);
export default router;