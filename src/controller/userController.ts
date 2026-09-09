// import User from "../model/userModel.js";

// import {
//   sendInternalServerError,
//   sendNotFound,
//   sendSuccessResponse,
// } from "../utils/response-utils.js";

// export const getProfile = async (req: any, res: any) => {
//   try {
//     const user = await User.findById(req.user._id)
//       .select("-password -__v -tokenVersion");
//     if (!user) {
//       return sendNotFound(res, "Profile not found");
//     }

//     const response = {
//       ...user.toObject(),
//       role: user.role,
//     };

//     return sendSuccessResponse(res, "Profile fetched successfully", response);
//   } catch (error) {
//     console.log("Get profile error:", error);

//     return sendInternalServerError(res, "Failed to get profile");
//   }
// };

// export const updateProfile = async (req: any, res: any) => {
//   try {
//     const userId = req.user._id;

//     const { firstName, middleName, lastName, phoneNumber, address } = req.body;

//     const user = await User.findById(userId);

//     if (!user) {
//       return sendNotFound(res, "Profile not found");
//     }

//     if (firstName !== undefined) {
//       user.firstName = firstName;
//     }

//     if (middleName !== undefined) {
//       user.middleName = middleName;
//     }

//     if (lastName !== undefined) {
//       user.lastName = lastName;
//     }

//     if (phoneNumber !== undefined) {
//       user.phoneNumber = phoneNumber;
//     }

//     if (address !== undefined) {
//       user.address = address;
//     }

//     await user.save();

//     const userData = await User.findById(userId).select(
//       "-password -__v -tokenVersion",
//     );

//     return sendSuccessResponse(res, "Profile updated successfully", userData);
//   } catch (error) {
//     console.log("Update profile error:", error);

//     return sendInternalServerError(res, "Failed to update profile");
//   }
// };

import {
  sendInternalServerError,
  sendNotFound,
  sendSuccessResponse,
} from "../utils/response-utils.js";

import {
  getProfileService,
  updateProfileService,
} from "../service/userService.js";

export const getProfile = async (req: any, res: any) => {
  try {
    const userId = req.user._id;

    const user = await getProfileService(userId);

    if (!user) {
      return sendNotFound(res, "Profile not found");
    }

    const response = {
      ...user,
      role: user.role,
    };

    return sendSuccessResponse(res, "Profile fetched successfully", response);
  } catch (error) {
    console.log("Get profile error:", error);

    return sendInternalServerError(res, "Failed to get profile");
  }
};

export const updateProfile = async (req: any, res: any) => {
  try {
    const userId = req.user._id;

    const userData = await updateProfileService(userId, req.body);

    if (!userData) {
      return sendNotFound(res, "Profile not found");
    }

    return sendSuccessResponse(res, "Profile updated successfully", userData);
  } catch (error) {
    console.log("Update profile error:", error);

    return sendInternalServerError(res, "Failed to update profile");
  }
};
