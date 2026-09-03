import { USER_STATUS } from "../config/config.js";
import User from "../model/userModel.js";

import {
  sendBadRequest,
  sendNotFound,
  sendInternalServerError,
  sendSuccessResponse,
  sendForBiddden,
} from "../utils/response-utils.js";

import { isValidObjectId } from "../utils/validation-utils.js";

export const approveDealer = async (req: any, res: any) => {
  try {
    const { dealerId } = req.params;

    const dealer = await User.findOne({
      _id: dealerId,
      role: "dealer",
    }).select("-password -__v");

    if (!dealer) {
      return sendNotFound(res, "Dealer not found");
    }

    if (dealer.status === "active") {
      return sendBadRequest(res, "Dealer is already active");
    }
    if (dealer.status !== "pending") {
      return sendBadRequest(
        res,
        `Dealer cannot be approved because status is ${dealer.status}`,
      );
    }

    dealer.status = USER_STATUS.ACTIVE;

    await dealer.save();

    return sendSuccessResponse(res, "Dealer approved successfully", dealer);
  } catch (error) {
    console.error("Approve dealer error:", error);
    return sendInternalServerError(res, "Failed to approve dealer");
  }
};

export const rejectDealer = async (req: any, res: any) => {
  try {
    const { dealerId } = req.params;
    const loggedInUser = req.user;
    const { reason } = req.body;

    if (loggedInUser.role !== "admin") {
      return sendForBiddden(res, "Only admin can reject dealer");
    }

    const dealer = await User.findOne({
      _id: dealerId,
      role: "dealer",
    }).select("-password -__v");

    if (!dealer) {
      return sendNotFound(res, "Dealer not found");
    }

    if (dealer.status === USER_STATUS.INACTIVE) {
      return sendBadRequest(res, "Dealer is already inactive");
    }

    dealer.status = USER_STATUS.INACTIVE;

    await dealer.save();

    return sendSuccessResponse(res, "Dealer rejected successfully", dealer);
  } catch (error) {
    console.error("Reject dealer error:", error);
    return sendInternalServerError(res, "Failed to reject dealer");
  }
};

export const getUsers = async (req: any, res: any) => {
  try {
    const { role, status } = req.query;

    const filter: any = {};

    if (role) {
      filter.role = role;
    }

    if (status) {
      filter.status = status;
    }

    const users = await User.find(filter).select(
      "-password -__v -tokenVersion",
    );

    return sendSuccessResponse(res, "Users fetched successfully", users);
  } catch (error) {
    console.log("Get users error:", error);

    return sendInternalServerError(res, "Failed to fetch users");
  }
};
