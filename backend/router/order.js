const express = require("express");
const isAuth = require("../middleware/isAuth");
const {
  placeOrder,
  getMyOrders,
  updateOrderStatus,
  getDeliveryBoyAssignment,
  acceptOrder,
  getCurrentOrders,
  getOrderById,
  sendDeliveryOtp,
  verifyDeliveryOtp,
  verifyPayment,
  getTodayDeliveries,
} = require("../controller/orderController");

const router = express.Router();

router.post("/place-order", isAuth, placeOrder);
router.post("/verify-payment", isAuth, verifyPayment);
router.get("/my-orders", isAuth, getMyOrders);
router.get("/get-assignments", isAuth, getDeliveryBoyAssignment);
router.get("/get-current-order", isAuth, getCurrentOrders);
router.post("/send-delivery-otp", isAuth, sendDeliveryOtp);
router.post("/verify-delivery-otp", isAuth, verifyDeliveryOtp);
router.get("/accept-order/:assignmentId", isAuth, acceptOrder);
router.get("/get-order-by-id/:orderId", isAuth, getOrderById);
router.get("/get-today-delivery", isAuth, getTodayDeliveries);
router.post("/update-status/:orderId/:shopId", isAuth, updateOrderStatus);

module.exports = router;
