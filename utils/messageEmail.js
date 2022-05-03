import moment from "moment";
const msg = (order, title, titleMessage, email) => {
    if (!email) {
        email = order.user.email;
    }
    var html = "";
    order.orderItems.forEach((orderItem) => {
        html += `
                            <tr>
                                <td>
                                    <img style="width:50px; height:80px; object-fit: cover;" src="${
                                      orderItem.image
                                    }" alt="">
                                </td>
                                <td style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;">${
                                  orderItem.name
                                } - ${orderItem.color} - ${orderItem.size}</td>
                                <td style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;">${
                                  orderItem.quantity
                                }</td>
                                <td style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;">${(
                                  orderItem.price -
                                  orderItem.price * (orderItem.discount / 100)
                                )
                                  .toString()
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}đ</td>
                            </tr>
                            `;
    });
    var createdAt = moment(order.createdAt).format("DD/MM/YYYY HH:mm:ss");
    var totalPrice = order.totalPrice
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var shippingPrice = order.shippingPrice
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var total = (order.totalPrice + order.shippingPrice)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var message = `<div style="background: #00796b; display: flex;flex-direction: row;">
            <div style="margin: 50px auto 0px auto;background: #fff;max-width: 500px;">
            <h2 style="display: flex; align-items: center; justify-content: center;text-align: center;background: #00bfa5;margin: 0;padding: 10px 20px;min-height: 70px;font-weight: 600;">
            ${title}
            </h2>
            <div style="padding: 20px 20px 0 20px;">
            <p>Xin chào <b>${order.shippingInfo.fullName}</b>,</p>
            <p>Đơn hàng <b>#${order._id}</b> ${titleMessage}</p>
            <h4>[Đơn hàng #${order._id}] (${createdAt})</h4>
            <table style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;">
                <tr>
                    <th style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px; " width="20%" >Hình ảnh</th>
                    <th style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px; " width="50%" >Sản phẩm</th>
                    <th style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px; " width="10%" >Số lượng</th>
                    <th style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px; " width="20%" >Giá</th>
                </tr>
                ${html}
                <tr>
                    <td style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;" colspan="3" style="text-align:left">Tổng số phụ:
                    </td>
                    <td style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;"><b>${totalPrice}đ</b></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;" colspan="3" style="text-align:left">Phí vận chuyển:
                    </td>
                    <td style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;"><b>${shippingPrice}đ</b></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;" colspan="3" style="text-align:left">Phương thức thanh toán:
                    </td>
                    <td style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;"><b>Thanh toán khi nhận hàng (COD)</b></td>
                </tr>
                <tr>
                    <td style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;" colspan="3" style="text-align:left">Tổng thanh toán:
                    </td>
                    <td style="border: 1px solid #bdbdbd;border-collapse: collapse;padding: 4px 8px;"><b>${total}đ</b></td>
                </tr>
            </table>
            <h4>Địa chỉ nhận hàng</h4>
            <div style="border: 1px solid #bdbdbd; padding:10px 20px;">
            <p>${order.shippingInfo.fullName} <br>${
    order.shippingInfo.address.split(",")[0]
  }<br>${order.shippingInfo.address.split(",")[1]}<br>${
    order.shippingInfo.address.split(",")[2]
  }<br>${order.shippingInfo.address.split(",")[3]}<br>${
    order.shippingInfo.phone
  }<br>${email}                </p>
            </div>
            <p>Thanks for using LTH Store !</p>
        </div>
        <p style="margin:0; padding:20px; color:#9e9e9e; text-align:center; background: #00796b;">LTH Store – chúng tôi chân thành cảm ơn bạn đã tin tưởng và ủng hộ chúng tôi</p>
        </div>
        </div>`;
    return message;
};
export default msg;