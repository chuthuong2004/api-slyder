import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import product from './routers/product.js';
import category from './routers/category.js';
import catalog from './routers/catalog.js';
import blog from './routers/blog.js';
import auth from './routers/auth.js';
import user from './routers/user.js';
import cart from './routers/cart.js';
import order from './routers/order.js';
import review from './routers/review.js';
import mongoose from 'mongoose';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(
    import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const URI = process.env.DATABASE_URI;

app.use(express.static(path.join(__dirname, 'uploads')))
app.use(cookieParser())
app.use(bodyParser.json({ limit: '30mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '30mb' }));
app.use(cors());
app.use(morgan("common"));
app.use('/api/product', product);
app.use('/api/category', category);
app.use('/api/catalog', catalog);
app.use('/api/auth', auth);
app.use('/api/user', user);
app.use('/api/blog', blog);
app.use('/api/cart', cart);
app.use('/api/order', order);
app.use('/api/review', review);

mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Kết nối với database thành công!');
        app.listen(PORT, () => {
            console.log(`Server is running ${PORT}`);
        });
    })
    .catch(err => {
        console.log('Lỗi kết nối DB', err);
    })