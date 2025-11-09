// Middleware kiem tra user co phai teacher hoac admin khong
// Su dung sau authMiddleware
function teacherMiddleware(req, res, next) {
  // Kiem tra req.user da duoc gan boi authMiddleware
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Kiem tra role co phai teacher hoac admin khong
  if (req.user.role !== "teacher" && req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Teacher or Admin access required" });
  }

  next();
}

module.exports = teacherMiddleware;
