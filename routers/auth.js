import express from 'express';
import authController from '../controllers/authController.js';
import middlewareController from '../controllers/middlewareController.js';
const router = express.Router();

// REGISTER
router.post('/register', middlewareController.validateSignupRequest, middlewareController.isRequestValidated, authController.registerUser);

// SIGIN
router.post('/login', middlewareController.validateSigninRequest, middlewareController.isRequestValidated, authController.loginUser);

// REFRESH
router.post('/refresh', authController.requestRefreshToken)

// LOGOUT
router.post('/logout', middlewareController.verifyToken, authController.logoutUser);
export default router;