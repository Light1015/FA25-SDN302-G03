const express = require("express");
const mongoose = require("mongoose");
const Course = require("../models/Course");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const teacherMiddleware = require("../middleware/teacherMiddleware");

const router = express.Router();

// ========== COURSE CATALOG - PUBLIC / AUTHENTICATED ==========

// GET /api/courses/catalog - Xem danh sach tat ca khoa hoc (published) - Public/Authenticated
router.get("/catalog", async (req, res) => {
  try {
    const { category, level, search, sort } = req.query;

    // Filter chi lay khoa hoc published
    const filter = { status: "published" };

    if (category) {
      filter.category = category;
    }

    if (level) {
      filter.level = level;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Sort options
    let sortOptions = {};
    if (sort === "price_asc") {
      sortOptions = { price: 1 };
    } else if (sort === "price_desc") {
      sortOptions = { price: -1 };
    } else if (sort === "rating") {
      sortOptions = { rating: -1 };
    } else if (sort === "popular") {
      sortOptions = { enrolled_count: -1 };
    } else {
      sortOptions = { createdAt: -1 }; // Moi nhat
    }

    const courses = await Course.find(filter)
      .sort(sortOptions)
      .select("-__v")
      .populate("teacher_id", "full_name email");

    res.json({
      message: "Success",
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch course catalog",
      error: error.message,
    });
  }
});

// GET /api/courses/catalog/:id - Xem chi tiet 1 khoa hoc (published) - Public/Authenticated
router.get("/catalog/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid course ID format",
      });
    }

    const course = await Course.findOne({
      _id: id,
      status: "published",
    })
      .select("-__v")
      .populate("teacher_id", "full_name email gender");

    if (!course) {
      return res.status(404).json({
        message: "Course not found or not published",
      });
    }

    res.json({
      message: "Success",
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch course",
      error: error.message,
    });
  }
});

// ========== COURSE CRUD - TEACHER / ADMIN ==========

// GET /api/courses - Lay danh sach khoa hoc cua teacher (Teacher/Admin)
router.get("/", authMiddleware, teacherMiddleware, async (req, res) => {
  try {
    let filter = {};

    // Neu la teacher, chi lay khoa hoc cua chinh minh
    if (req.user.role === "teacher") {
      filter.teacher_id = req.user._id;
    }
    // Neu la admin, lay tat ca khoa hoc

    const courses = await Course.find(filter)
      .sort({ createdAt: -1 })
      .select("-__v")
      .populate("teacher_id", "full_name email");

    res.json({
      message: "Success",
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch courses",
      error: error.message,
    });
  }
});

// POST /api/courses/create - Tao khoa hoc moi (Teacher/Admin)
router.post("/create", authMiddleware, teacherMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      level,
      duration,
      price,
      thumbnail,
      status,
    } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    // Tao course moi
    const courseData = {
      title,
      description: description || "",
      teacher_id: req.user._id,
      teacher_name: req.user.full_name || req.user.name,
      category: category || "",
      level: level || "beginner",
      duration: duration || 0,
      price: price || 0,
      thumbnail: thumbnail || "",
      status: status || "draft",
    };

    const course = new Course(courseData);
    await course.save();

    // Populate teacher info
    await course.populate("teacher_id", "full_name email");

    res.status(201).json({
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create course",
      error: error.message,
    });
  }
});

// GET /api/courses/:id - Xem chi tiet khoa hoc (Teacher/Admin)
router.get("/:id", authMiddleware, teacherMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid course ID format",
      });
    }

    const course = await Course.findById(id)
      .select("-__v")
      .populate("teacher_id", "full_name email gender");

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Neu la teacher, chi duoc xem khoa hoc cua chinh minh
    if (
      req.user.role === "teacher" &&
      course.teacher_id._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Forbidden: You can only view your own courses",
      });
    }

    res.json({
      message: "Success",
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch course",
      error: error.message,
    });
  }
});

// PUT /api/courses/:id/update - Cap nhat khoa hoc (Teacher/Admin)
router.put(
  "/:id/update",
  authMiddleware,
  teacherMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        category,
        level,
        duration,
        price,
        thumbnail,
        status,
      } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid course ID format",
        });
      }

      const course = await Course.findById(id);

      if (!course) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      // Neu la teacher, chi duoc cap nhat khoa hoc cua chinh minh
      if (
        req.user.role === "teacher" &&
        course.teacher_id.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          message: "Forbidden: You can only update your own courses",
        });
      }

      // Cap nhat cac truong
      if (title !== undefined) course.title = title;
      if (description !== undefined) course.description = description;
      if (category !== undefined) course.category = category;
      if (level !== undefined) course.level = level;
      if (duration !== undefined) course.duration = duration;
      if (price !== undefined) course.price = price;
      if (thumbnail !== undefined) course.thumbnail = thumbnail;
      if (status !== undefined) course.status = status;

      await course.save();

      // Populate teacher info
      await course.populate("teacher_id", "full_name email");

      res.json({
        message: "Course updated successfully",
        data: course,
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to update course",
        error: error.message,
      });
    }
  }
);

// DELETE /api/courses/:id/delete - Xoa khoa hoc (Teacher/Admin)
router.delete(
  "/:id/delete",
  authMiddleware,
  teacherMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid course ID format",
        });
      }

      const course = await Course.findById(id);

      if (!course) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      // Neu la teacher, chi duoc xoa khoa hoc cua chinh minh
      if (
        req.user.role === "teacher" &&
        course.teacher_id.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          message: "Forbidden: You can only delete your own courses",
        });
      }

      await Course.findByIdAndDelete(id);

      res.json({
        message: "Course deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to delete course",
        error: error.message,
      });
    }
  }
);

module.exports = router;
