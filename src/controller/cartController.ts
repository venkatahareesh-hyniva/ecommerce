import Cart from "../model/cartModel.js";
import Product from "../model/productModel.js";
import {
  sendBadRequest,
  sendInternalServerError,
  sendNotFound,
  sendSuccessResponse,
} from "../utils/response-utils.js";
import { isValidObjectId } from "../utils/validation-utils.js";

export const addToCart = async (req: any, res: any) => {
  try {
    const userId = req.user?._id;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendBadRequest(res, "Items are required");
    }

    for (const item of items) {
      const { productId, quantity } = item;
      if (!productId) {
        return sendBadRequest(res, "Product ID is required");
      }

      if (!quantity || quantity < 1) {
        return sendBadRequest(res, "Quantity must be at least 1");
      }

      if (!isValidObjectId(productId)) {
        return sendBadRequest(res, "Invalid product ID");
      }

      const product = await Product.findOne({
        _id: productId,
        isDeleted: false,
      });

      if (!product) {
        return sendNotFound(res, "Product not found");
      }

      if (product.stock_quantity < quantity) {
        return sendBadRequest(res, "Insufficient stock");
      }
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({
        userId,
        items,
      });
    } else {
      for (const item of items) {
        const existingItem = cart.items.find(
          (cartItem: any) =>
            cartItem.productId.toString() === item.productId.toString(),
        );

        if (existingItem) {
          const product = await Product.findOne({
            _id: item.productId,
            isDeleted: false,
          });
          if (!product) {
            return sendNotFound(res, "product not found");
          }

          const newQuantity = existingItem.quantity + item.quantity;
          if (newQuantity > product.stock_quantity) {
            return sendBadRequest(res, "Insufficient stock");
          }

          existingItem.quantity = newQuantity;
        } else {
          cart.items.push(item);
        }
      }

      await cart.save();
    }
    // const cartResponse: any = cart.toObject();
    // cartResponse.items.forEach((item: any) => {
    //   delete item.isSelected;
    //   delete cartResponse.userId;
    //   delete cartResponse.__v;
    // });
    const {userId: cartuserId ,__v,... responseData} = cart.toObject();

    return sendSuccessResponse(
      res,
      "Product added to cart successfully",
      responseData,
    );
  } catch (error) {
    console.log(error);
    return sendInternalServerError(res, "Failed to add product to cart");
  }
};

export const getCart = async (req: any, res: any) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return sendBadRequest(res, "User information is missing");
    }

    const cart = await Cart.findOne({ userId })
      .populate("items.productId", "productName price discountPrice images")
      .select("-__v");

    if (!cart) {
      return sendNotFound(res, "Cart not found");
    }

    const cartResponse = cart.toObject();
    delete cartResponse.userId;

    return sendSuccessResponse(
      res,
      "cart items fetched successfully",
      cartResponse,
    );
  } catch (error) {
    console.log(error);

    return sendInternalServerError(res, "Failed to get cart");
  }
};

export const updateCartItem = async (req: any, res: any) => {
  try {
    const userId = req.user?._id;
    const { items } = req.body;

    if (!userId) {
      return sendBadRequest(res, "User information is missing");
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendBadRequest(res, "Items are required");
    }

    const cart = await Cart.findOne({ userId }).select("-__v");

    if (!cart) {
      return sendNotFound(res, "Cart not found");
    }

    for (const item of items) {
      const { productId, quantity, isSelected } = item;

      if (!productId) {
        return sendBadRequest(res, "Product ID is required");
      }

      if (!isValidObjectId(productId)) {
        return sendBadRequest(res, "Invalid product ID");
      }

      if (quantity === undefined && isSelected === undefined) {
        return sendBadRequest(res, "Quantity or isSelected is required");
      }

      const cartItem = cart.items.find(
        (cartItem: any) =>
          cartItem.productId.toString() === productId.toString(),
      );

      if (!cartItem) {
        return sendNotFound(res, `Product ${productId} not found in cart`);
      }

      if (quantity !== undefined) {
        if (quantity < 1) {
          return sendBadRequest(res, "Quantity must be at least 1");
        }

        const product = await Product.findOne({
          _id: productId,
          isDeleted: false,
        });

        if (!product) {
          return sendNotFound(res, "Product not found");
        }

        if (quantity > product.stock_quantity) {
          return sendBadRequest(res, "Insufficient stock");
        }
        cartItem.quantity = quantity;
      }

      if (isSelected !== undefined) {
        if (typeof isSelected !== "boolean") {
          return sendBadRequest(res, "isSelected must be true or false");
        }

        cartItem.set("isSelected", isSelected);
      }
    }

    await cart.save();

    const cartResponse = cart.toObject();
    delete cartResponse.userId;

    return sendSuccessResponse(res, "Cart updated successfully", cartResponse);
  } catch (error) {
    console.log(error);

    return sendInternalServerError(res, "Failed to update cart");
  }
};

export const removeCartItem = async (req: any, res: any) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.body;

    if (!userId) {
      return sendBadRequest(res, "User information is missing");
    }

    if (!productId) {
      return sendBadRequest(res, "Product ID is required");
    }

    if (!isValidObjectId(productId)) {
      return sendBadRequest(res, "Invalid product ID");
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return sendNotFound(res, "Cart not found");
    }

    const itemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId.toString(),
    );

    if (itemIndex === -1) {
      return sendNotFound(res, "Product not found in cart");
    }

    cart.items.splice(itemIndex, 1);

    await cart.save();

    return sendSuccessResponse(res, "Product removed from cart successfully");
  } catch (error) {
    console.log(error);

    return sendInternalServerError(res, "Failed to remove product from cart");
  }
};

export const clearCart = async (req: any, res: any) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return sendBadRequest(res, "User information is missing");
    }

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { new: true },
    );

    if (!cart) {
      return sendNotFound(res, "Cart not found");
    }

    return sendSuccessResponse(res, "Cart cleared successfully");
  } catch (error) {
    console.log(error);

    return sendInternalServerError(res, "Failed to clear cart");
  }
};
