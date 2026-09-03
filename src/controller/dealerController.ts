import Order from "../model/orderModel.js";
import Product from "../model/productModel.js";
import User from "../model/userModel.js";

import {
  sendBadRequest,
  sendNotFound,
  sendInternalServerError,
  sendSuccessResponse,
} from "../utils/response-utils.js";



export const getDealerProducts = async (req: any, res: any) => {
  try {
    const dealerId = req.user._id;

    const products = await Product.find({
      createdBy: dealerId,
      isDeleted: false,
    })
      .select("-__v")
      .populate("categoryId", "categoryName description");

    return sendSuccessResponse(
      res,
      "Dealer products fetched successfully",
      products,
    );
  } catch (error) {
    console.log("Get dealer products error:", error);
    return sendInternalServerError(res, "Failed to get dealer products");
  }
};

export const getDealerOrders = async (req: any, res: any) => {
  try {
    const dealerId = req.user._id.toString();

    const orders = await Order.find({
      "items.dealerId": dealerId,
    })
      .populate("userId", "firstName lastName email -_id")
      .populate("items.productId", "productName");

    const dealerOrders = orders.map((order: any) => {
      const orderObject = order.toObject();

      orderObject.items = orderObject.items.filter(
        (item: any) => item.dealerId.toString() === dealerId,
      );

      return orderObject;
    });

    return sendSuccessResponse(
      res,
      "Dealer orders fetched successfully",
      dealerOrders,
    );
  } catch (error) {
    console.log("Get dealer orders error:", error);
    return sendInternalServerError(res, "Failed to get dealer orders");
  }
};

export const getDealerOrderById = async (req: any, res: any) => {
  try {
    const dealerId = req.user._id;
    const orderId = req.params.orderId;

    const dealerProducts = await Product.find({
      createdBy: dealerId,
      isDeleted: false,
    }).select("_id");

    const productIds = dealerProducts.map((product) => product._id);

    const order = await Order.findOne({
      _id: orderId,
      "items.productId": { $in: productIds },
    })
      .populate("userId", "firstName lastName email")
      .populate("items.productId", "productName");

    if (!order) {
      return sendNotFound(
        res,
        "Order not found or does not contain your products",
      );
    }

    return sendSuccessResponse(res, "Dealer order fetched successfully", order);
  } catch (error) {
    console.log("Get dealer order error:", error);
    return sendInternalServerError(res, "Failed to get dealer order");
  }
};

export const updateDealerOrderStatus = async (req: any, res: any) => {
  try {
    const dealerId = req.user._id;
    const orderId = req.params.orderId;
    const { status } = req.body;

    const allowedStatuses = ["Confirmed", "Shipped", "Delivered", "Cancelled"];

    if (!allowedStatuses.includes(status)) {
      return sendBadRequest(res, "Invalid order status");
    }

    const dealerProducts = await Product.find({
      createdBy: dealerId,
      isDeleted: false,
    }).select("_id");

    const productIds = dealerProducts.map((product) => product._id);

    const order = await Order.findOne({
      _id: orderId,
      "items.productId": { $in: productIds },
    }).populate(
      "shippingAddress",
      "addressLine1 addressLine2 city state pincode country",
    );

    if (!order) {
      return sendNotFound(
        res,
        "Order not found or does not contain your products",
      );
    }

    order.items.forEach((item: any) => {
      if (item.dealerId.toString() === dealerId.toString()) {
        item.status = status;
      }
    });
    await order.save();
    const {totalAmount,...orderData} =order.toObject();
    const orderResponse = {
      ...orderData,
      items: order.items.filter(
        (item: any) => item.dealerId.toString() === dealerId.toString(),
      ),
    };

    return sendSuccessResponse(
      res,
      "Order status updated successfully",
      orderResponse,
    );
  } catch (error) {
    console.log("Update dealer order status error:", error);
    return sendInternalServerError(res, "Failed to update order status");
  }
};
