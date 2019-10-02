const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String,
    unique: [true, "this email is already exists"],
    required: [true, "the email is required"],
    validate: [validator.isEmail, "wrong email"],
    lowercase: true
  },
  photo: { type: String },
  password: {
    type: String,
    required: [true, "please provide your password"],
    minLength: 8,
    select: false
  },
  confirmPassword: {
    type: String,
    required: [true, "please confirm the password"],
    validate: {
      validator: function(value) {
        return this.password === value;
      },
      message: "the confirm password doesn't match the password"
    }
  },
  passwordChangedAt: { type: Date, select: false },
  role: {
    type: String,
    enum: ["user", "admin", "guide", "lead-guide"],
    default: "user"
  },
  passwordResetToken: String,
  passwordResetExpiresAt: Date,
  active: {
    type: Boolean,
    default: true
    // select: false
  }
});
userSchema.methods.checkPassword = async function(loginPassword, userPassword) {
  return await bcrypt.compare(loginPassword, userPassword);
};
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpiresAt = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
userSchema.methods.getToken = function getToken(payloadObj) {
  return jwt.sign(payloadObj, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});
userSchema.pre(/^find/, function(next) {
  console.log(this.getFilter());
  this.find({ active: { $ne: false } });
  next();
});
const User = mongoose.model("User", userSchema);
module.exports = User;
