import Order from "../model/orderModel.js";
import Product from "../model/productModel.js";
import Cart from "../model/cartModel.js";
import addressService from "./addressService.js";
import type { PaymentMethod } from "../utils/types.js";
import { sendBadRequest, sendNotFound } from "../utils/response-utils.js";
import cartService from "./cartService.js";
import productService from "./productService.js";

export const checkoutService = async (
  res: any,
  userId: string,
  addressId: string,
  paymentMethod: PaymentMethod,
) => {
  const selectedAddress = await addressService.getAddressById(
    userId,
    addressId,
  );

  if (!selectedAddress) {
    return sendBadRequest(res, "address not found");
  }

  const cart = await cartService.getCartByUserId(userId);

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

  const orderItems: any[] = [];
  let totalAmount = 0;

  for (const cartItem of selectedItems) {
 const product = await productService.getProductById("cartItem.productId");

if (!product) {
  return {
    type: "productNotFound",
    data: null,
  };
}

    if (!product) {
      return sendBadRequest(res, `Product ${cartItem.productId} not found`);
    }

    if (product.stock_quantity < cartItem.quantity) {
      return sendBadRequest(res, `Not enough stock for ${product.productName}`);
    }

    const price = product.discountPrice ?? product.price;

    if (price === null || price === undefined) {
      return sendBadRequest(res, `Price is missing for ${product.productName}`);
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
    const updatedProduct = await Product.findOneAndUpdate(
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
      {
        new: true,
      },
    );

    if (!updatedProduct) {
      return {
        error: "Product stock is no longer available",
        statusCode: 400,
      };
    }
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
  const orderData = await Order.findById(order._id)
    .populate(
      "items.productId",
      "productName description price discountPrice images",
    )
    .populate(
      "shippingAddress",
      "addressId addressLine1 addressLine2 city state pincode country",
    )
    .select("-userId -__v -cancellationReason -items.cancellationReason");

  return {
    orderData,
  };
};

export const getOrdersService = async (userId: any) => {
  const orders = await Order.find({ userId })

    .populate("items.productId", "productName images status")
    .select("-items.productName -userId")
    .sort({ createdAt: -1 });

  const orderResponse = orders.map((order: any) => {
    const orderData = order.toObject();

    orderData.items.forEach((item: any) => {
      delete item.dealerId;
    });
    if (orderData.status !== "Cancelled") {
      delete orderData.cancellationReason;
    }

    return orderData;
  });

  return orderResponse;
};

export const getOrderByIdService = async (orderId: string, userId: any) => {
  const order = await Order.findOne({
    _id: orderId,
    userId,
  })
    .populate("items.productId", "productName price images")
    .select("-cancellationReason -items.cancellationReason")
    .populate(
      "shippingAddress",
      "addressId addressLine1 addressLine2 city state pincode country",
    )
    .select("-__v -userId -_id");

  return order;
};

export const cancelOrderService = async (
  userId: any,
  orderId: string,
  cancellationReason: string,
) => {
  const order = await Order.findOne({
    _id: orderId,
    userId,
  });

  if (!order) {
    return {
      error: "Order not found",
      statusCode: 404,
    };
  }

  if (order.status === "Cancelled") {
    return {
      error: "Order is already cancelled",
      statusCode: 400,
    };
  }

  for (const item of order.items) {
    if (item.status === "Cancelled") {
      continue;
    }

    const product = await Product.findByIdAndUpdate(
      item.productId,
      {
        $inc: {
          stock_quantity: item.quantity,
        },
      },
      {
        new: true,
      },
    );

    if (!product) {
      return {
        error: `Product ${item.productId} not found`,
        statusCode: 404,
      };
    }

    item.status = "Cancelled";
    item.cancellationReason = cancellationReason.trim();
  }

  order.status = "Cancelled";
  order.cancellationReason = cancellationReason.trim();

  await order.save();

  return {
    orderId: order._id,
    status: order.status,
    cancellationReason: order.cancellationReason,
  };
};

export const cancelOrderItemsService = async (
  userId: any,
  orderId: string,
  productIds: string[],
  cancellationReason: string,
) => {
  const order = await Order.findOne({
    _id: orderId,
    userId,
  });

  if (!order) {
    return {
      error: "Order not found",
      statusCode: 404,
    };
  }

  for (const productId of productIds) {
    const item: any = order.items.find(
      (orderItem: any) =>
        orderItem.productId?.toString() === productId.toString(),
    );

    if (!item) {
      return {
        error: `Product ${productId} not found in this order`,
        statusCode: 404,
      };
    }

    if (item.status === "Cancelled") {
      return {
        error: `Product ${productId} is already cancelled`,
        statusCode: 400,
      };
    }

    const product = await Product.findByIdAndUpdate(
      item.productId,
      {
        $inc: {
          stock_quantity: item.quantity,
        },
      },
      {
        new: true,
      },
    );

    if (!product) {
      return {
        error: `Product ${productId} not found`,
        statusCode: 404,
      };
    }

    item.status = "Cancelled";
    item.cancellationReason = cancellationReason.trim();

    order.totalAmount -= item.subtotal;
  }

  const allCancelled = order.items.every(
    (item: any) => item.status === "Cancelled",
  );

  if (allCancelled) {
    order.status = "Cancelled";
  }

  await order.save();

  return {
    order,
  };
};
