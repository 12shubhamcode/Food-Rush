const Shop = require("../model/shopSchema");
const Order = require("../model/orderSchema");
const User = require("../model/userSchema");
const DeliveryAssignment = require("../model/deliveryAssignmentSchema");
const { sendDeliveryOtpMail } = require("../utils/mail");
const Razorpay = require("razorpay");
const env = require("dotenv");
env.config();

let instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

async function placeOrder(req, res) {
  try {
    const { cartItems, paymentMethod, deliveryAddress } = req.body;

    if (cartItems.length === 0 || !cartItems) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    if (
      !deliveryAddress?.text ||
      !deliveryAddress?.latitude ||
      !deliveryAddress?.longitude
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Send complete delivery address" });
    }

    const groupItemByShop = {};

    cartItems.forEach((item) => {
      const shopId = item?.shop;
      if (!groupItemByShop[shopId]) {
        groupItemByShop[shopId] = [];
      }
      groupItemByShop[shopId].push(item);
    });

    //Create shopOrders first
    const shopOrders = await Promise.all(
      Object.keys(groupItemByShop).map(async (shopId) => {
        const shop = await Shop.findById(shopId).populate("owner");
        if (!shop) {
          return res
            .status(400)
            .json({ success: false, message: "Shop not found" });
        }

        const items = groupItemByShop[shopId];

        const subtotal = items.reduce(
          (sum, i) => sum + Number(i?.price) * Number(i?.quantity),
          0,
        );

        return {
          shop: shop._id,
          owner: shop.owner._id,
          subtotal,
          shopOrderItems: items.map((i) => ({
            item: i.id,
            price: i.price,
            quantity: i.quantity,
            name: i.name,
          })),
        };
      }),
    );

    //NOW calculate grand total (correct place)
    const grandTotal = shopOrders.reduce((sum, shop) => sum + shop.subtotal, 0);
    let deliveryFee = 0;
    if (grandTotal < 500) {
      deliveryFee = 40;
    }
    const finalTotal = grandTotal + deliveryFee;

    if (paymentMethod === "online") {
      const razorOrder = await instance.orders.create({
        amount: Math.round(finalTotal * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });
      const newOrder = await Order.create({
        user: req.userId,
        paymentMethod,
        deliveryAddress,
        deliveryFee,
        totalAmount: finalTotal,
        shopOrders,
        razorpayOrderId: razorOrder.id,
        payment: false,
      });

      return res.status(200).json({
        razorOrder,
        orderId: newOrder._id,
      });
    }

    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      deliveryFee,
      totalAmount: finalTotal,
      shopOrders,
    });

    await newOrder.populate(
      "shopOrders.shopOrderItems.item",
      "name image price",
    );
    await newOrder.populate("shopOrders.shop", "name socketId ");
    await newOrder.populate(
      "shopOrders.owner",
      "fullName email mobile socketId",
    );
    await newOrder.populate("user", "fullName email mobile ");

    const io = req.app.get("io");

    for (const shopOrder of newOrder.shopOrders) {
      const owner = await User.findById(shopOrder.owner);

      if (!owner?.socketId) continue;

      // IMPORTANT: re-fetch FULL populated order
      const populatedOrder = await Order.findById(newOrder._id)
        .populate("user", "fullName email mobile")
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "fullName email mobile")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .lean();

      const myShopOrder = populatedOrder.shopOrders.find(
        (o) => o.owner._id.toString() === owner._id.toString(),
      );

      io.to(owner.socketId).emit("newOrder", {
        _id: populatedOrder._id,
        paymentMethod: populatedOrder.paymentMethod,
        user: populatedOrder.user,
        deliveryAddress: populatedOrder.deliveryAddress,
        shopOrders: [myShopOrder],
        createdAt: populatedOrder.createdAt,
        payment: populatedOrder.payment,
      });
    }

    return res.status(201).json(newOrder);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Server error ${error}` });
  }
}

async function verifyPayment(req, res) {
  try {
    const { razorpay_payment_id, orderId } = req.body;
    const payment = await instance.payments.fetch(razorpay_payment_id);
    if (!payment || payment.status != "captured") {
      return res
        .status(400)
        .json({ success: false, message: "Payment not captured" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(400)
        .json({ success: false, message: "Order not found" });
    }

    order.payment = true;
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    await order.populate("shopOrders.shopOrderItems.item", "name image price");
    await order.populate("shopOrders.shop", "name socketId ");
    await order.populate("shopOrders.owner", "fullName email mobile socketId");
    await order.populate("user", "fullName email mobile ");

    const io = req.app.get("io");

    setTimeout(async () => {
      for (const shopOrder of order.shopOrders) {
        const owner = await User.findById(shopOrder.owner);

        if (!owner?.socketId) continue;

        const populatedOrder = await Order.findById(order._id)
          .populate("user", "fullName email mobile")
          .populate("shopOrders.shop", "name")
          .populate("shopOrders.owner", "fullName email mobile")
          .populate("shopOrders.shopOrderItems.item", "name image price")
          .lean();

        const myShopOrder = populatedOrder.shopOrders.find(
          (o) => o.owner._id.toString() === owner._id.toString(),
        );

        io.to(owner.socketId).emit("newOrder", {
          _id: populatedOrder._id,
          paymentMethod: populatedOrder.paymentMethod,
          user: populatedOrder.user,
          deliveryAddress: populatedOrder.deliveryAddress,
          shopOrders: [myShopOrder],
          createdAt: populatedOrder.createdAt,
          payment: true, // IMPORTANT
        });
      }
    }, 1500); // give frontend time to reconnect

    return res.status(200).json(order);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Server error ${error}` });
  }
}

