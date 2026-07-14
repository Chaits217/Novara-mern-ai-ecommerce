import asyncHandler from "express-async-handler";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// India pricing rules: free shipping over ₹15,000, flat ₹149 otherwise,
// 18% GST applied on the item total (standard slab for lifestyle goods).
const FREE_SHIPPING_THRESHOLD = 15000;
const SHIPPING_FEE = 149;
const GST_RATE = 0.18;

// @desc    Create a new order (checkout)
// @route   POST /api/orders
export const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items provided");
  }

  // Recompute prices server-side from the DB — never trust client totals.
  let itemsPrice = 0;
  const verifiedItems = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product ${item.product} not found`);
    }
    if (product.countInStock < item.qty) {
      res.status(400);
      throw new Error(`${product.name} is out of stock`);
    }
    itemsPrice += product.price * item.qty;
    verifiedItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      qty: item.qty,
    });

    product.countInStock -= item.qty;
    await product.save();

    // Nudge the user's lightweight preference profile toward this
    // product's category — feeds the "for you" recommendation rail.
    const current = req.user.preferenceProfile.get(product.category) || 0;
    req.user.preferenceProfile.set(product.category, current + 1);
  }

  const shippingPrice = itemsPrice > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const taxPrice = Number((itemsPrice * GST_RATE).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  const order = await Order.create({
    user: req.user._id,
    orderItems: verifiedItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    isPaid: true,
    paidAt: new Date(),
  });

  await req.user.save();

  res.status(201).json(order);
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/mine
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Get order by id
// @route   GET /api/orders/:id
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }
  res.json(order);
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "name email").sort({ createdAt: -1 });
  res.json(orders);
});

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  order.status = req.body.status || order.status;
  if (order.status === "Delivered") {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }
  const updated = await order.save();
  res.json(updated);
});

// @desc    Admin dashboard stats
// @route   GET /api/orders/stats/summary
export const getOrderStats = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const revenueAgg = await Order.aggregate([
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);
  const revenue = revenueAgg[0]?.total || 0;

  const salesByCategory = await Order.aggregate([
    { $unwind: "$orderItems" },
    {
      $lookup: {
        from: "products",
        localField: "orderItems.product",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: "$productInfo" },
    {
      $group: {
        _id: "$productInfo.category",
        unitsSold: { $sum: "$orderItems.qty" },
        revenue: { $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] } },
      },
    },
  ]);

  res.json({ totalOrders, totalUsers, totalProducts, revenue, salesByCategory });
});
