import { BlogModel } from "../models/BlogModel.js";
import { UserModel } from "../models/UserModel.js";

const blogController = {
  // * GET ALL BLOGS
  getAllBlog: async (req, res) => {
    try {
      const features = new APIFeatures(
        BlogModel.find().populate({
          path: "author",
          populate: { path: "reviews cart orders" },
        }),
        req.query
      )
        .paginating()
        .sorting()
        .searching()
        .filtering();
      const blogs = await features.query;
      res.status(200).json({
        success: true,
        countDocument: blogs.length,
        resultPerPage: req.query.limit * 1 || 0,
        data: blogs,
      });
    } catch (err) {
      res.status(500).json({ error: err });
    }
  },

  // * GET BLOG DETAILS
  getAblog: async (req, res) => {
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

  // * CREATE BLOG
  createBlog: async (req, res) => {
    try {
      const newBlog = req.body;
      if (req.file) {
        newBlog.attachment = "/public/blogs/" + req.file.filename;
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
  updateBlog: async (req, res) => {
    try {
      const newBlog = req.body;
      if (req.file) {
        newBlog.attachment = "/public/blogs/" + req.file.filename;
      }
      const blog = await BlogModel.findOneAndUpdate(
        { _id: req.params.id },
        newBlog,
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: "C???p nh???t blog th??nh c??ng !",
        blog,
      });
    } catch (err) {
      res.status(500).json({ error: err });
    }
  },

  // * SOFT DELETE BLOG
  destroyBlog: async (req, res, next) => {
    try {
      const destroyBlog = await BlogModel.delete({ _id: req.params.id });
      if (!destroyBlog) {
        res.status(404).json({
          success: false,
          message: "Kh??ng t??m th???y blog ????? x??? l?? x??a m???m",
        });
      } else {
        res.status(200).json({
          success: true,
          message: "X??a m???m th??nh c??ng !",
        });
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  // * DELETE BLOG
  forceDestroyBlog: async (req, res, next) => {
    try {
      await UserModel.updateMany(
        {
          blogs: req.params.id,
        },
        {
          $pull: { blogs: req.params.id },
        }
      );
      const deleteBlog = await BlogModel.deleteOne({ _id: req.params.id });
      if (!deleteBlog) {
        res.status(404).json({
          success: false,
          message: "Kh??ng t??m th???y blog ????? x??? l?? x??a h???n !",
        });
      } else {
        res.status(200).json({
          success: true,
          message: "???? x??a blog th??nh c??ng !",
        });
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  // * RESTORE BLOG
  restoreBlog: async (req, res, next) => {
    try {
      const restoreBlog = await BlogModel.restore({ _id: req.params.id });
      if (!restoreBlog) {
        res.status(404).json({
          success: false,
          message: "Kh??ng t??m th???y blog ????? kh??i ph???c",
        });
      } else {
        res.status(200).json({
          success: true,
          message: "Kh??i ph???c blog th??nh c??ng",
        });
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
};

export default blogController;