async function getMyOrders(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (user.role === "user") {
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "name email mobile")
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .lean();

      return res.status(200).json(orders);
    } else if (user.role === "owner") {
      const orders = await Order.find({ "shopOrders.owner": req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("user") // customer info for owner dashboard
        .populate("shopOrders.shopOrderItems.item", "name image price")
        .populate("shopOrders.assignedDeliveryBoy", "fullName mobile  ")
        .lean(); // IMPORTANT: keep populated data intact

      // Send only the shopOrder belonging to this owner
      const filteredOrders = orders.map((order) => {
        const myShopOrder = order.shopOrders.find(
          (o) => o.owner.toString() === req.userId.toString(),
        );

        return {
          _id: order._id,
          paymentMethod: order.paymentMethod,
          user: order.user,
          deliveryAddress: order.deliveryAddress,
          shopOrders: [myShopOrder],
          createdAt: order.createdAt,
          payment: order.payment,
        };
      });

      return res.status(200).json(filteredOrders);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Server error ${error}` });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { orderId, shopId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);

    const shopOrder = order.shopOrders.find(
      (o) => o.shop.toString() === shopId.toString(),
    );

    if (!shopOrder) {
      return res
        .status(400)
        .json({ success: false, message: "Shop order not found" });
    }

    shopOrder.status = status;
    let deliveryBoysPayload = [];
    if (status === "out of delivery" && !shopOrder.assignment) {
      const { longitude, latitude } = order.deliveryAddress;

      const nearByDeliveryboy = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: 5000,
          },
        },
      });

      const nearByIds = nearByDeliveryboy.map((b) => b._id);
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["broadcasted", "completed"] },
      }).distinct("assignedTo");

      const busyIdSet = new Set(busyIds.map((id) => String(id)));

      const availableBoys = nearByDeliveryboy.filter(
        (b) => !busyIdSet.has(String(b._id)),
      );

      const candidates = availableBoys.map((b) => b._id);
      if (!candidates) {
        await order.save();
        return res.json({
          success: true,
          message:
            "Order status updated but their is no delivery boys available",
        });
      }

      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        broadcastedTo: candidates,
        status: "broadcasted",
      });

      shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo;

      shopOrder.assignment = deliveryAssignment._id;

      deliveryBoysPayload = availableBoys.map((b) => ({
        id: b._id,
        fullName: b.fullName,
        longitude: b.location.coordinates?.[0],
        latitude: b.location.coordinates?.[1],
        mobile: b.mobile,
      }));

      await deliveryAssignment.populate("order");
      await deliveryAssignment.populate("shop");

      const assignedShopOrder = deliveryAssignment.order.shopOrders.find((so) =>
        so._id.equals(deliveryAssignment.shopOrderId),
      );

      if (!assignedShopOrder) return null;

      const io = req.app.get("io");
      if (io) {
        availableBoys.forEach((boy) => {
          const boySocketId = boy.socketId;
          if (boySocketId) {
            io.to(boySocketId).emit("newAssignment", {
              sendTo: boy._id,
              assignmentId: deliveryAssignment._id,
              orderId: deliveryAssignment.order._id,
              shopName: deliveryAssignment.shop?.name,
              deliveryAddress: deliveryAssignment.order.deliveryAddress,
              items: assignedShopOrder.shopOrderItems || [],
              subtotal: assignedShopOrder.subtotal || 0,
            });
          }
        });
      }
    }

    await order.save(); // save parent document
    const updatedShopOrder = order.shopOrders.find(
      (o) => o.shop.toString() === shopId.toString(),
    );

    await order.populate("shopOrders.shopOrderItems.item", "name image price");
    await order.populate(
      "shopOrders.assignedDeliveryBoy",
      "fullName email mobile",
    );
    await order.populate("shopOrders.shop", "name");
    await order.populate("user", "socketId");

    const io = req.app.get("io");
    if (io) {
      const userSocketId = order.user.socketId;
      if (userSocketId) {
        io.to(userSocketId).emit("update-status", {
          orderId: order._id,
          shopId: updatedShopOrder.shop._id,
          status: updatedShopOrder.status,
          userId: order.user._id,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order status updated",
      shopOrder: updatedShopOrder,
      assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
      availableBoys: deliveryBoysPayload,
      assignment: updatedShopOrder?.assignment._id || null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Server error ${error}` });
  }
}

