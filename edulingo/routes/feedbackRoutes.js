const express = require("express");
const mongoose = require("mongoose");
const Feedback = require("../models/Feedback");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create Feedback
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { content, rating } = req.body;

    // Validate input
    if (!content || !rating) {
      return res.status(400).json({
        message: "Content and rating are required",
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    const feedback = new Feedback({
      userId: req.user._id,
      content,
      rating,
    });

    await feedback.save();

    res.status(201).json({
      message: "Feedback created successfully",
      data: feedback,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create feedback",
      error: error.message,
    });
  }
});

// Read Feedback (get own feedbacks)
router.get("/my-feedbacks", authMiddleware, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({
      message: "Success",
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch feedbacks",
      error: error.message,
    });
  }
});

// Update Feedback
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, rating } = req.body;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid feedback ID format",
      });
    }

    // Check if feedback exists and belongs to user
    const feedback = await Feedback.findOne({
      _id: id,
      userId: req.user._id,
      status: "active",
    });

    if (!feedback) {
      return res.status(404).json({
        message:
          "Feedback not found or you do not have permission to update it",
      });
    }

    // Update fields
    if (content) feedback.content = content;
    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          message: "Rating must be between 1 and 5",
        });
      }
      feedback.rating = rating;
    }

    await feedback.save();

    res.json({
      message: "Feedback updated successfully",
      data: feedback,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update feedback",
      error: error.message,
    });
  }
});

// Delete Feedback (soft delete by setting status to 'hidden')
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid feedback ID format",
      });
    }

    // Check if feedback exists and belongs to user
    const feedback = await Feedback.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!feedback) {
      return res.status(404).json({
        message:
          "Feedback not found or you do not have permission to delete it",
      });
    }

    // Soft delete by setting status to 'hidden'
    feedback.status = "hidden";
    await feedback.save();

    res.json({
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete feedback",
      error: error.message,
    });
  }
});

module.exports = router;
