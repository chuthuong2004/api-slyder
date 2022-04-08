import { OrderModel } from "../models/OrderModel.js";

const orderController = {

    // ! CREATE ORDER WITH USER CART
    newOrder: async(req, res) => {

    },

    // * GET SINGLE ORDER
    getSingleOrder: async(req, res) => {
        const order = await OrderModel.findById(req.params.id).populate(
            "user",
            "username email"
        );
        if (!order) return res.status(404).json({ error: 'Order not found with this ID' })
        res.status(200).json({
            success: true,
            order,
        });
    },

    // * GET MY ORDER
    myOrders: async(req, res) => {
        const orders = await OrderModel.findById(req.user.id);
        res.status(200).json({
            success: true,
            orders,
        });
    },

    // * GET ALL ORDERS
    getAllOrders: async(req, res) => {
        const orders = await OrderModel.find();
        let totalAmount = 0;
        orders.forEach((order) => totalAmount += order.totalPrice);
        res.status(200).json({
            success: true,
            totalAmount,
            orders,
        });
    },

    // ! UPDATE ORDER - UPDATE AMOUNT PRODUCT
    updateOrder: async(req, res) => {
        const order = await OrderModel.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn đặt hàng với ID trên' })
        if (order.orderStatus === 'Delivered') return res.status(400).json({ error: 'Bạn đã giao đơn đặt hàng này' })
        if (req.body.status === 'Shipped') {
            order.orderItems.forEach(async(order) => {
                await updateAmount(order.product, order.size, order.color, order.quantity);
            })
        }
        order.orderStatus = req.body.status;
        if (req.body.status === 'Delivered') {
            order.deliveredAt = Date.now();
        }
        await order.save({ validateBeforeSave: false });
        res.status(200).json({
            success: true,
        });
    },

    // * DELETE ORDER 
    deleteOrder: async(req, res) => {
        const order = await OrderModel.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn đặt hàng với ID được chỉ định' })
        await UserModel.updateMany({
            orders: req.params.id
        }, {
            $pull: { orders: req.params.id }
        })
        await order.remove();

        res.status(200).json({
            success: true,
            message: 'Delete order successfully'
        });
    }
}

// ! UPDATE AMOUNT PRODUCT WITH SIZE COLOR
async function updateAmount(idProduct, size, color, quantity) {
    const product = await ProductModel.findById(idProduct);
    const detail = product.detail.find(prod => prod.size === size);
    let updateAmount = 0;
    if (!detail) return res.status(404).json({ error: `Không tìm thấy size ${size} trong sản phẩm` });

    const detailColor = detail.detailColor.find(item => item.color === color);
    if (!detailColor) return res.status(404).json({ error: `Không tìm thấy màu [${color}] trong size [${size}]` })
    updateAmount = detailColor.amount - quantity;
    let condition = {
        '_id': idProduct,
        'detail.$.size': detail.size,
    }
    let update = {
        '$set': {
            'detail.$.size': detail.size,
            'detail.$.detailColor.$.color': detailColor.color,
            'detail.$.detailColor.$.amount': updateAmount
        }
    }
    await ProductModel.findOneAndUpdate(condition, update, { new: true });

}

export default orderController;