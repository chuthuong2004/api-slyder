import express from 'express';
import middlewareController from '../controllers/middlewareController.js';
import userController from '../controllers/userController.js';
const router = express.Router();

// * GET ALL USER ---- Admin
router.get('/admin/users', middlewareController.verifyTokenAndAdminAuth, userController.getAllUser);

// * GET A USER ---- Admin
router.get('/admin/user/:id', middlewareController.verifyTokenAndAdminAuth, userController.getUser);

// * UPDATE USER ROLE ----- Admin
router.put('/admin/user/:id', middlewareController.verifyTokenAndAdminAuth, userController.updateUserRole);

// * DELETE USER ----- Admin
router.delete('/admin/user/:id', middlewareController.verifyTokenAndAdminAuth, userController.deleteUser);

// * GET USER DETAILS
router.get('/me', middlewareController.verifyToken, userController.getUserDetails);

// * UPDATE USER
router.put('/me/update', middlewareController.verifyToken, userController.updateProfile);

// * FORGOT PASSWORD
router.post('/password/forgot', middlewareController.validateEmail, middlewareController.isRequestValidated, userController.forgotPassword);

// * CHANGE PASSWORD
router.post('/password/update', middlewareController.verifyToken, middlewareController.validateChangePassword, middlewareController.isRequestValidated, userController.changePassword);
export default router;