async function getDeliveryBoyAssignment(req, res) {
  try {
    const deliveryBoyId = req.userId;

    const assignments = await DeliveryAssignment.find({
      broadcastedTo: deliveryBoyId,
      status: "broadcasted",
    })
      .populate("order")
      .populate("shop", "name");

    const formatted = assignments
      .map((a) => {
        if (!a.order) return null;

        if (!a.order.shopOrders) return null;

        const shopOrder = a.order.shopOrders.find((so) =>
          so._id.equals(a.shopOrderId),
        );

        if (!shopOrder) return null;

        return {
          assignmentId: a._id,
          orderId: a.order._id,
          shopName: a.shop?.name,
          deliveryAddress: a.order.deliveryAddress,
          items: shopOrder.shopOrderItems || [],
          subtotal: shopOrder.subtotal || 0,
        };
      })
      .filter(Boolean); //  removes null entries

    return res.status(200).json(formatted);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Server error ${error}` });
  }
}

async function acceptOrder(req, res) {
  try {
    const { assignmentId } = req.params;
    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      return res
        .status(400)
        .json({ success: false, message: "Assignment not found" });
    }
    if (assignment.status !== "broadcasted") {
      return res
        .status(400)
        .json({ success: false, message: "Assignment is expired" });
    }
    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $nin: ["broadcasted", "completed"] },
    });
    if (alreadyAssigned) {
      return res.status(400).json({
        success: false,
        message: "You are already assigned to another order",
      });
    }

    assignment.assignedTo = req.userId;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();

    const order = await Order.findById(assignment.order);
    if (!order) {
      return res
        .status(400)
        .json({ success: false, message: " Order not found" });
    }

    const shopOrder = order.shopOrders.id(assignment.shopOrderId);
    shopOrder.assignedDeliveryBoy = req.userId;
    await order.save();

    return res.status(200).json({ success: true, message: "Order accepted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Server error ${error}` });
  }
}

