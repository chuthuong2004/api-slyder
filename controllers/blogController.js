import { BlogModel } from "../models/BlogModel.js";
import { UserModel } from "../models/UserModel.js";

const blogController = {
    // * GET ALL BLOGS
    getAllBlog: async(req, res) => {
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
            const productsCount = await BlogModel.countDocuments();
            const blogs = await BlogModel.find()
                .skip(skip)
                .limit(limit)
                .populate({
                    path: "author",
                    populate: { path: "reviews cart orders" },
                });
            res.status(200).json({
                success: true,
                productsCount,
                resultPerPage: limit,
                blogs,
            });
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },

    // * GET ALL BLOGS
    getAllBlogV2: async(req, res) => {
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
            const productsCount = await BlogModel.countDocuments();
            const blogs = await BlogModel.find().skip(skip).limit(limit);
            res.status(200).json({
                success: true,
                productsCount,
                resultPerPage: limit,
                blogs,
            });
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },
    // * GET ALL BLOGS --- ADMIN
    getAdminBlog: async(req, res) => {
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
            const productsCount = await BlogModel.countDocuments();
            const blogs = await BlogModel.find()
                .skip(skip)
                .limit(limit)
                .populate({
                    path: "author",
                    populate: { path: "reviews cart orders" },
                });
            res.status(200).json({
                success: true,
                productsCount,
                resultPerPage: limit,
                blogs,
            });
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },

    // * GET BLOG DETAILS
    getAblog: async(req, res) => {
        try {
            const blog = await BlogModel.findById(req.params.id).populate({
                path: "author",
                populate: { path: "reviews cart orders" },
            });
            res.status(200).json({
                success: true,
                blog,
            });
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },

    // * GET BLOG DETAILS
    getAblogV2: async(req, res) => {
        try {
            const blog = await BlogModel.findById(req.params.id);
            if (!blog)
                return res
                    .status(400)
                    .json({ success: false, message: "Không tìm thấy blog !" });
            res.status(200).json({
                success: true,
                blog,
            });
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },
    // * CREATE BLOG
    createBlog: async(req, res) => {
        try {
            const newBlog = req.body;
            if (req.file) {
                newBlog.attachment =
                    process.env.API + "public/blogs/" + req.file.filename;
            }
            newBlog.author = req.user.id;
            const blog = await new BlogModel(newBlog);
            await blog.save();
            if (req.user.id) {
                const user = await UserModel.findById(req.user.id);
                await user.updateOne({ $push: { blogs: blog._id } });
            }

            res.status(200).json({
                success: true,
                blog,
            });
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },

    // * UPDATE BLOG
    updateBlog: async(req, res) => {
        try {
            const newBlog = req.body;
            if (req.file) {
                newBlog.attachment =
                    process.env.API + "public/blogs/" + req.file.filename;
            }
            const blog = await BlogModel.findOneAndUpdate({ _id: req.params.id },
                newBlog, { new: true }
            );

            res.status(200).json({
                success: true,
                message: "Cập nhật blog thành công !",
                blog,
            });
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },

    // * SOFT DELETE BLOG
    destroyBlog: async(req, res, next) => {
        try {
            const destroyBlog = await BlogModel.delete({ _id: req.params.id });
            if (!destroyBlog) {
                res.status(404).json({
                    success: false,
                    message: "Không tìm thấy blog để xử lý xóa mềm",
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: "Xóa mềm thành công !",
                });
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * DELETE BLOG
    forceDestroyBlog: async(req, res, next) => {
        try {
            await UserModel.updateMany({
                blogs: req.params.id,
            }, {
                $pull: { blogs: req.params.id },
            });
            const deleteBlog = await BlogModel.deleteOne({ _id: req.params.id });
            if (!deleteBlog) {
                res.status(404).json({
                    success: false,
                    message: "Không tìm thấy blog để xử lý xóa hẳn !",
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: "Đã xóa blog thành công !",
                });
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },

    // * RESTORE BLOG
    restoreBlog: async(req, res, next) => {
        try {
            const restoreBlog = await BlogModel.restore({ _id: req.params.id });
            if (!restoreBlog) {
                res.status(404).json({
                    success: false,
                    message: "Không tìm thấy blog để khôi phục",
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: "Khôi phục blog thành công",
                });
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
};

export default blogController;