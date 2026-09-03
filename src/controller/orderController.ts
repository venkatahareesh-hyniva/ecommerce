import Order from "../model/orderModel.js";
import Product from "../model/productModel.js";
import User from "../model/userModel.js";
import Address from "../model/addressModel.js";
import Cart from "../model/cartModel.js";

import {
  sendBadRequest,
  sendNotFound,
  sendInternalServerError,
  sendSuccessResponse,
  sendCreatedResponse,
} from "../utils/response-utils.js";

import { validateOrderItems } from "../validator/order.validator.js";
import mongoose from "mongoose";

export const checkout = async (req: any, res: any) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return sendBadRequest(res, "User information is missing");
    }

    const { addressId, paymentMethod } = req.body;
    if (!addressId) {
      return sendBadRequest(res, "Address is required");
    }

    if (!paymentMethod) {
      return sendBadRequest(res, "Payment method is required");
    }

    if (!["COD", "UPI", "Card", "NetBanking"].includes(paymentMethod)) {
      return sendBadRequest(res, "Invalid payment method");
    }
console.log("Logged user ID:", userId);
console.log("Payload addressId:", addressId);
console.log("Converted addressId:", Number(addressId));

const allAddresses = await Address.find({ userId });

console.log("User addresses:", allAddresses);

const selectedAddress = await Address.findOne({
  addressId: Number(addressId),
  userId,
});

console.log("Selected address:", selectedAddress);

if (!selectedAddress) {
  return sendNotFound(res, "Address not found");
}

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return sendNotFound(res, "Cart not found");
    }

    if (!cart.items || cart.items.length === 0) {
      return sendBadRequest(res, "Cart is empty");
    }
    const selectedItems = cart.items.filter(
      (item: any) => item.isSelected === true,
    );

    if (selectedItems.length === 0) {
      return sendBadRequest(res, "No products selected for checkout");
    }

    const orderItems = [];
    let totalAmount = 0;
    for (const cartItem of selectedItems) {
      const product = await Product.findOne({
        _id: cartItem.productId,
        isDeleted: false,
      });

      if (!product) {
        return sendNotFound(res, `Product ${cartItem.productId} not found`);
      }

      if (product.stock_quantity < cartItem.quantity) {
        return sendBadRequest(
          res,
          `Not enough stock for ${product.productName}`,
        );
      }

      const price = product.discountPrice ?? product.price;
      if (price === null || price === undefined) {
        return sendBadRequest(
          res,
          `Price is missing for ${product.productName}`,
        );
      }

      const subtotal = price * cartItem.quantity;

      orderItems.push({
        productId: product._id,
        productName: product.productName,
        quantity: cartItem.quantity,
        price,
        subtotal,
        dealerId: product.createdBy,
      });

      totalAmount += subtotal;
    }

    for (const cartItem of selectedItems) {
      await Product.findOneAndUpdate(
        {
          _id: cartItem.productId,
          stock_quantity: { $gte: cartItem.quantity },
          isDeleted: false,
        },
        {
          $inc: {
            stock_quantity: -cartItem.quantity,
          },
        },
      );
    }

    const order = await Order.create({
      userId,
      items: orderItems,
      totalAmount,
      status: "Pending",
      paymentStatus: "Pending",
      paymentMethod,
      shippingAddress: selectedAddress._id,
    });

    cart.items.pull(...selectedItems);
    await cart.save();
    return sendCreatedResponse(res, "Order created successfully");
  } catch (error: any) {
    console.log("Checkout error:", error);
    return sendInternalServerError(res, "Failed to checkout");
  }
};

export const getOrders = async (req: any, res: any) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return sendBadRequest(res, "User information is missing");
    }

    const orders = await Order.find({ userId,status: { $ne: "Cancelled" } })
      .populate("items.productId", "productName images")
      .select("items")
      .sort({ createdAt: -1 });

    const allOrders = orders.map((order: any) => ({
      orderId: order._id,
      items: order.items.map((item: any) => ({
        productName: item.productName,
        dealerId: item.dealerId,
        quantity: item.quantity,
        images: item.productId?.images || [],
      })),
    }));

    return sendSuccessResponse(res, "Orders fetched successfully", allOrders);
  } catch (error) {
    console.log(error);
    return sendInternalServerError(res, "Failed to fetch orders");
  }
};

export const getOrderById = async (req: any, res: any) => {
  try {
    const orderId = req.params.id;
    if (!orderId) {
      return sendBadRequest(res, "orderId required");
    }
    const order = await Order.findOne({ _id: orderId, userId: req.user._id })
      .populate("items.productId", "productName, price, images")
      .populate("shippingAddress", "addressId addressLine1 addressLine2 city state pincode country")
      .select("-__v -userId");
    if (!order) {
      return sendBadRequest(res, "order not found");
    }
    return sendSuccessResponse(res, "order fetched succesfully", order);
  } catch (error) {
    return sendInternalServerError(res, "Failed to fetch order");
  }
};

export const cancelOrder = async (req: any, res: any) => {
  try {
    const userId = req.user?._id;
    const { orderId } = req.params;
    const { reason } = req.body || {};

    if (!userId) {
      return sendBadRequest(res, "User information is missing");
    }

    if (!orderId) {
      return sendBadRequest(res, "Order ID is required");
    }

    if (!reason || !reason.trim()) {
      return sendBadRequest(
        res,
        "Cancellation reason is required"
      );
    }

    if (!mongoose.isValidObjectId(orderId)) {
      return sendBadRequest(res, "Invalid order ID");
    }

    const order = await Order.findOne({
      _id: orderId,
      userId: userId
    });

    if (!order) {
      return sendNotFound(res, "Order not found");
    }

    if (order.status === "Cancelled") {
      return sendBadRequest(res, "Order is already cancelled");
    }

    order.status = "Cancelled";
    order.cancellationReason = reason.trim();

    await order.save();

   return sendSuccessResponse(res, "Order cancelled successfully", {
  cancellationReason: order.cancellationReason
});

  } catch (error) {
    console.error(error);
    return sendInternalServerError(res, "Something went wrong");
  }
};