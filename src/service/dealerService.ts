import Order from "../model/orderModel.js";
import Product from "../model/productModel.js";

export const getDealerProductsService = async (dealerId: any) => {
  const products = await Product.find({
    createdBy: dealerId,
    isDeleted: false,
  })
    .select("-__v -createdBy -updatedBy")
    .populate("categoryId", "categoryName description");

  return products;
};

export const getDealerOrdersService = async (dealerId: any) => {
  const orders = await Order.find({
    "items.dealerId": dealerId,
  })
    .populate("userId", "firstName email -_id")
    .populate("items.productId", "productName")
    .select("-dealerId");

  const dealerOrders = orders.map((order: any) => {
    const orderObject = order.toObject();

    orderObject.items = orderObject.items
      .filter(
        (item: any) =>
          item.dealerId?.toString() === dealerId.toString(),
      )
      .map((item: any) => {
        const { dealerId, ...orderItem } = item;

        return orderItem;
      });

    return orderObject;
  });

  return dealerOrders;
};

export const getDealerOrderByIdService = async (
  dealerId: any,
  orderId: string,
) => {
  const dealerProducts = await Product.find({
    createdBy: dealerId,
    isDeleted: false,
  }).select("_id");

  const productIds = dealerProducts.map((product) => product._id);

  const order = await Order.findOne({
    _id: orderId,
    "items.productId": { $in: productIds },
  })
    .populate("userId", "firstName email")
    .populate("items.productId", "productName");

  return order;
};

export const updateDealerOrderStatusService = async (
  dealerId: any,
  orderId: string,
  productId: string,
  status: string,
) => {
  const product = await Product.findOne({
    _id: productId,
    createdBy: dealerId,
    isDeleted: false,
  });

  if (!product) {
    return {
      error: "PRODUCT_NOT_FOUND",
    };
  }

  const order = await Order.findOne({
    _id: orderId,
    "items.productId": productId,
    "items.dealerId": dealerId,
  }).populate(
    "shippingAddress",
    "addressLine1 addressLine2 city state pincode country",
  );

  if (!order) {
    return {
      error: "ORDER NOT FOUND",
    };
  }

  const item = order.items.find(
    (item: any) =>
      item.productId.toString() === productId.toString() &&
      item.dealerId.toString() === dealerId.toString(),
  );

  if (!item) {
    return {
      error: "ITEM_NOT_FOUND",
    };
  }
 
  item.status = status as any;

  await order.save();

  const { totalAmount, ...orderData } = order.toObject();

  const orderResponse = {
    ...orderData,
    items: orderData.items.filter(
      (item: any) =>
        item.dealerId.toString() === dealerId.toString(),
    ),
  };

  return {
    data: orderResponse,
  };
};