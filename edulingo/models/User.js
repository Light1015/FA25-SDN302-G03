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

// Tu dong hash password khi password thay doi
userSchema.pre('save', async function (next) {
  // Neu password duoc thay doi va chua duoc hash
  if (this.isModified('password') && this.password) {
    try {
      // Hash password neu chua duoc hash (neu khong bat dau bang $2a$, $2b$, hoac $2y$ thi chua hash)
      if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$') && !this.password.startsWith('$2y$')) {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
      }
    } catch (error) {
      return next(error);
    }
  }

  next();
});

// Ham tien ich so sanh mat khau plaintext va hash
userSchema.methods.isPasswordMatch = function comparePassword(plainPassword) {
  // So sanh voi password (da hash)
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);



