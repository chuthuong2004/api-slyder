import jwt from 'jsonwebtoken';
import { check, validationResult } from 'express-validator';

function validateEmail(email) {
    let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (email.match(regexEmail)) {
        return true;
    } else {
        return false;
    }
}

const middlewareController = {
    // verifyToken
    verifyToken: (req, res, next) => {
        const token = req.headers.token;
        if (token) {
            // Bearer 62135461
            const accessToken = token.split(' ')[1];
            jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
                if (err) {
                    return res.status(403).json({ message: 'Token này đã hết hạn' })
                }
                req.user = user;
                next();
            })
        } else {
            res.status(401).json({ message: 'Vui lòng đăng nhập !' });
        }
    },
    verifyTokenAndAdminAuth: (req, res, next) => {
        middlewareController.verifyToken(req, res, () => {
            if (req.user.isAdmin) {
                next();
            } else {
                res.status(403).json({ message: 'Bạn không có quyền Admin' });
            }
        });
    },
    // validateEmail: (req, res, next) => {
    //     const { email, username, password } = req.body;
    //     if (validateEmail(email) && username.length >= 6 && password.length >= 6) {
    //         next();
    //     } else {
    //         res.status(403).json({ error: true, message: 'Vui lòng nhập thông tin hợp lệ' })
    //     }   

    // },
    validateSignupRequest: [
        check('email')
        .notEmpty()
        .withMessage('Email is required'),
        check('email')
        .isEmail()
        .withMessage('Valid Email is required'),
        check('username')
        .notEmpty()
        .withMessage('Username is required'),
        check('password')
        .notEmpty()
        .withMessage('Password is required'),
        check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
    ],
    validateSigninRequest: [
        check('username')
        .notEmpty()
        .withMessage('Username is required'),
        check('password')
        .notEmpty()
        .withMessage('Password is required'),
        check('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
    ],
    validateCatalogRequest: [
        check('name')
        .notEmpty()
        .withMessage('Name is required'),
    ],
    isRequestValidated: (req, res, next) => {
        const errors = validationResult(req)
        if (errors.array().length > 0) {
            return res.status(400).json({ errors: errors.array()[0].msg })
        } else {
            next();
        }
    }
}
export default middlewareController;