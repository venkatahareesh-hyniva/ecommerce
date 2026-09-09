// import bcrypt from "bcrypt";
// import User from "../model/userModel.js";
// import jwt from "jsonwebtoken";
// import { validateLogin, validateSignup } from "../validator/auth.validator.js";
// import {
//   sendBadRequest,
//   sendCreatedResponse,
//   sendForBiddden,
//   sendInternalServerError,
//   sendNotFound,
//   sendSuccessResponse,
//   sendUnauthorized,
// } from "../utils/response-utils.js";
// import { ROLES, USER_STATUS } from "../config/config.js";

// export const register = async (req: any, res: any) => {
//   try {
//     const {
//       firstName,
//       middleName,
//       lastName,
//       email,
//       countryCode,
//       phoneNumber,
//       password,
//       address,
//       role = "user",
//     } = req.body;

//     const validationError = validateSignup(req.body);

//     if (validationError) {
//       return sendBadRequest(res, validationError);
//     }

//     const existingUser = await User.findOne({
//       $or: [{ email }, { phoneNumber }],
//     });

//     if (existingUser) {
//       return sendBadRequest(res, "User already exists");
//     }

//     const lastUser = await User.findOne().sort({ userId: -1 });
//     const userId = lastUser ? lastUser.userId + 1 : 1;

//     const passwordSalt = Number(process.env.PASSWORD_SALT || 10);
//     const hashedPassword = await bcrypt.hash(password, passwordSalt);

//     const status =
//       role === ROLES.DEALER ? USER_STATUS.PENDING : USER_STATUS.ACTIVE;

//     await User.create({
//       userId,
//       firstName,
//       middleName,
//       lastName,
//       email,
//       countryCode,
//       password: hashedPassword,
//       phoneNumber,
//       address,
//       role: role,
//       status,
//     });

//     const message = role + ` created successfully`;
//     const response = { status, ...req.body };

//     return sendCreatedResponse(res, message, response);
//   } catch (error) {
//     console.log("Signup error:", error);
//     return sendInternalServerError(res, "Failed to create account");
//   }
// };

// export const Login = async (req: any, res: any) => {
//   try {
//     const validationError = validateLogin(req.body);

//     if (validationError) {
//       return sendBadRequest(res, validationError);
//     }

//     const { email, password } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) {
//       return sendNotFound(res, "User not found");
//     }

//     const isPasswordMatch = await bcrypt.compare(password, user.password);
//     if (!isPasswordMatch) {
//       return sendUnauthorized(res, "Invalid Password");
//     }
//     if (user.status !== USER_STATUS.ACTIVE) {
//       return sendForBiddden(res, `User account status is ${user.status}`);
//     }
//     // const tokenExpires = process.env.TOKEN_EXPIRES || "1d";
//     const token = jwt.sign(
//       {
//         Id: user._id,
//         role: user.role,
//         userId: user.userId,
//         tokenVersion: user.tokenVersion,
//       },
//       process.env.JWT_SECRET as string,
//       { expiresIn: "1d" },
//     );

//     return sendSuccessResponse(res, "Login successful", { token });
//   } catch (error) {
//     console.log("Error while login ::", error);
//     return sendInternalServerError(res, "Failed to login");
//   }
// };

// export const logout = async (req: any, res: any) => {
//   try {
//     const userId = req.user._id;
//     await User.findByIdAndUpdate(userId, {
//       $inc: {
//         tokenVersion: 1,
//       },
//     });
//     return sendSuccessResponse(res, "Logout successful");
//   } catch (error) {
//     console.log(error);
//     return sendInternalServerError(res, "Failed to logout");
//   }
// };

import bcrypt from "bcrypt";
import {
  sendBadRequest,
  sendCreatedResponse,
  sendForBiddden,
  sendInternalServerError,
  sendNotFound,
  sendSuccessResponse,
  sendUnauthorized,
} from "../utils/response-utils.js";
import jwt from "jsonwebtoken";

import { validateLogin, validateSignup } from "../validator/auth.validator.js";

import {
  registerService,
  logoutService,
} from "../service/authService.js";
import { getUserByEmail } from "../service/userService.js";
import { USER_STATUS } from "../config/config.js";

export const register = async (req: any, res: any) => {
  try {
    const validationError = validateSignup(req.body);

    if (validationError) {
      return sendBadRequest(res, validationError);
    }

    const result = await registerService(req.body);

    if (result.error) {
      return sendBadRequest(res, result.error);
    }
    if (!result.user) {
      return sendInternalServerError(res, "Failed to create account");
    }

    return sendCreatedResponse(
      res,
      `${result.user.role} created successfully`,
      result.user,
    );
  } catch (error) {
    console.log("Signup error:", error);

    return sendInternalServerError(res, "Failed to create account");
  }
};

export const Login = async (req: any, res: any) => {
  try {
    const validationError = validateLogin(req.body);

    if (validationError) {
      return sendBadRequest(res, validationError);
    }

    const { email, password } = req.body;

    const user = await getUserByEmail(email);

    if (!user) {
      return sendNotFound(res, "User not found");
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return sendUnauthorized(res, "Invalid Password");
    }
    if (user.status !== USER_STATUS.ACTIVE) {
      return sendForBiddden(res, `User account status is ${user.status}`);
    }

    const token = jwt.sign(
      {
        Id: user._id,
        role: user.role,
        userId: user.userId,
        tokenVersion: user.tokenVersion,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      },
    );

    return sendSuccessResponse(res, "Login successful", {
      token,
    });
  } catch (error) {
    console.log("Error while login ::", error);
    return sendInternalServerError(res, "Failed to login");
  }
};

export const logout = async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    await logoutService(userId);
    return sendSuccessResponse(res, "Logout successful");
  } catch (error) {
    console.log("Logout error:", error);
    return sendInternalServerError(res, "Failed to logout");
  }
};
