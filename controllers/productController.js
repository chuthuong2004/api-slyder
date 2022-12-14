import { CartModel } from "../models/CartModel.js";
import { CategoryModel } from "../models/CategoryModel.js";
import { ProductModel } from "../models/ProductModel.js";
import { ReviewModel } from "../models/ReviewModel.js";
import { UserModel } from "../models/UserModel.js";
import { APIFeatures } from "../utils/APIFeatures.js";
const productController = {
  // * GET ALL PRODUCT
  getAllProduct: async (req, res) => {
    try {
      const features = new APIFeatures(
        ProductModel.find()
          .populate({
            path: "category",
            populate: { path: "catalog" },
          })
          .populate({
            path: "reviews",
            populate: { path: "user" },
          }),
        req.query
      )
        .paginating()
        .sorting()
        .searching()
        .filtering();
      const products = await features.query;
      res.status(200).json({
        success: true,
        countDocument: products.length,
        resultPerPage: req.query.limit * 1 || 0,
        data: products,
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  // GET ALL PRODUCT V2 APP
  getAllProductV2: async (req, res) => {
    try {
      const features1 = new APIFeatures(ProductModel.find(), req.query)
        .paginating()
        .sorting()
        .searching()
        .filtering();
      const features2 = new APIFeatures(ProductModel.find(), req.query)
        .sorting()
        .searching()
        .filtering();

      var products = await features1.query;

      var products1 = await features2.query;
      res.status(200).json({
        success: true,
        documents: products1.length,
        countDocuments: products.length,
        resultPerPage: req.query.limit * 1 || 0,
        data: products,
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  getAllProductByCategory: async (req, res) => {
    try {
      const features = new APIFeatures(
        ProductModel.find({ category: req.params.idCate }),
        req.query
      )
        .paginating()
        .sorting()
        .filtering();
      var products = await features.query;
      res.status(200).json({
        success: true,
        countDocuments: products.length,
        resultPerPage: req.query.limit * 1 || 0,
        data: products,
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  // * GET ALL PRODUCT ---- ADMIN
  // getAdminProducts: async(req, res) => {
  //     try {
  //         const products = await ProductModel.find();
  //         res.status(200).json({
  //             success: true,
  //             products,
  //         });
  //     } catch (error) {
  //         res.status(500).json({ error: error });
  //     }
  // },

  // * GET PRODUCT DETAILS
  getProductDetails: async (req, res) => {
    try {
      const product = await ProductModel.findById(req.params.id)
        .populate("category")
        .populate({
          path: "reviews",
          match: { enable: true },
        });
      if (!product)
        return res.status(404).json({
          success: false,
          message: "Kh??ng t??m th???y s???n ph???m !",
        });
      res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  getProductDetailsV2: async (req, res) => {
    try {
      const product = await ProductModel.findById(req.params.id);
      if (!product)
        return res.status(404).json({
          success: false,
          message: "Kh??ng t??m th???y s???n ph???m !",
        });
      res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  // ! CREATE PRODCUCT --- HANDLE IMAGES ---DONE--- ----handle add many size, color and amount
  createProduct: async (req, res) => {
    return res.status(200).json(req.body);
    try {
      const { color, size, amount, ...other } = req.body;
      let images = [];
      if (req.files.length > 0) {
        images = req.files.map((file) => {
          return { img: "/public/products/" + file.filename };
        });
      }
      let detail = [];
      let detailColor = [];
      detailColor.push({ color: color, amount: amount });
      detail.push({ size: size, detailColor: detailColor });
      const newProduct = other;
      newProduct.detail = detail;
      newProduct.images = images;
      const product = new ProductModel(newProduct);
      await product.save();
      await CategoryModel.updateOne(
        {
          _id: newProduct.category,
        },
        {
          $push: { products: product._id },
        }
      );
      res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  // ! UPDATE PRODUCT -- ki???m tra size color amount khi update
  updateProduct: async (req, res) => {
    try {
      let product = await ProductModel.findById(req.params.id);
      if (!product)
        return res
          .status(404)
          .json({ success: false, message: "Kh??ng t??m th???y s???n ph???m !" });

      const updateProduct = req.body;
      let images = [];
      if (req.files.length > 0) {
        images = req.files.map((file) => {
          return { img: process.env.API + "public/products/" + file.filename };
        });
        updateProduct.images = images;
      }
      product = await ProductModel.findByIdAndUpdate(
        req.params.id,
        updateProduct,
        {
          new: true,
          runValidators: true,
          useFindAndModify: false,
        },
        { new: true }
      );
      res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  // * SOFT DELETE PRODUCT
  destroyProduct: async (req, res, next) => {
    try {
      const deleteProduct = await ProductModel.delete({ _id: req.params.id });
      if (!deleteProduct) {
        res.status(404).json({
          success: false,
          message: "Kh??ng t??m th???y product ????? x??? l?? x??a m???m !",
        });
      } else {
        res.status(200).json({
          success: false,
          message: "X??a m???m th??nh c??ng !",
        });
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  // ! DELETE PRODUCT --- HANDLE DELETE IMAGES
  forceDestroyProduct: async (req, res) => {
    try {
      // T??m t???t c??? c??c carts c?? ch???a product n??y
      const carts = await CartModel.find({
        "cartItems.$.product": req.params.id,
      });

      // * DELETE ITEM FROM CART SUCCESSFULLY
      if (carts)
        //
        carts.forEach(async (cart) => {
          if (cart.cartItems.length == 1) {
            await UserModel.updateOne({ cart: cart._id }, { cart: null });
            await CartModel.findByIdAndDelete(cart._id);
          } else {
            await CartModel.updateMany(
              { "cartItems.$.product": req.params.id },
              { $pull: { cartItems: { product: req.params.id } } }
            );
          }
        });

      // x??a product kh???i danh m???c
      await CategoryModel.updateMany(
        {
          products: req.params.id,
        },
        {
          $pull: { products: req.params.id },
        }
      );

      // T??m review c???a product n??y v?? x??a review
      await ReviewModel.findOneAndDelete({ product: req.params.id });
      const deleteProduct = await ProductModel.deleteOne({
        _id: req.params.id,
      });
      if (!deleteProduct) {
        res.status(404).json({
          success: false,
          message: "Kh??ng t??m th???y product ????? x??? l?? x??a h???n !",
        });
      } else {
        res.status(200).json({
          success: false,
          message: "???? x??a s???n ph???m th??nh c??ng !",
        });
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  // * RESTORE PRODUCT
  restoreProduct: async (req, res, next) => {
    try {
      const deleteProduct = await ProductModel.restore({ _id: req.params.id });
      if (!deleteProduct) {
        res.status(404).json({
          success: false,
          message: "Kh??ng t??m th???y s???n ph???m ????? kh??i ph???c !",
        });
      } else {
        res.status(200).json({
          success: false,
          message: "Kh??i ph???c s???n ph???m th??nh c??ng !",
        });
      }
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  updateAllProduct: async (req, res) => {
    try {
      const product = await ProductModel.findByIdAndUpdate(
        req.params.id,
        { detail: req.body.detail },
        { new: true }
      );
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  addFavorites: async (req, res) => {
    try {
      var product = await ProductModel.findById(req.params.id);
      if (!product)
        return res
          .status(404)
          .json({ success: false, message: "Kh??ng t??m th???y product" });
      const prod = await ProductModel.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { favorites: req.user.id } },
        { new: true }
      );
      console.log(prod.favorites.length);
      prod.likeCount = prod.favorites.length;
      await prod.save();
      // product.update({ $push: { favorites: req.user.id } }, { new: true });
      // product.save();
      const user = await UserModel.findByIdAndUpdate(
        req.user.id,
        { $addToSet: { favorites: req.params.id } },
        { new: true }
      );
      res.status(200).json({
        success: true,
        message: "C???p nh???t s??? th??ch th??nh c??ng !",
        product: prod,
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  removeFavorites: async (req, res) => {
    try {
      var product = await ProductModel.findById(req.params.id);
      if (!product)
        return res
          .status(404)
          .json({ success: false, message: "Kh??ng t??m th???y product" });
      const prod = await ProductModel.findByIdAndUpdate(
        req.params.id,
        { $pull: { favorites: req.user.id } },
        { new: true }
      );
      prod.likeCount = prod.favorites.length;
      await prod.save();
      const user = await UserModel.findByIdAndUpdate(
        req.user.id,
        { $pull: { favorites: req.params.id } },
        { new: true }
      );
      res.status(200).json({
        success: true,
        message: "C???p nh???t s??? th??ch th??nh c??ng !",
        product: prod,
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
};

export default productController;
