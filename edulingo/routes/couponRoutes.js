const express = require("express");
const router = express.Router();
const Coupon = require("../models/Coupon");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// =============================
// CRUD ROUTES (Admin only)
// =============================

// 🟢 CREATE COUPON
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { code, discountPercent, expiryDate } = req.body;

    const existing = await Coupon.findOne({ code });
    if (existing) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = new Coupon({ code, discountPercent, expiryDate });
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🟡 GET ALL COUPONS
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔵 GET COUPON BY ID
router.get("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🟠 UPDATE COUPON
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { code, discountPercent, expiryDate, isActive } = req.body;

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { code, discountPercent, expiryDate, isActive },
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 🔴 DELETE COUPON
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
