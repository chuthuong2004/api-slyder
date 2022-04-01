import bcrypt from 'bcrypt';
import { UserModel } from '../models/UserModal.js';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
let refreshTokens = [];

// GENERATE ACCESS TOKEN
const generateAccessToken = (user) => {
    return jwt.sign({
        id: user.id,
        isAdmin: user.isAdmin,
    }, process.env.JWT_ACCESS_KEY, { expiresIn: '1d' });
}

// GENERATE REFRESH TOKEN
const generateRefreshToken = (user) => {
    return jwt.sign({
        id: user.id,
        isAdmin: user.isAdmin,
    }, process.env.JWT_REFRESH_KEY, { expiresIn: '365d' });
}

const authController = {
    // REGISTER
    registerUser: async(req, res) => {
        try {
            const isExistUser = await UserModel.findOne({ email: req.body.email });
            if (isExistUser) return res.status(400).json({ message: 'Email đã tồn tại !' });
            const { username, password, email } = req.body;
            const salt = await bcrypt.genSalt(10);
            const hasded = await bcrypt.hash(password, salt);
            const newUser = await new UserModel({
                username,
                email,
                password: hasded,
            });
            const user = await newUser.save();
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    // LOGIN
    loginUser: async(req, res) => {
        try {
            const user = await UserModel.findOne({ username: req.body.username });
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy user !' });
            }
            const validPassword = await bcrypt.compare(
                req.body.password,
                user.password
            );
            if (!validPassword) {
                return res.status(404).json({ message: 'Mật khẩu không đúng !' });
            }
            if (user && validPassword) {
                const accessToken = generateAccessToken(user);
                const refreshToken = generateRefreshToken(user);
                refreshTokens.push(refreshToken);
                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: false, // deloy thì set true
                    path: '/',
                    // sameSite: 'strict',
                })
                const { password, ...orther } = user._doc;
                res.status(200).json({...orther, accessToken });
            }

        } catch (error) {
            res.status(500).json({ error: error })
        }
    },
    requestRefreshToken: async(req, res) => {
        // lấy refreshToken từ user
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: 'Bạn chưa xác thực !' });
        }
        if (!refreshTokens.includes(refreshToken)) {
            return res.status(403).json({ message: 'RefreshToken không hợp lệ' })
        }
        jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (error, user) => {
            if (error) {
                console.log(error);
            }
            refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
            // Create new access token, refreshToken
            const newAccessToken = generateAccessToken(user);
            const newRefreshToken = generateRefreshToken(user);
            refreshTokens.push(newRefreshToken)
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: false,
                path: '/',
                sameSite: 'strict',
            })
            res.status(200).json({ accessToken: newAccessToken });
        });
        // res.status(200).json(refreshToken);
    },
    logoutUser: async(req, res) => {
        try {
            res.clearCookie('refreshToken');
            refreshTokens = refreshTokens.filter(token => token !== req.cookies.refreshToken);
            res.status(200).json({ message: 'Đăng xuất thành công !' })
        } catch (error) {
            res.status(403).json({ error: error })
        }
    }
}

export default authController;


/* STORE TOKEN
    1. Local storage
        XSS
    2. HTTPONLY COOKIES:
        CSRF -> SAMESITE
    3. REDUX STORE -> ACCESSTOKEN
        HTTPONLY COOKIES -> REFRESHTOKEN
*/

// Dùng BFF Pattern (backend for frontend)