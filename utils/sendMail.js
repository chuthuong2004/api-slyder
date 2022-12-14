import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
// let transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL, // generated ethereal user
//         pass: process.env.PASSWORD, // generated ethereal password
//     },
//     tls: { rejectUnauthorized: false }
// });
// var info = {
//     from: '', //Email người gửi
//     to: `${user.email}`, // Email người nhận
//     subject: 'LẤY LẠI MẬT KHẨU',
//     //text: 'Nội dung thư, không có code html'
//     html: `Cửa hàng Slyder.vn xin gửi lại mật khẩu của bạn. <br>
// Mật khẩu mới: <b style="padding: 5px 7px; background: #eee; color: red"> ${newPassword} </b>`, // Nội dung thư, có thể có code html
// };
// transporter.sendMail(info, (err) => {
//     if (err) {
//         res.status(500).json({ err: err })
//     } else {
//         res.status(200).json({ success: true, message: `Mật khẩu mới đã gửi về ${user.email} thành công` });
//     }
// })


export const sendEmail = async(options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
        tls: { rejectUnauthorized: false }
    });

    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    await transporter.sendMail(mailOptions);
};