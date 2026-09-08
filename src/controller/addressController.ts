import Address from "../model/addressModel.js";
import User from "../model/userModel.js";
import {
  sendBadRequest,
  sendInternalServerError,
  sendNotFound,
  sendSuccessResponse,
} from "../utils/response-utils.js";

export const createAddress = async (req: any, res: any) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return sendBadRequest(res, "User information is missing");
    }

    const { addressLine1, addressLine2, city, state, pincode, country } =
      req.body;

    const newAddress = await Address.create({
      userId,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
    });

    await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          addresses: newAddress._id,
        },
      },
      { new: true },
    );

    return sendSuccessResponse(res, "Address created successfully", newAddress);
  } catch (error) {
    console.log(error);

    return sendInternalServerError(res, "Failed to create address");
  }
};

export const updateAddress = async (req: any, res: any) => {
  try {
    const userId = req.user?._id;
    const addressId = req.params.addressId;

    if (!userId) {
      return sendBadRequest(res, "User information is missing");
    }

    if (!addressId) {
      return sendBadRequest(res, "Address ID is required");
    }

    const { addressLine1, addressLine2, city, state, country, pincode } =
      req.body;

    const address = await Address.findOneAndUpdate(
      {
        addressId,
        userId,
      },
      {
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        pincode,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).select("-__v -userId");

    if (!address) {
      return sendNotFound(res, "Address not found");
    }

    return sendSuccessResponse(res, "Address updated successfully", address);
  } catch (error) {
    console.log("Update address error:", error);
    return sendInternalServerError(res, "Failed to update address");
  }
};

export const getAddresses = async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const addresses = await Address.find({ userId }).select("-__V");
    return sendSuccessResponse(res, "Addresses found successfully", addresses);
  } catch (error) {
    console.log(error);
    return sendInternalServerError(res, "Failed to get addresses");
  }
};

export const getAddressById = async (req: any, res: any) => {
  try {
    const addressId = Number(req.params.addressId);
    const userId = req.user._id;

    if (!Number.isInteger(addressId) || addressId <= 0) {
      return sendBadRequest(res, "Invalid address ID");
    }

    const address = await Address.findOne({
      addressId,
      userId,
    }).select("-__v");

    if (!address) {
      return sendNotFound(res, "Address not found");
    }

    return sendSuccessResponse(res, "Address found successfully", address);
  } catch (error) {
    console.log(error);
    return sendInternalServerError(res, "Failed to get address");
  }
};

export const deleteAddress = async (req: any, res: any) => {
  try {
    const addressId = Number(req.params.addressId);
    const userId = req.user._id;

    if (!Number.isInteger(addressId) || addressId <= 0) {
      return sendBadRequest(res, "Invalid address ID");
    }

    const address = await Address.findOneAndDelete({
      addressId,
      userId,
    });

    if (!address) {
      return sendNotFound(res, "Address not found");
    }

    return sendSuccessResponse(res, "Address deleted successfully");
  } catch (error) {
    console.log(error);
    return sendInternalServerError(res, "Failed to delete address");
  }
};
