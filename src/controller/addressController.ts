import mongoose from "mongoose";

import {
  sendBadRequest,
  sendInternalServerError,
  sendNotFound,
  sendSuccessResponse,
} from "../utils/response-utils.js";

import AddressService from "../service/addressService.js";

export const createAddress = async (req: any, res: any) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return sendBadRequest(res, "User information is missing");
    }

    const { addressLine1, addressLine2, city, state, pincode, country } =
      req.body;

    if (!addressLine1 || !city || !state || !pincode || !country) {
      return sendBadRequest(res, "Required address fields are missing");
    }

    const newAddress = await AddressService.createAddress(userId, {
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country,
    });

    return sendSuccessResponse(res, "Address created successfully", newAddress);
  } catch (error) {
    console.log("Create address error:", error);

    return sendInternalServerError(res, "Failed to create address");
  }
};

export const updateAddress = async (req: any, res: any) => {
  try {
    const userId = req.user?._id;
    const id = req.params.id;

    if (!userId) {
      return sendBadRequest(res, "User information is missing");
    }

    if (typeof id !== "string" || !id) {
      return sendBadRequest(res, "Address ID is required");
    }

    if (!mongoose.isValidObjectId(id)) {
      return sendBadRequest(res, "Invalid address ID");
    }

    const updatedAddress = await AddressService.updateAddress(
      userId,
      id,
      req.body,
    );

    if (!updatedAddress) {
      return sendNotFound(res, "Address not found");
    }

    return sendSuccessResponse(
      res,
      "Address updated successfully",
      updatedAddress,
    );
  } catch (error) {
    console.log("Update address error:", error);

    return sendInternalServerError(res, "Failed to update address");
  }
};

export const getAddresses = async (req: any, res: any) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return sendBadRequest(res, "User information is missing");
    }

    const addresses = await AddressService.getAddresses(userId);

    return sendSuccessResponse(res, "Addresses found successfully", addresses);
  } catch (error) {
    console.log("Get addresses error:", error);

    return sendInternalServerError(res, "Failed to fetch addresses");
  }
};

export const getAddressById = async (req: any, res: any) => {
  try {
    const userId = req.user?._id;
    const id = req.params.id;

    if (!userId) {
      return sendBadRequest(res, "User information is missing");
    }

    if (typeof id !== "string" || !id) {
      return sendBadRequest(res, "Address ID is required");
    }

    if (!mongoose.isValidObjectId(id)) {
      return sendBadRequest(res, "Invalid address ID");
    }

    const address = await AddressService.getAddressById(userId, id);

    if (!address) {
      return sendNotFound(res, "Address not found");
    }

    return sendSuccessResponse(res, "Address found successfully", address);
  } catch (error) {
    console.log("Get address by ID error:", error);

    return sendInternalServerError(res, "Failed to fetch address");
  }
};

export const deleteAddress = async (req: any, res: any) => {
  try {
    const userId = req.user?._id;
    const id = req.params.id;

    if (!userId) {
      return sendBadRequest(res, "User information is missing");
    }

    if (typeof id !== "string" || !id) {
      return sendBadRequest(res, "Address ID is required");
    }

    if (!mongoose.isValidObjectId(id)) {
      return sendBadRequest(res, "Invalid address ID");
    }

    const deletedAddress = await AddressService.deleteAddress(userId, id);

    if (!deletedAddress) {
      return sendNotFound(res, "Address not found");
    }

    return sendSuccessResponse(
      res,
      "Address deleted successfully",
      // deletedAddress,
    );
  } catch (error) {
    console.log("Delete address error:", error);
    return sendInternalServerError(res, "Failed to delete address");
  }
};
