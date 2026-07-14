import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are all required");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(res, user._id, user.role);

  res.status(201).json({ user: user.toSafeObject(), token });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(res, user._id, user.role);
    res.json({ user: user.toSafeObject(), token });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("novara_jwt", "", { httpOnly: true, expires: new Date(0) });
  res.json({ message: "Logged out successfully" });
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
export const getProfile = asyncHandler(async (req, res) => {
  res.json(req.user);
});

// @desc    Update current user profile
// @route   PUT /api/auth/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.name = req.body.name ?? user.name;
  user.avatar = req.body.avatar ?? user.avatar;
  if (req.body.password) user.password = req.body.password;
  if (req.body.addresses) user.addresses = req.body.addresses;

  const updated = await user.save();
  res.json(updated.toSafeObject());
});
