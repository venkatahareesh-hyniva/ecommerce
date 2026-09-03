import mongoose from "mongoose";

export const validateOrderItems = ( items: any[]) => {
  if (!Array.isArray(items) || items.length === 0) {
    return "ITEMS_REQUIRED";
  }

  for (const item of items) {
    if (!item.productId) {
    return "PRODUCT_ID_REQUIRED";
    }

    if (!mongoose.Types.ObjectId.isValid(item.productId)) {
      return "INVALID_PRODUCT_ID";
    }

    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
    return "INVALID_QUANTITY";
    }
  }
};

export const validateShippingAddress = ( shippingAddress: any) => {
  if (!shippingAddress) {
    return "Shipping address is required";
  }

  // if (!shippingAddress.name) {
  //   return "Name is required";
  // }

  // if (!shippingAddress.phone) {
  //   return "Phone is required";
  // }

  if (!shippingAddress.address) {
     return "Address is required";
  }

  if (!shippingAddress.city) {
    return "City is required";
  }

  if (!shippingAddress.state) {
    return "State is required";
  }

  if (!shippingAddress.pincode) {
  return "Pincode is required";
  }
};