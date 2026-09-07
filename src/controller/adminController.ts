import { USER_STATUS } from "../config/config.js";
import Product from "../model/productModel.js";
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

    if (dealer.status === USER_STATUS.ACTIVE) {
      return sendBadRequest(res, "Dealer is already active");
    }
    if (dealer.status !== USER_STATUS.PENDING) {
      return sendBadRequest(
        res,
        `Dealer cannot be approved because status is ${dealer.status}`,
      );
    }

    dealer.status = USER_STATUS.ACTIVE;
    dealer.rejectionReason = null;

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
    const { rejectionReason } = req.body;

    if (loggedInUser.role !== "admin") {
      return sendForBiddden(res, "Only admin can reject dealer");
    }

    if (!rejectionReason || rejectionReason.trim() === "") {
      return sendBadRequest(res, "Rejection reason is required");
    }

    const dealer = await User.findOne({
      _id: dealerId,
      role: "dealer",
    }).select("-password -__v");

    if (!dealer) {
      return sendNotFound(res, "Dealer not found");
    }

    if (dealer.status !== USER_STATUS.PENDING) {
      return sendBadRequest(
        res,
        `Dealer cannot be rejected because status is ${dealer.status}`,
      );
    }

    dealer.status = USER_STATUS.REJECTED;
    dealer.rejectionReason = rejectionReason.trim();

    await dealer.save();

    return sendSuccessResponse(res, "Dealer rejected successfully"); // dealer
  } catch (error) {
    console.error("Reject dealer error:", error);
    return sendInternalServerError(res, "Failed to reject dealer");
  }
};

export const deactivateDealer = async (req: any, res: any) => {
  try {
    const { dealerId } = req.params;

    if (!isValidObjectId(dealerId)) {
      return sendBadRequest(res, "Invalid dealer ID");
    }

    const dealer = await User.findOne({
      _id: dealerId,
      role: "dealer",
    }).select("-password -__v");

    if (!dealer) {
      return sendNotFound(res, "Dealer not found");
    }

    if (dealer.status !== USER_STATUS.ACTIVE) {
      return sendBadRequest(
        res,
        `Dealer cannot be deactivated because status is ${dealer.status}`,
      );
    }

    dealer.status = USER_STATUS.INACTIVE;

    await dealer.save();

    return sendSuccessResponse(res, "Dealer deactivated successfully"); //dealer
  } catch (error) {
    console.error("Deactivate dealer error:", error);

    return sendInternalServerError(res, "Failed to deactivate dealer");
  }
};

export const activateDealer = async (req: any, res: any) => {
  try {
    const { dealerId } = req.params;

    if (!isValidObjectId(dealerId)) {
      return sendBadRequest(res, "Invalid dealer ID");
    }

    const dealer = await User.findOne({
      _id: dealerId,
      role: "dealer",
    }).select("-password -__v");

    if (!dealer) {
      return sendNotFound(res, "Dealer not found");
    }

    if (dealer.status !== USER_STATUS.INACTIVE) {
      return sendBadRequest(
        res,
        `Dealer cannot be activated because status is ${dealer.status}`,
      );
    }

    dealer.status = USER_STATUS.ACTIVE;

    await dealer.save();

    return sendSuccessResponse(res, "Dealer activated successfully"); //dealer
  } catch (error) {
    console.error("Activate dealer error:", error);

    return sendInternalServerError(res, "Failed to activate dealer");
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

    const response = users.map((user: any) => {
      const userData = user.toObject();

      if (userData.role !== "dealer") {
        delete userData.rejectionReason;
      }

      return userData;
    });

    return sendSuccessResponse(res, "Users fetched successfully", response);
  } catch (error) {
    console.log("Get users error:", error);

    return sendInternalServerError(res, "Failed to fetch users");
  }
};

export const getAllProductsForAdmin = async (req: any, res: any) => {
  try {
    const products = await Product.find()
      .populate("categoryId", "categoryName")
      .populate("createdBy", "firstName email")
      .populate("updatedBy", "firstName email")
      .sort({ createdAt: -1 })
      .lean();

    products.forEach((product: any) => {
      product.productId = product._id;
      delete product._id;
    });

    return sendSuccessResponse(res, "Products fetched successfully", products);
  } catch (error) {
    console.log(error);
    return sendInternalServerError(res, "Failed to fetch products");
  }
};

export const getProductByIdForAdmin = async (req: any, res: any) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({
      _id: productId,
      isDeleted: false,
    })
      .populate("categoryId", "categoryName")
      .populate("createdBy", "firstName email")
      .populate("updatedBy", "firstName email");

    if (!product) {
      return sendNotFound(res, "Product not found");
    }
    const {_id, ...productData} =product.toObject();

    return sendSuccessResponse(res, "Product fetched successfully", productData);
  } catch (error) {
    console.log(error);
    return sendInternalServerError(res, "Failed to fetch product");
  }
};