async function getCurrentOrders(req, res) {
  try {
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: "assigned",
    })
      .populate("shop", "name")
      .populate("assignedTo", "fullName email mobile location")
      .populate({
        path: "order",
        populate: [{ path: "user", select: "fullName email location mobile" }],
      });

    // No active order → return empty instead of 400
    if (!assignment) {
      return res.status(200).json(null);
    }

    // find correct shopOrder inside ORDER (not shop)
    const shopOrder = assignment.order.shopOrders.find((so) =>
      so._id.equals(assignment.shopOrderId),
    );

    if (!shopOrder) {
      return res.status(400).json({ message: "Shop order not found" });
    }

    // Delivery boy location
    let deliveryBoyLocation = { lat: null, lon: null };
    if (assignment.assignedTo.location?.coordinates?.length === 2) {
      deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1];
      deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0];
    }

    // Customer location
    let customerLocation = { lat: null, lon: null };
    if (assignment.order.deliveryAddress) {
      customerLocation.lat = assignment.order.deliveryAddress.latitude;
      customerLocation.lon = assignment.order.deliveryAddress.longitude;
    }

    return res.status(200).json({
      orderId: assignment.order._id,
      shopName: assignment.shop.name,
      customer: assignment.order.user,
      shopOrder,
      deliveryAddress: assignment.order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Server error ${error}` });
  }
}

const mongoose = require("mongoose");

async function getOrderById(req, res) {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findById(orderId)
      .populate("user", "fullName email mobile")
      .populate("shopOrders.shop", "name")
      .populate("shopOrders.assignedDeliveryBoy", "fullName mobile location")
      .populate("shopOrders.shopOrderItems.item", "name image price")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Server error ${error}` });
  }
}

async function sendDeliveryOtp(req, res) {
  try {
    const { orderId, shopOrderId } = req.body;
    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    const shopOrder = order.shopOrders.id(shopOrderId);

    if (!shopOrder) {
      return res.status(404).json({
        success: false,
        message: "ShopOrder not found",
      });
    }

    if (!order || !shopOrder) {
      return res
        .status(404)
        .json({ message: "Enter valid order/shopOrder Id" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    shopOrder.deliveryOtp = otp;
    shopOrder.otpExpires = Date.now() + 5 * 60 * 1000;

    await order.save();

    await sendDeliveryOtpMail(order.user, otp);

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${order?.user?.fullName}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Server error ${error}` });
  }
}

async function verifyDeliveryOtp(req, res) {
  try {
    const { orderId, shopOrderId, otp } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);

    if (!order || !shopOrder) {
      return res
        .status(400)
        .json({ success: false, message: "Enter valid order/shopOrder Id" });
    }

    if (
      shopOrder.deliveryOtp !== otp ||
      !shopOrder.otpExpires ||
      shopOrder.otpExpires < Date.now()
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid/Expire OTP" });
    }

    shopOrder.status = "delivered";
    shopOrder.deliveredAt = Date.now();

    await order.save();
    await DeliveryAssignment.deleteOne({
      shopOrderId: shopOrder._id,
      order: order._id,
      assignedTo: shopOrder.assignedDeliveryBoy,
    });

    return res
      .status(200)
      .json({ success: true, message: "Order delivered successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Server error ${error}` });
  }
}

async function getTodayDeliveries(req, res) {
  try {
    const deliveryBoyId = req.userId;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      "shopOrders.assignedDeliveryBoy": deliveryBoyId,
      "shopOrders.status": "delivered",
      "shopOrders.deliveredAt": { $gte: startOfDay }
    }).lean();

    let todaysDeliveries = [];

    orders.forEach((order) => {
      order.shopOrders.forEach((shopOrder) => {
        if (
          String(shopOrder.assignedDeliveryBoy) === String(deliveryBoyId) &&
          shopOrder.status === "delivered" &&
          shopOrder.deliveredAt &&
          shopOrder.deliveredAt >= startOfDay
        ) {
          todaysDeliveries.push(shopOrder);
        }
      });
    });

    let stats = {};

    todaysDeliveries.forEach((shopOrder) => {
      const hour = new Date(shopOrder.deliveredAt).getHours();
      stats[hour] = (stats[hour] || 0) + 1;
    });

    let formattedStats = Object.keys(stats).map((hour) => ({
      hour: parseInt(hour),
      count: stats[hour],
    }));

    formattedStats.sort((a, b) => a.hour - b.hour);

    return res.status(200).json(formattedStats);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Server error ${error}` });
  }
}

module.exports = {
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
  getTodayDeliveries
};
