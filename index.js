import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(
    import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const URI = process.env.DATABASE_URI;

app.use("/public", express.static(path.join(__dirname, "uploads")));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "30mb" }));
app.use(cors());
app.use(morgan("common"));

// * ROUTES IMPORT
import product from "./routers/product.js";
import category from "./routers/category.js";
import catalog from "./routers/catalog.js";
import blog from "./routers/blog.js";
import auth from "./routers/auth.js";
import user from "./routers/user.js";
import cart from "./routers/cart.js";
import order from "./routers/order.js";
import review from "./routers/review.js";

// v2
import productRoute from "./routers/productRoute.js";
import categoryRoute from "./routers/categoryRoute.js";
import catalogRoute from "./routers/catalogRoute.js";
import userRoute from "./routers/userRoute.js";
import blogRoute from "./routers/blogRoute.js";
import cartRoute from "./routers/cartRoute.js";
import orderRoute from "./routers/orderRoute.js";
import reviewRoute from "./routers/reviewRoute.js";

app.use("/api/v1", product);
app.use("/api/v1", category);
app.use("/api/v1", catalog);
app.use("/api/v1", auth);
app.use("/api/v1", user);
app.use("/api/v1", blog);
app.use("/api/v1", cart);
app.use("/api/v1", order);
app.use("/api/v1", review);

app.use("/api/v2", productRoute);
app.use("/api/v2", categoryRoute);
app.use("/api/v2", catalogRoute);
app.use("/api/v2", auth); // OK
app.use("/api/v2", userRoute);
app.use("/api/v2", blogRoute);
app.use("/api/v2", cartRoute);
app.use("/api/v2", orderRoute);
app.use("/api/v2", reviewRoute);
mongoose
    .connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Kết nối với database thành công!");
        app.listen(PORT, () => {
            console.log(`Server is running ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("Lỗi kết nối DB", err);
    });