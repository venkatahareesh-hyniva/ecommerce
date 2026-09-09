import jwt from "jsonwebtoken";
import User from "../model/userModel.js";
import { ROLES, USER_STATUS } from "../config/config.js";
import { getUserByPhoneOrEmailService } from "./userService.js";
import { comparePassword, enctyptPassword } from "../utils/password-utils.js";
import { generateToken } from "../utils/jwt-utils.js";

export const registerService = async (data: any) => {
  const {
    firstName,
    middleName,
    lastName,
    email,
    countryCode,
    phoneNumber,
    password,
    address,
    role = "user",
  } = data;

  const existingUser = await getUserByPhoneOrEmailService(phoneNumber, email);

  if (existingUser) {
    return {
      error: "User already exists",
    };
  }

  const lastUser = await User.findOne().sort({
    userId: -1,
  });

  const userId = lastUser ? lastUser.userId + 1 : 1;
  const hashedPassword: string = await enctyptPassword(password);

  const status =
    role === ROLES.DEALER ? USER_STATUS.PENDING : USER_STATUS.ACTIVE;

  await User.create({
    userId,
    firstName,
    middleName,
    lastName,
    email,
    countryCode,
    password: hashedPassword,
    phoneNumber,
    address,
    role,
    status,
  });

  const response = data;

  delete response.password;
  delete response.role;

  return {
    user: response,
  };
};

export const loginService = async (email: string, password: string) => {
  const user = await User.findOne({ email });

  if (!user) {
    return {
      error: "User not found",
    };
  }

  const isPasswordMatch = await comparePassword(password, user.password);

  if (!isPasswordMatch) {
    return {
      error: "Invalid Password",
    };
  }

  if (user.status !== USER_STATUS.ACTIVE) {
    return {
      error: `User account status is ${user.status}`,
      status: user.status,
    };
  }

  const token = generateToken(user);
  return {
    token,
  };
};

export const logoutService = async (userId: any) => {
  await User.findByIdAndUpdate(userId, {
    $inc: {
      tokenVersion: 1,
    },
  });
};
