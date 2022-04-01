import express from 'express';
import middlewareController from '../controllers/middlewareController.js';
const router = express.Router();

// GET ALL USER
// router.get('/', middlewareController.verifyToken, getAllUser);

// GET A USER
// router.get('/:id', getUser);

// UPDATE USER
// router.put('/:id', updateUser);

// DELETE USER
// router.delete('/:id', middlewareController.verifyTokenAndAdminAuth, deleteUser);

// FORGOT PASSWORD
// router.post('/forgot-password', forgotPassword);

// CHANGE PASSWORD
// router.post('/change-password/:id', changePassword);
export default router;