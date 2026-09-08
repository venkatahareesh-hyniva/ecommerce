import Cart from "../model/cartModel.js";
import Product from "../model/productModel.js";

class CartService {
  async addToCart(userId: any, items: any[]) {
    for (const item of items) {
      const { productId, quantity } = item;

      const product = await Product.findOne({
        _id: productId,
        isDeleted: false,
      });

      if (!product) {
        return {
          type: "productNotFound",
          data: null,
        };
      }

      if (product.stock_quantity < quantity) {
        return {
          type: "insufficientStock",
          data: null,
        };
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
            return {
              type: "productNotFound",
              data: null,
            };
          }

          const newQuantity = existingItem.quantity + item.quantity;
          if (newQuantity > product.stock_quantity) {
            return {
              type: "insufficientStock",
              data: null,
            };
          }

          existingItem.quantity = newQuantity;
        } else {
          cart.items.push(item);
        }
      }

      await cart.save();
    }

    const responseData: any = cart.toObject();
    delete responseData.userId;
    delete responseData.__v;

    return {
      type: "success",
      data: responseData,
    };
  }

    async getCart(userId: any) {
    const cart = await Cart.findOne({ userId })
      .populate("items.productId", "productName price discountPrice images")
      .select("-__v");

    if (!cart) {
      return {
        type: "notFound",
        data: null,
      };
    }

    const cartResponse = cart.toObject();
    delete cartResponse.userId;

    return {
      type: "success",
      data: cartResponse,
    };
  }

  async updateCartItem(userId: any, items: any[]) {
    const cart = await Cart.findOne({ userId }).select("-__v");

    if (!cart) {
      return {
        type: "notFound",
        data: null,
      };
    }

    for (const item of items) {
      const { productId, quantity, isSelected } = item;

      const cartItem = cart.items.find(
        (cartItem: any) =>
          cartItem.productId.toString() === productId.toString(),
      );

      if (!cartItem) {
        return {
          type: "itemNotFound",
          data: null,
          productId,
        };
      }

           if (quantity !== undefined) {
        const product = await Product.findOne({
          _id: productId,
          isDeleted: false,
        });

        if (!product) {
          return {
            type: "productNotFound",
            data: null,
          };
        }

        if (quantity > product.stock_quantity) {
          return {
            type: "insufficientStock",
            data: null,
          };
        }

        cartItem.quantity = quantity;
      }

      // Update selection
      if (isSelected !== undefined) {
        cartItem.set("isSelected", isSelected);
      }
    }

    await cart.save();

    const cartResponse = cart.toObject();

    delete cartResponse.userId;

    return {
      type: "success",
      data: cartResponse,
    };
  }

  // REMOVE CART ITEM
  async removeCartItem(userId: any, productId: string) {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return {
        type: "notFound",
        data: null,
      };
    }

    const itemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId.toString(),
    );

    if (itemIndex === -1) {
      return {
        type: "itemNotFound",
        data: null,
      };
    }

    cart.items.splice(itemIndex, 1);

    await cart.save();

    return {
      type: "success",
      data: null,
    };
  }

  // CLEAR CART
  async clearCart(userId: any) {
    const cart = await Cart.findOneAndUpdate(
      { userId },
      {
        $set: {
          items: [],
        },
      },
      {
        new: true,
      },
    );

    if (!cart) {
      return {
        type: "notFound",
        data: null,
      };
    }

    return {
      type: "success",
      data: null,
    };
  }
}

export default new CartService();
