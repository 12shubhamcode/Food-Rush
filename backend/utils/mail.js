const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASS,
  },
});

const sentOtpMail = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject: "Reset your password",
    html: `<p>Your OTP for password reset is <b>${otp} </b></p>. It expires in 5 minutes.`, // HTML body
  });
};
const sendDeliveryOtpMail = async (user, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to:user.email,
    subject: "Delivery OTP",
    html: `<p>Your OTP for delivery  is <b>${otp} </b></p>. It expires in 5 minutes.`, // HTML body
  });
};

module.exports={sentOtpMail,sendDeliveryOtpMail};