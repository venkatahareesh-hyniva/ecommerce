// import Order from "../model/orderModel.js";
// import Product from "../model/productModel.js";
// import User from "../model/userModel.js";
// import Address from "../model/addressModel.js";
// import Cart from "../model/cartModel.js";

// import {
//   sendBadRequest,
//   sendNotFound,
//   sendInternalServerError,
//   sendSuccessResponse,
//   sendCreatedResponse,
// } from "../utils/response-utils.js";

// import { validateOrderItems } from "../validator/order.validator.js";
// import mongoose from "mongoose";

// export const checkout = async (req: any, res: any) => {
//   try {
//     const userId = req.user?._id;

//     if (!userId) {
//       return sendBadRequest(res, "User information is missing");
//     }

//     const { addressId, paymentMethod } = req.body;
//     if (!addressId) {
//       return sendBadRequest(res, "Address is required");
//     }

//     if (!paymentMethod) {
//       return sendBadRequest(res, "Payment method is required");
//     }

//     if (!["COD", "UPI", "Card", "NetBanking"].includes(paymentMethod)) {
//       return sendBadRequest(res, "Invalid payment method");
//     }
//     console.log("Logged user ID:", userId);
//     console.log("Payload addressId:", addressId);

//     const allAddresses = await Address.find({ userId });

//     console.log("User addresses:", allAddresses);

//     const selectedAddress = await Address.findOne({
//       _id: addressId,
//       userId,
//     });

//     console.log("Selected address:", selectedAddress);

//     if (!selectedAddress) {
//       return sendNotFound(res, "Address not found");
//     }

//     const cart = await Cart.findOne({ userId });

//     if (!cart) {
//       return sendNotFound(res, "Cart not found");
//     }

//     if (!cart.items || cart.items.length === 0) {
//       return sendBadRequest(res, "Cart is empty");
//     }
//     const selectedItems = cart.items.filter(
//       (item: any) => item.isSelected === true,
//     );

//     if (selectedItems.length === 0) {
//       return sendBadRequest(res, "No products selected for checkout");
//     }

//     const orderItems = [];
//     let totalAmount = 0;
//     for (const cartItem of selectedItems) {
//       const product = await Product.findOne({
//         _id: cartItem.productId,
//         isDeleted: false,
//       });

//       if (!product) {
//         return sendNotFound(res, `Product ${cartItem.productId} not found`);
//       }

//       if (product.stock_quantity < cartItem.quantity) {
//         return sendBadRequest(
//           res,
//           `Not enough stock for ${product.productName}`,
//         );
//       }

//       const price = product.discountPrice ?? product.price;
//       if (price === null || price === undefined) {
//         return sendBadRequest(
//           res,
//           `Price is missing for ${product.productName}`,
//         );
//       }

//       const subtotal = price * cartItem.quantity;

//       orderItems.push({
//         productId: product._id,
//         productName: product.productName,
//         quantity: cartItem.quantity,
//         price,
//         subtotal,
//         dealerId: product.createdBy,
//       });

//       totalAmount += subtotal;
//     }

//     for (const cartItem of selectedItems) {
//       await Product.findOneAndUpdate(
//         {
//           _id: cartItem.productId,
//           stock_quantity: { $gte: cartItem.quantity },
//           isDeleted: false,
//         },
//         {
//           $inc: {
//             stock_quantity: -cartItem.quantity,
//           },
//         },
//       );
//     }

//     const order = await Order.create({
//       userId,
//       items: orderItems,
//       totalAmount,
//       status: "Pending",
//       paymentStatus: "Pending",
//       paymentMethod,
//       shippingAddress: selectedAddress._id,
//     });

//     cart.items.pull(...selectedItems);
//     await cart.save();
//     return sendCreatedResponse(res, "Order created successfully");
//   } catch (error: any) {
//     console.log("Checkout error:", error);
//     return sendInternalServerError(res, "Failed to checkout");
//   }
// };

// export const getOrders = async (req: any, res: any) => {
//   try {
//     const userId = req.user?._id;

//     if (!userId) {
//       return sendBadRequest(res, "User information is missing");
//     }

//     const orders = await Order.find({ userId })
//       .select("-cancellationReason -items.cancellationReason")
//       .populate("items.productId", "productName images status")
//       .select("-items.productName -userId")
//       .sort({ createdAt: -1 });

//     const orderResponse = orders.map((order: any) => {
//       const orderData = order.toObject();

//       orderData.items.forEach((item: any) => {
//         delete item.dealerId;
//       });

