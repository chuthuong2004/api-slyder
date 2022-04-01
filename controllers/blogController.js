import { BlogModel } from '../models/BlogModel.js';
import { UserModel } from '../models/UserModal.js';

const blogController = {
    getAllBlog: async(req, res) => {
        try {
            const blogs = await BlogModel.find();
            res.status(200).json(blogs);
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },
    getBlog: async(req, res) => {
        try {
            const blog = await BlogModel.findOne({ slug: req.params.slug });
            res.status(200).json(blog);
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },
    getAblog: async(req, res) => {
        try {
            const blog = await BlogModel.findById(req.params.id).populate("author");
            res.status(200).json(blog);
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },
    createBlog: async(req, res) => {
        try {
            const newBlog = req.body;
            const blog = await new BlogModel(newBlog);
            await blog.save();
            if (req.body.author) {
                const user = await UserModel.findById(req.body.author);
                await user.updateOne({ $push: { blogs: blog._id } });
            }
            res.status(200).json(blog);
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },
    updateBlog: async(req, res) => {
        try {
            const updateBlog = req.body;

            const blog = await BlogModel.findOneAndUpdate({ _id: updateBlog._id },
                updateBlog, { new: true }
            );

            res.status(200).json(blog);
        } catch (err) {
            res.status(500).json({ error: err });
        }
    },
    deleteBlog: async(req, res) => {
        try {
            await UserModel.updateMany({
                blogs: req.params.id
            }, {
                $pull: { blogs: req.params.id }
            })
            await BlogModel.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: 'Deleted blog successfully' })
        } catch (error) {
            res.status(500).json({ error: error })
        }
    }
}

export default blogController;