import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../src/model/userModel.js";
import { ROLES, USER_STATUS } from "../src/config/config.js";
import dotenv from "dotenv";
dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);

    console.log("MongoDB connected");

    const existingAdmin = await User.findOne({
      role: ROLES.ADMIN,
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    const lastUser = await User.findOne().sort({ userId: -1 });
    const userId = lastUser ? lastUser.userId + 1 : 1;

    const password = "Admin@123";

    const passwordSalt = Number(process.env.PASSWORD_SALT) || 10;
    const hashedPassword = await bcrypt.hash(password, passwordSalt);

    const admin = await User.create({
      userId,
      firstName: "Admin",
      middleName: "",
      lastName: "User",
      email: "admin@gmail.com",
      password: hashedPassword,
      countryCode:"+91",
      phoneNumber: "9876555555",      
      role: ROLES.ADMIN,
      status: USER_STATUS.ACTIVE,
    });

    console.log("Admin created successfully");
    console.log("Admin ID:", admin.userId);
    console.log("Email:", admin.email);
    console.log("Password:", password);
  } catch (error) {
    console.error("Failed to create admin:", error);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
