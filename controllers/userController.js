import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { BlogModel } from '../models/BlogModel.js';
import { UserModel } from '../models/UserModal.js';
import dotenv from 'dotenv';
dotenv.config();
const userController = {
    // * GET ALL USERS
    getAllUser: async(req, res) => {
        try {
            const users = await UserModel.find();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    // * GET A USER
    getUser: async(req, res) => {
        try {
            const user = await UserModel.findById(req.params.id).populate('blogs').populate('reviews').populate('cart');
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "Không tìm thấy user !"
                })
            }
            res.status(200).json({
                success: true,
                user
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * GET USER DETAILS
    getUserDetails: async(req, res) => {
        const user = await UserModel.findById(req.user.id);
        res.status(200).json({
            success: true,
            user,
        });
    },

    // * UPDATE USER PROFILE
    updateProfile: async(req, res) => {
        const newUserData = {
            username: req.body.username,
            email: req.body.email,
        }
        const user = await UserModel.findByIdAndUpdate(req.user.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        });

        res.status(200).json({
            success: true,
            user
        });
    },
    // * UPDATE USER ROLE --- ADMIN
    updateUserRole: async(req, res) => {
        const newUserData = {
            username: req.body.username,
            email: req.body.email,
            isAdmin: req.body.isAdmin
        }
        await UserModel.findByIdAndUpdate(req.params.id, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false,
        })

        res.status(200).json({
            success: true,
            message: "Update user successfully"
        })
    },
    // * DELETE USER ---- ADMIN
    deleteUser: async(req, res) => {
        try {
            // https://localhost:5000/api/users/4382657643
            await BlogModel.updateMany({ author: req.params.id }, { author: null })
            const user = await UserModel.findByIdAndDelete(req.params.id);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "User không tồn tại !"
                })
            } else {
                res.status(200).json({
                    success: true,
                    message: "Deleted user successfully"
                })
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * FORGOT PASSWORD
    forgotPassword: async(req, res) => {
        try {
            const email = req.body.email;
            const user = await UserModel.findOne({ email: email });
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "Email không tồn tại !"
                })
            } else {
                // create reusable transporter object using the default SMTP transport
                let newPassword = Math.random().toString(36).substring(7);
                const salt = await bcrypt.genSalt(10);
                const hasded = await bcrypt.hash(newPassword, salt);
                const newUser = await UserModel.findOneAndUpdate({ email: email }, { password: hasded }, { new: true });
                await newUser.save();
                let transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.EMAIL, // generated ethereal user
                        pass: process.env.PASSWORD, // generated ethereal password
                    },
                    tls: { rejectUnauthorized: false }
                });
                var info = {
                    from: '', //Email người gửi
                    to: `${user.email}`, // Email người nhận
                    subject: 'LẤY LẠI MẬT KHẨU',
                    //text: 'Nội dung thư, không có code html'
                    html: `Cửa hàng Slyder.vn xin gửi lại mật khẩu của bạn. <br>
            Mật khẩu mới: <b style="padding: 5px 7px; background: #eee; color: red"> ${newPassword} </b>`, // Nội dung thư, có thể có code html
                };
                transporter.sendMail(info, (err) => {
                    if (err) {
                        res.status(500).json({ err: err })
                    } else {
                        res.status(200).json({ success: true, message: `Mật khẩu mới đã gửi về ${user.email} thành công` });
                    }
                })
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * CHANGE PASSWORD
    changePassword: async(req, res) => {
        try {
            const user = await UserModel.findById(req.user.id).select('+password');
            const password = user.password;
            const salt = await bcrypt.genSalt(10);
            const currentPassword = req.body.currentPassword;
            const validPassword = await bcrypt.compare(
                currentPassword,
                password
            );
            if (!validPassword) {
                res.status(404).json({
                    success: false,
                    message: "Mật khẩu hiện tại không đúng !"
                })
            } else {
                const comfirmPassword = req.body.comfirmPassword;
                const newPassword = req.body.newPassword;
                if (!(comfirmPassword === newPassword)) {
                    res.status(404).json({
                        success: false,
                        message: "Mật khẩu nhập lại không khớp !"
                    })
                } else {
                    const hasded = await bcrypt.hash(newPassword, salt);
                    const newUser = await UserModel.findByIdAndUpdate(req.params.id, { password: hasded }, { new: true });
                    await newUser.save();
                    res.status(200).json(user);
                }
            }

        } catch (error) {
            res.status(500).json({ error: error });
        }
    }
}
export default userController;