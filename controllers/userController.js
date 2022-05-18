import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { BlogModel } from "../models/BlogModel.js";
import { UserModel } from "../models/UserModel.js";
import { sendEmail } from "../utils/sendMail.js";
import dotenv from "dotenv";
dotenv.config();
const userController = {
    // * GET ALL USERS
    getAllUser: async(req, res) => {
        try {
            var page = req.query.page * 1;
            var limit = req.query.limit * 1;
            if ((limit && !page) || (page == 0 && limit == 0)) {
                page = 1;
            }
            if (!page && !limit) {
                page = 1;
                limit = 0;
            }
            var skip = (page - 1) * limit;
            const users = await UserModel.find()
                .skip(skip)
                .limit(limit)
                .populate("cart")
                .populate({
                    path: "reviews",
                    populate: { path: "product" },
                })
                .populate("blogs")
                .populate("orders");

            const userCount = await UserModel.countDocuments();
            res.status(200).json({
                success: true,
                countDocument: userCount,
                resultPerPage: limit,
                users,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    // * GET A USER
    getUser: async(req, res) => {
        try {
            const user = await UserModel.findById(req.params.id)
                .populate("blogs")
                .populate("reviews")
                .populate("cart")
                .populate("orders");
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "Không tìm thấy user !",
                });
            }
            res.status(200).json({
                success: true,
                user,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * GET USER DETAILS
    getUserDetails: async(req, res) => {
        try {
            const user = await UserModel.findById(req.user.id)
                .populate("blogs")
                .populate("reviews")
                .populate("cart")
                .populate("orders");
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy người dùng !",
                });
            }
            res.status(200).json({
                success: true,
                user,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    // * GET USER DETAILS
    getUserDetailsV2: async(req, res) => {
        try {
            const user = await UserModel.findById(req.user.id);
            if (!user)
                return res
                    .status(404)
                    .json({ success: false, message: "Không tìm thấy người dùng !" });
            res.status(200).json({
                success: true,
                user,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    // * UPDATE USER PROFILE
    updateProfile: async(req, res) => {
        try {
            const newUserData = {
                username: req.body.username,
                email: req.body.email,
            };
            if (req.file) {
                newUserData.avatar =
                    process.env.API + "public/avatars/" + req.file.filename;
            }
            const shipmentDetail = {
                fullName: req.body.fullName,
                phone: req.body.phone,
                province: req.body.province,
                district: req.body.district,
                ward: req.body.ward,
                address: req.body.address,
                isDefault: req.body.isDefault,
            };
            const user = await UserModel.findByIdAndUpdate(req.user.id, newUserData, {
                new: true,
                runValidators: true,
                useFindAndModify: false,
            });

            res.status(200).json({
                success: true,
                message: "Cập nhật thông tin cá nhân thành công !",
                user,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    addShipmentDetail: async(req, res) => {
        try {
            const shipmentDetail = {
                fullName: req.body.fullName,
                phone: req.body.phone,
                province: req.body.province,
                district: req.body.district,
                ward: req.body.ward,
                address: req.body.address,
                isDefault: req.body.isDefault,
            };
            const user = await UserModel.findById(req.user.id);
            let update;
            if (!user.shipmentDetails) {
                console.log("khoong");
                update = { $set: { shipmentDetails: shipmentDetail } };
            } else {
                const shipmentDetailItem = user.shipmentDetails.find(
                    (item) =>
                    item.fullName === req.body.fullName &&
                    item.phone === req.body.phone &&
                    item.province === req.body.province &&
                    item.district === req.body.district &&
                    item.ward === req.body.ward &&
                    item.address === req.body.address
                );
                if (shipmentDetailItem) {
                    return res.status(400).json({
                        success: true,
                        message: "Thông tin giao hàng đã tồn tại !",
                    });
                }
                update = { $push: { shipmentDetails: shipmentDetail } };
            }
            const updated = await UserModel.findByIdAndUpdate(req.user.id, update, {
                new: true,
            });
            res.status(200).json({
                success: true,
                message: "Thêm thông tin giao hàng thành công !",
                user: updated,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    updateShipmentDetail: async(req, res) => {
        try {
            // const users = await UserModel.updateMany({}, { $set: { shipmentDetails: null } });
            // return res.status(200).json("OK");
            const user = await UserModel.findById(req.user.id);
            if (!user) {
                return res
                    .status(404)
                    .json({ success: false, message: "Không tìm thấy user" });
            }
            const shipmentDetail = user.shipmentDetails.find(
                (item) => item._id == req.params.id
            );
            if (!shipmentDetail) {
                return res.status(404).json({
                    success: false,
                    message: "Không tìm thấy thông tin giao hàng của bạn !",
                });
            }
            var condition = {
                user: req.user.id,
                "shipmentDetails._id": shipmentDetail._id,
            };
            var update = {
                $set: {
                    "shipmentDetails.$.isDefault": req.body.isDefault,
                    "shipmentDetails.$.fullName": req.body.fullName,
                    "shipmentDetails.$.phone": req.body.phone,
                    "shipmentDetails.$.province": req.body.province,
                    "shipmentDetails.$.district": req.body.district,
                    "shipmentDetails.$.ward": req.body.ward,
                    "shipmentDetails.$.address": req.body.address,
                },
            };
            const updateUser = await UserModel.findOneAndUpdate(condition, update, {
                new: true,
            });
            res.status(200).json({
                success: true,
                message: "Cập nhật thông tin giao hàng thành công !",
                user: updateUser,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    removeShipmentDetail: async(req, res) => {
        try {
            var condition = {
                user: req.user.id,
                "shipmentDetails._id": req.params.id,
            };
            var update = {
                $pull: { shipmentDetails: { _id: req.params.id } },
            };
            const user = await UserModel.findOneAndUpdate(condition, update, {
                new: true,
            });
            return res.status(200).json({
                success: true,
                message: "Xóa thông tin giao hàng thành công ",
                user: user,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    // * UPDATE USER ROLE --- ADMIN
    updateUserRole: async(req, res) => {
        try {
            // update role account
            await UserModel.findByIdAndUpdate(
                req.params.id, { isAdmin: req.body.isAdmin }, {
                    new: true,
                    runValidators: true,
                    useFindAndModify: false,
                }
            );

            res.status(200).json({
                success: true,
                message: "Cập nhật user thành công !",
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    // * DELETE USER ---- ADMIN
    deleteUser: async(req, res) => {
        try {
            // https://localhost:5000/api/users/4382657643
            await BlogModel.updateMany({ author: req.params.id }, { author: null });
            const user = await UserModel.findByIdAndDelete(req.params.id);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: "User không tồn tại !",
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: "Đã xóa user thành công !",
                });
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
                return res.status(404).json({
                    success: false,
                    message: "Email không tồn tại !",
                });
            }
            // create reusable transporter object using the default SMTP transport
            let newPassword = Math.random().toString(36).substring(2);
            const salt = await bcrypt.genSalt(10);
            const hasded = await bcrypt.hash(newPassword, salt);
            user.password = hasded;
            await user.save();
            try {
                await sendEmail({
                    email: user.email,
                    subject: "Lấy lại mật khẩu thành công !",
                    message: `Xin chào ${user.username},<br>
                    Cửa hàng LTH Store xin gửi lại mật khẩu của bạn. <br>
                    Mật khẩu mới: <b style="padding: 5px 7px; background: #eee; color: red"> ${newPassword} </b>`,
                });
            } catch (error) {
                return res.status(500).json({ error: error });
            }
            return res.status(200).json({
                success: true,
                message: `Mật khẩu mới đã được gửi về email [${user.email}] của bạn !`,
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * CHANGE PASSWORD
    changePassword: async(req, res) => {
        try {
            const user = await UserModel.findById(req.user.id).select("+password");
            const password = user.password;
            const salt = await bcrypt.genSalt(10);
            const currentPassword = req.body.currentPassword;
            const validPassword = await bcrypt.compare(currentPassword, password);
            if (!validPassword) {
                return res.status(404).json({
                    success: false,
                    message: "Mật khẩu hiện tại không đúng !",
                });
            }
            const confirmPassword = req.body.confirmPassword;
            const newPassword = req.body.newPassword;
            if (!(confirmPassword === newPassword)) {
                return res.status(404).json({
                    success: false,
                    message: "Mật khẩu nhập lại không khớp !",
                });
            }
            const hasded = await bcrypt.hash(newPassword, salt);
            user.password = hasded;
            await user.save();
            return res.status(200).json({
                success: true,
                message: "Mật khẩu của bạn đã được đổi thành công !",
            });
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
};
export default userController;