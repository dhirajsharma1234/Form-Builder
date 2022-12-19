import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      minLength: 10,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minLength: 8,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otp_time: {
      type: Date,
    },
    token: {
      type: String,
    },
    tokenExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = new mongoose.model("user", userSchema);

export default UserModel;
