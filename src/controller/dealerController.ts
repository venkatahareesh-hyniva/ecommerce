// import Order from "../model/orderModel.js";
// import Product from "../model/productModel.js";
// import User from "../model/userModel.js";

// import {
//   sendBadRequest,
//   sendNotFound,
//   sendInternalServerError,
//   sendSuccessResponse,
// } from "../utils/response-utils.js";

// export const getDealerProducts = async (req: any, res: any) => {
//   try {
//     const dealerId = req.user._id;

//     const products = await Product.find({
//       createdBy: dealerId,
//       isDeleted: false,
//     })
//       .select("-__v -createdBy -updatedBy")
//       .populate("categoryId", "categoryName description");

//     return sendSuccessResponse(
//       res,
//       "Dealer products fetched successfully",
//       products,
//     );
//   } catch (error) {
//     console.log("Get dealer products error:", error);
//     return sendInternalServerError(res, "Failed to get dealer products");
//   }
// };

// export const getDealerOrders = async (req: any, res: any) => {
//   try {
//     const dealerId = req.user._id;
//     const orders = await Order.find({
//       "items.dealerId": dealerId,
//     })
//       .populate("userId", "firstName email -_id")
//       .populate("items.productId", "productName")
//       .select("-dealerId");

//     const dealerOrders = orders.map((order: any) => {
//       const orderObject = order.toObject();

//       orderObject.items = orderObject.items
//         .filter(
//           (item: any) => item.dealerId?.toString() === dealerId.toString(),
//         )
//         .map((item: any) => {
//           const { dealerId, ...orderItem } = item;
//           return orderItem;
//         });

//       return orderObject;
//     });

//     return sendSuccessResponse(
//       res,
//       "Dealer orders fetched successfully",
//       dealerOrders,
//     );
//   } catch (error) {
//     console.log("Get dealer orders error:", error);
//     return sendInternalServerError(res, "Failed to get dealer orders");
//   }
// };

// export const getDealerOrderById = async (req: any, res: any) => {
//   try {
//     const dealerId = req.user._id;
//     const orderId = req.params.orderId;

//     const dealerProducts = await Product.find({
//       createdBy: dealerId,
//       isDeleted: false,
//     }).select("_id");

//     const productIds = dealerProducts.map((product) => product._id);

//     const order = await Order.findOne({
//       _id: orderId,
//       "items.productId": { $in: productIds },
//     })
//       .populate("userId", "firstName email")
//       .populate("items.productId", "productName");

//     if (!order) {
//       return sendNotFound(
//         res,
//         "Order not found or does not contain your products",
//       );
//     }

//     return sendSuccessResponse(res, "Dealer order fetched successfully", order);
//   } catch (error) {
//     console.log("Get dealer order error:", error);
//     return sendInternalServerError(res, "Failed to get dealer order");
//   }
// };

// export const updateDealerOrderStatus = async (req: any, res: any) => {
//   try {
//     const dealerId = req.user._id;
//     const { orderId } = req.params;
//     const { productId, status } = req.body;

//     const allowedStatuses = ["Confirmed", "Shipped", "Delivered", "Cancelled"];

//     if (!allowedStatuses.includes(status)) {
//       return sendBadRequest(res, "Invalid order status");
//     }

//     if (!productId) {
//       return sendBadRequest(res, "Product ID is required");
//     }

//     const product = await Product.findOne({
//       _id: productId,
//       createdBy: dealerId,
//       isDeleted: false,
//     });

//     if (!product) {
//       return sendNotFound(res, "Product not found or does not belong to you");
//     }

//     const order = await Order.findOne({
//       _id: orderId,
//       "items.productId": productId,
//       "items.dealerId": dealerId,
//     }).populate(
//       "shippingAddress",
//       "addressLine1 addressLine2 city state pincode country",
//     );

//     if (!order) {
//       return sendNotFound(
//         res,
//         "Order not found or product does not belong to you",
//       );
//     }

//     const item = order.items.find(
//       (item: any) =>
//         item.productId.toString() === productId.toString() &&
//         item.dealerId.toString() === dealerId.toString(),
//     );

//     if (!item) {
//       return sendNotFound(res, "Product not found in this order");
//     }

//     item.status = status;

//     await order.save();

//     const { totalAmount, ...orderData } = order.toObject();

//     const orderResponse = {
//       ...orderData,
//       items: orderData.items.filter(
//         (item: any) => item.dealerId.toString() === dealerId.toString(),
//       ),
//     };

//     return sendSuccessResponse(
//       res,
//       "Product order status updated successfully",
//       orderResponse,
//     );
//   } catch (error) {
//     console.log("Update dealer order status error:", error);

//     return sendInternalServerError(res, "Failed to update order status");
//   }
// };

import {
  sendBadRequest,
  sendNotFound,
  sendInternalServerError,
  sendSuccessResponse,
} from "../utils/response-utils.js";

import {
  getDealerProductsService,
  getDealerOrdersService,
  getDealerOrderByIdService,
  updateDealerOrderStatusService,
} from "../service/dealerService.js";

export const getDealerProducts = async (req: any, res: any) => {
  try {
    const dealerId = req.user._id;

    const products = await getDealerProductsService(dealerId);

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
    const dealerId = req.user._id;

    const dealerOrders = await getDealerOrdersService(dealerId);

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

    const order = await getDealerOrderByIdService(dealerId, orderId);

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
    const { orderId } = req.params;
    const { productId, status } = req.body;

    const allowedStatuses = ["Confirmed", "Shipped", "Delivered", "Cancelled"];

    if (!allowedStatuses.includes(status)) {
      return sendBadRequest(res, "Invalid order status");
    }

    if (!productId) {
      return sendBadRequest(res, "Product ID is required");
    }
    

    const result = await updateDealerOrderStatusService(
      dealerId,
      orderId,
      productId,
      status,
    );
    

    if (result.error === "PRODUCT_NOT_FOUND") {
      return sendNotFound(res, "Product not found or does not belong to you");
    }

    if (result.error === "ORDER_NOT_FOUND") {
      return sendNotFound(
        res,
        "Order not found or product does not belong to you",
      );
    }

    if (result.error === "ITEM_NOT_FOUND") {
      return sendNotFound(res, "Product not found in this order");
    }

    return sendSuccessResponse(
      res,
      "Product order status updated successfully",
      result.data,
    );
  } catch (error) {
    console.log("Update dealer order status error:", error);

    return sendInternalServerError(res, "Failed to update order status");
  }
};
