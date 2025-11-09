const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Mo ta cau truc tai khoan nguoi dung
const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    password_hash: {
      type: String,
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'learner'],
      default: 'learner',
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Tu dong hash password va cap nhat password_hash khi password thay doi
userSchema.pre('save', async function (next) {
  // Neu password duoc thay doi va chua duoc hash
  if (this.isModified('password') && this.password) {
    try {
      // Hash password neu chua duoc hash (neu khong bat dau bang $2a$, $2b$, hoac $2y$ thi chua hash)
      if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$') && !this.password.startsWith('$2y$')) {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
      }
      // Dat password_hash bang password (da hash)
      this.password_hash = this.password;
    } catch (error) {
      return next(error);
    }
  } else if (!this.password_hash && this.password) {
    // Neu chua co password_hash nhung co password, su dung password
    this.password_hash = this.password;
  }
  
  next();
});

// Ham tien ich so sanh mat khau plaintext va hash
userSchema.methods.isPasswordMatch = function comparePassword(plainPassword) {
  // So sanh voi password hoac password_hash
  const passwordToCompare = this.password_hash || this.password;
  return bcrypt.compare(plainPassword, passwordToCompare);
};

module.exports = mongoose.model('User', userSchema);
