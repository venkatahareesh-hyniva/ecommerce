import mongoose from "mongoose";
import { ROLES } from "../config/config.js";
// import { ROLES } from "../config/config.js";
const userSchema = new mongoose.Schema(
  {
    firstName: String,
    middleName: String,
    lastName: String,

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      // select: false
    },
    countryCode: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
    },
    addresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
      },
    ],

    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "active", "inactive", "rejected", "locked"],
      default: "active",
      required: true,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    userId: {
      type: Number,
      unique: true,
      required: true,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);
const User = mongoose.model("User", userSchema);
export default User;