//       return orderData;
//     });
//     return sendSuccessResponse(
//       res,
//       "Orders fetched successfully",
//       orderResponse,
//     );
//   } catch (error) {
//     console.log(error);
//     return sendInternalServerError(res, "Failed to fetch orders");
//   }
// };

// export const getOrderById = async (req: any, res: any) => {
//   try {
//     const orderId = req.params.id;
//     if (!orderId) {
//       return sendBadRequest(res, "orderId required");
//     }
//     const order = await Order.findOne({ _id: orderId, userId: req.user._id })
//       .populate("items.productId", "productName, price, images")
//       .select("-cancellationReason -items.cancellationReason")
//       .populate(
//         "shippingAddress",
//         "addressId addressLine1 addressLine2 city state pincode country",
//       )
//       .select("-__v -userId -_id");
//     if (!order) {
//       return sendBadRequest(res, "order not found");
//     }
//     return sendSuccessResponse(res, "order fetched succesfully", order);
//   } catch (error) {
//     return sendInternalServerError(res, "Failed to fetch order");
//   }
// };

// export const cancelOrder = async (req: any, res: any) => {
//   try {
//     const userId = req.user?._id;
//     const { orderId } = req.params;
//     const { cancellationReason } = req.body || {};

//     if (!userId) {
//       return sendBadRequest(res, "User information is missing");
//     }

//     if (!orderId) {
//       return sendBadRequest(res, "Order ID is required");
//     }

//     if (!cancellationReason || !cancellationReason.trim()) {
//       return sendBadRequest(res, "Cancellation reason is required");
//     }

//     if (!mongoose.isValidObjectId(orderId)) {
//       return sendBadRequest(res, "Invalid order ID");
//     }

//     const order = await Order.findOne({
//       _id: orderId,
//       userId: userId,
//     });

//     if (!order) {
//       return sendNotFound(res, "Order not found");
//     }

//     if (order.status === "Cancelled") {
//       return sendBadRequest(res, "Order is already cancelled");
//     }

//     for (const item of order.items) {
//       if (item.status === "Cancelled") {
//         continue;
//       }

//       const product = await Product.findByIdAndUpdate(
//         item.productId,
//         {
//           $inc: {
//             stock_quantity: item.quantity,
//           },
//         },
//         {
//           new: true,
//         },
//       );

//       if (!product) {
//         return sendNotFound(res, `Product ${item.productId} not found`);
//       }

//       item.status = "Cancelled";
//       item.cancellationReason = cancellationReason.trim();
//     }

//     order.status = "Cancelled";
//     order.cancellationReason = cancellationReason.trim();

//     await order.save();

//     return sendSuccessResponse(
//       res,
//       "Order cancelled and stock restored successfully",
//       {
//         orderId: order._id,
//         status: order.status,
//         cancellationReason: order.cancellationReason,
//       },
//     );
//   } catch (error) {
//     console.error("Cancel order error:", error);

//     return sendInternalServerError(res, "Something went wrong");
//   }
// };

// export const cancelOrderItems = async (req: any, res: any) => {
//   try {
//     const userId = req.user?._id;
//     const { orderId } = req.params;
//     const { productIds, cancellationReason } = req.body || {};

//     if (!userId) {
//       return sendBadRequest(res, "User information is missing");
//     }
//     if (!orderId) {
//       return sendBadRequest(res, "Order ID is required");
//     }
//     if (!Array.isArray(productIds) || productIds.length === 0) {
//       return sendBadRequest(res, "Product IDs are required");
//     }
//     if (!cancellationReason || !cancellationReason.trim()) {
//       return sendBadRequest(res, "Cancellation reason is required");
//     }
//     if (!mongoose.isValidObjectId(orderId)) {
//       return sendBadRequest(res, "Invalid order ID");
//     }

//     for (const productId of productIds) {
//       if (!mongoose.isValidObjectId(productId)) {
//         return sendBadRequest(res, `Invalid product ID: ${productId}`);
//       }
//     }

//     const order = await Order.findOne({
//       _id: orderId,
//       userId,
//     });

//     if (!order) {
//       return sendNotFound(res, "Order not found");
//     }

//     for (const productId of productIds) {
//       const item: any = order.items.find(
//         (orderItem: any) =>
//           orderItem.productId?.toString() === productId.toString(),
//       );

//       if (!item) {
//         return sendNotFound(
//           res,
//           `Product ${productId} not found in this order`,
//         );
//       }

//       if (item.status === "Cancelled") {
//         return sendBadRequest(res, `Product ${productId} is already cancelled`);
//       }

//       const product = await Product.findByIdAndUpdate(
//         item.productId,
//         { $inc: { stock_quantity: item.quantity } },
//         { new: true },
//       );

//       if (!product) {
//         return sendNotFound(res, `Product ${productId} not found`);
//       }

