// Middleware kiem tra user co phai admin khong
// Su dung sau authMiddleware
function adminMiddleware(req, res, next) {
  // Kiem tra req.user da duoc gan boi authMiddleware
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Kiem tra role co phai admin khong
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }

  next();
}

module.exports = adminMiddleware;

