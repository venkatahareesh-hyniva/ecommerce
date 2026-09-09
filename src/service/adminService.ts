import User from "../model/userModel.js";
import Product from "../model/productModel.js";
import { USER_STATUS } from "../config/config.js";

export const approveDealerService = async (dealerId: string) => {
  const dealer = await User.findOne({
    _id: dealerId,
    role: "dealer",
  }).select("-password -__v");

  if (!dealer) {
    return {
      error: "DEALER_NOT_FOUND",
    };
  }

  if (dealer.status === USER_STATUS.ACTIVE) {
    return {
      error: "ALREADY_ACTIVE",
    };
  }

  if (dealer.status !== USER_STATUS.PENDING) {
    return {
      error: "INVALID_STATUS",
      status: dealer.status,
    };
  }

  dealer.status = USER_STATUS.ACTIVE;
  dealer.rejectionReason = null;

  await dealer.save();

  return {
    data: dealer,
  };
};

export const rejectDealerService = async (
  dealerId: string,
  rejectionReason: string,
) => {
  const dealer = await User.findOne({
    _id: dealerId,
    role: "dealer",
  }).select("-password -__v");

  if (!dealer) {
    return {
      error: "DEALER_NOT_FOUND",
    };
  }

  if (dealer.status !== USER_STATUS.PENDING) {
    return {
      error: "INVALID_STATUS",
      status: dealer.status,
    };
  }

  dealer.status = USER_STATUS.REJECTED;
  dealer.rejectionReason = rejectionReason.trim();

  await dealer.save();

  return {
    data: dealer,
  };
};

export const deactivateDealerService = async (dealerId: string) => {
  const dealer = await User.findOne({
    _id: dealerId,
    role: "dealer",
  }).select("-password -__v");

  if (!dealer) {
    return {
      error: "DEALER_NOT_FOUND",
    };
  }

  if (dealer.status !== USER_STATUS.ACTIVE) {
    return {
      error: "INVALID_STATUS",
      status: dealer.status,
    };
  }

  dealer.status = USER_STATUS.INACTIVE;

  await dealer.save();

  const { rejectionReason, ...dealerData } = dealer.toObject();

  return {
    data: dealerData,
  };
};

export const activateDealerService = async (dealerId: string) => {
  const dealer = await User.findOne({
    _id: dealerId,
    role: "dealer",
  }).select("-password -__v");

  if (!dealer) {
    return {
      error: "DEALER_NOT_FOUND",
    };
  }

  if (dealer.status !== USER_STATUS.INACTIVE) {
    return {
      error: "INVALID_STATUS",
      status: dealer.status,
    };
  }

  dealer.status = USER_STATUS.ACTIVE;

  await dealer.save();
  const { rejectionReason, ...dealerData } = dealer.toObject();

  return {
    data: dealerData,
  };
};

export const getUsersService = async (role?: string, status?: string) => {
  const filter: any = {};

  if (role) {
    filter.role = role;
  }

  if (status) {
    filter.status = status;
  }

  const users = await User.find(filter).select("-password -__v -tokenVersion");

  const response = users.map((user: any) => {
    const userData = user.toObject();

    if (userData.role !== "dealer") {
      delete userData.rejectionReason;
    }

    return userData;
  });

  return response;
};

export const getAllProductsForAdminService = async () => {
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

  return products;
};

export const getProductByIdForAdminService = async (productId: string) => {
  const product = await Product.findOne({
    _id: productId,
    isDeleted: false,
  })
    .populate("categoryId", "categoryName")
    .populate("createdBy", "firstName email")
    .populate("updatedBy", "firstName email");

  if (!product) {
    return null;
  }

  const { _id, ...productData } = product.toObject();

  return productData;
};