//       item.status = "Cancelled";
//       item.cancellationReason = cancellationReason.trim();

//       order.totalAmount -= item.subtotal;
//     }
//     await order.save();

//     return sendSuccessResponse(res, "Products cancelled successfully");
//   } catch (error) {
//     console.error("Cancel order items error:", error);
//     return sendInternalServerError(res, "Something went wrong");
//   }
// };

import mongoose from "mongoose";

import {
  sendBadRequest,
  sendNotFound,
  sendInternalServerError,
  sendSuccessResponse,
  sendCreatedResponse,
} from "../utils/response-utils.js";

import {
  checkoutService,
  getOrdersService,
  getOrderByIdService,
  cancelOrderService,
  cancelOrderItemsService,
} from "../service/orderService.js";

export const checkout = async (req: any, res: any) => {
  try {
    const userId = req.user?._id;

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

    const result = await checkoutService(res,userId, addressId, paymentMethod);

    if (result.error) {
      if (result.statusCode === 404) {
        return sendNotFound(res, result.error);
      }

      return sendBadRequest(res, result.error);
    }

    return sendCreatedResponse(res, "Order created successfully", result.orderData);
  } catch (error) {
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

    const orders = await getOrdersService(userId);

    return sendSuccessResponse(res, "Orders fetched successfully", orders);
  } catch (error) {
    console.log("Get orders error:", error);

    return sendInternalServerError(res, "Failed to fetch orders");
  }
};

export const getOrderById = async (req: any, res: any) => {
  try {
    const userId = req.user?._id;
    const orderId = req.params.id;

    if (!userId) {
      return sendBadRequest(res, "User information is missing");
    }

    if (!orderId) {
      return sendBadRequest(res, "Order ID required");
    }

    if (!mongoose.isValidObjectId(orderId)) {
      return sendBadRequest(res, "Invalid order ID");
    }

    const order = await getOrderByIdService(orderId, userId);

    if (!order) {
      return sendNotFound(res, "Order not found");
    }

    return sendSuccessResponse(res, "Order fetched successfully", order);
  } catch (error) {
    console.log("Get order by ID error:", error);

    return sendInternalServerError(res, "Failed to fetch order");
  }
};

export const cancelOrder = async (req: any, res: any) => {
  try {
    const userId = req.user?._id;
    const { orderId } = req.params;
    const { cancellationReason } = req.body || {};

    if (!userId) {
      return sendBadRequest(res, "User information is missing");
    }

    if (!orderId) {
      return sendBadRequest(res, "Order ID is required");
    }

    if (!cancellationReason || !cancellationReason.trim()) {
      return sendBadRequest(res, "Cancellation reason is required");
    }

    if (!mongoose.isValidObjectId(orderId)) {
      return sendBadRequest(res, "Invalid order ID");
    }

    const result = await cancelOrderService(
      userId,
      orderId,
      cancellationReason,
    );

    if (result.error) {
      if (result.statusCode === 404) {
        return sendNotFound(res, result.error);
      }

      return sendBadRequest(res, result.error);
    }

    return sendSuccessResponse(
      res,
      "Order cancelled and stock restored successfully",
      result,
    );
  } catch (error) {
    console.log("Cancel order error:", error);

    return sendInternalServerError(res, "Something went wrong");
  }
};

export const cancelOrderItems = async (req: any, res: any) => {
  try {
    const userId = req.user?._id;
    const { orderId } = req.params;
    const { productIds, cancellationReason } = req.body || {};

    if (!userId) {
      return sendBadRequest(res, "User information is missing");
    }

    if (!orderId) {
      return sendBadRequest(res, "Order ID is required");
    }

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return sendBadRequest(res, "Product IDs are required");
    }

    if (!cancellationReason || !cancellationReason.trim()) {
      return sendBadRequest(res, "Cancellation reason is required");
    }

    if (!mongoose.isValidObjectId(orderId)) {
      return sendBadRequest(res, "Invalid order ID");
    }

    for (const productId of productIds) {
      if (!mongoose.isValidObjectId(productId)) {
        return sendBadRequest(res, `Invalid product ID: ${productId}`);
      }
    }

    const result = await cancelOrderItemsService(
      userId,
      orderId,
      productIds,
      cancellationReason,
    );

    if (result.error) {
      if (result.statusCode === 404) {
        return sendNotFound(res, result.error);
      }

      return sendBadRequest(res, result.error);
    }

    return sendSuccessResponse(res, "Products cancelled successfully");
  } catch (error) {
    console.log("Cancel order items error:", error);

    return sendInternalServerError(res, "Something went wrong");
  }
};
