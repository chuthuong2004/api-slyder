import { BlogModel } from '../models/BlogModel.js';
import { UserModel } from '../models/UserModal.js';

const blogController = {
    getAllBlog: async(req, res) => {
        try {
            const blogs = await BlogModel.find().populate({
                path: 'author',
                populate: { path: 'reviews' }
            }).populate({
                path: 'author',
                populate: { path: 'cart' }
            });
            res.status(200).json(blogs);
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },
    getAblog: async(req, res) => {
        try {
            const blog = await BlogModel.findById(req.params.id).populate({
                path: 'author',
                populate: { path: 'reviews' }
            }).populate({
                path: 'author',
                populate: { path: 'cart' }
            });
            res.status(200).json(blog);
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },
    createBlog: async(req, res) => {
        try {
            let attachmentUrl;
            if (req.file) {
                attachmentUrl = process.env.API + 'public/blogs/' + req.file.filename;
            }
            const { title, content } = req.body;
            const blog = await new BlogModel({
                title: title,
                content: content,
                author: req.user.id,
                attachment: attachmentUrl,
            });
            await blog.save();
            if (req.user.id) {
                const user = await UserModel.findById(req.user.id);
                await user.updateOne({ $push: { blogs: blog._id } });
            }

            res.status(200).json(blog);
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },
    updateBlog: async(req, res) => {
        try {

            let attachmentUrl;
            if (req.file) {
                attachmentUrl = process.env.API + 'public/blogs/' + req.file.filename;
            }
            const { title, content } = req.body;
            const updateBlog = {
                title: title,
                content: content,
                attachment: attachmentUrl,
            };
            const blog = await BlogModel.findOneAndUpdate({ _id: updateBlog._id },
                updateBlog, { new: true }
            );

            res.status(200).json(blog);
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },
    // [DELETE] /course/:,
    destroyBlog: async(req, res, next) => {
        try {
            const destroyBlog = await BlogModel.delete({ _id: req.params.id });
            if (!destroyBlog) {
                res.status(404).json('Không tìm thấy blog để xử lý xóa mềm')
            } else {
                res.status(200).json('Xóa mềm thành công !')
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    // [DELETE] /course/:id/for,
    forceDestroyBlog: async(req, res, next) => {
        try {
            await UserModel.updateMany({
                blogs: req.params.id
            }, {
                $pull: { blogs: req.params.id }
            })
            const deleteBlog = await BlogModel.deleteOne({ _id: req.params.id })
            if (!deleteBlog) {
                res.status(404).json('Không tìm thấy blog để xử lý xóa hẳn')
            } else {
                res.status(200).json('Deleted successfully')
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    },
    // [PATCH] /course/:id/resto,
    restoreBlog: async(req, res, next) => {
        try {
            const restoreBlog = await BlogModel.restore({ _id: req.params.id })
            if (!restoreBlog) {
                res.status(404).json('Không tìm thấy blog để khôi phục')
            } else {
                res.status(200).json('Khôi phục blog thành công')
            }
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }


}

export default blogController;