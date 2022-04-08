import express from 'express';
import authController from '../controllers/authController.js';
import middlewareController from '../controllers/middlewareController.js';
const router = express.Router();

// * REGISTER
router.post('/auth/register', middlewareController.validateSignupRequest, middlewareController.isRequestValidated, authController.registerUser);

// * SIGIN
router.post('/auth/login', middlewareController.validateSigninRequest, middlewareController.isRequestValidated, authController.loginUser);

// * REFRESH
router.post('/auth/refresh', authController.requestRefreshToken)

// * LOGOUT
router.post('/auth/logout', middlewareController.verifyToken, authController.logoutUser);
export default router;