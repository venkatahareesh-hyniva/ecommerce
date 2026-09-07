import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";

import Cart from "../../src/model/cartModel.js";
import Product from "../../src/model/productModel.js";
import * as cartController from "../../src/controller/cartController.js";

describe("Cart Controller", () => {
  let req: any;
  let res: any;

  const userId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();
  const productId2 = new mongoose.Types.ObjectId();

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: {
        _id: userId,
      },
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
      send: sinon.stub().returnsThis(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  // =====================================================
  // addToCart()
  // =====================================================

  describe("addToCart()", () => {
    it("should add product to new cart successfully", async () => {
      req.body = {
        items: [
          {
            productId: productId.toString(),
            quantity: 2,
          },
        ],
      };

      sinon.stub(Product, "findOne").resolves({
        _id: productId,
        stock_quantity: 10,
        isDeleted: false,
      } as any);

      //   sinon.stub(Cart, "findOne").resolves(null);

      const cart: any = {
        userId,
        items: req.body.items,
        toObject: sinon.stub().returns({
          userId,
          items: req.body.items,
          __v: 0,
        }),
      };

      //   sinon.stub(Cart, "create").resolves(cart);
      const createStub = sinon.stub(Cart, "create").resolves(cart);
      const findOneStub = sinon.stub(Cart, "findOne").resolves(null);
      await cartController.addToCart(req, res);

      expect(findOneStub.calledOnce).to.equal(true);
      expect(createStub.calledOnce).to.equal(true);
      expect(res.status.called).to.equal(true);
      expect(res.json.called).to.equal(true);
    });

    it("should return error when items are missing", async () => {
      req.body = {};

      await cartController.addToCart(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Items are required");
    });

    it("should return error when items is not an array", async () => {
      req.body = {
        items: "invalid",
      };

      await cartController.addToCart(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Items are required");
    });

    it("should return error when items array is empty", async () => {
      req.body = {
        items: [],
      };

      await cartController.addToCart(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Items are required");
    });

    it("should return error when product id is missing", async () => {
      req.body = {
        items: [
          {
            quantity: 2,
          },
        ],
      };

      await cartController.addToCart(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Product ID is required");
    });

    it("should return error when quantity is missing", async () => {
      req.body = {
        items: [
          {
            productId: productId.toString(),
          },
        ],
      };

      await cartController.addToCart(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Quantity must be at least 1");
    });

    it("should return error when quantity is less than 1", async () => {
      req.body = {
        items: [
          {
            productId: productId.toString(),
            quantity: 0,
          },
        ],
      };

      await cartController.addToCart(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Quantity must be at least 1");
    });

    it("should reject invalid product id", async () => {
      req.body = {
        items: [
          {
            productId: "invalid-id",
            quantity: 2,
          },
        ],
      };

      await cartController.addToCart(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Invalid product ID");
    });

    it("should return product not found", async () => {
      req.body = {
        items: [
          {
            productId: productId.toString(),
            quantity: 2,
          },
        ],
      };

      sinon.stub(Product, "findOne").resolves(null);

      await cartController.addToCart(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Product not found");
    });

    it("should return insufficient stock", async () => {
      req.body = {
        items: [
          {
            productId: productId.toString(),
            quantity: 20,
          },
        ],
      };

      sinon.stub(Product, "findOne").resolves({
        _id: productId,
        stock_quantity: 5,
        isDeleted: false,
      } as any);

      await cartController.addToCart(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Insufficient stock");
    });

    it("should add item to existing cart", async () => {
      req.body = {
        items: [
          {
            productId: productId.toString(),
            quantity: 2,
          },
        ],
      };

      const cart: any = {
        userId,
        items: [],
        save: sinon.stub().resolves(),
        toObject: sinon.stub().returns({
          userId,
          items: [],
        }),
      };

      sinon.stub(Product, "findOne").resolves({
        _id: productId,
        stock_quantity: 10,
        isDeleted: false,
      } as any);

      sinon.stub(Cart, "findOne").resolves(cart);

      await cartController.addToCart(req, res);

      expect(cart.items.length).to.equal(1);
      expect(cart.items[0].productId).to.equal(productId.toString());
      expect(cart.items[0].quantity).to.equal(2);
      expect(cart.save.calledOnce).to.equal(true);
    });

    it("should increase quantity of existing cart item", async () => {
      req.body = {
        items: [
          {
            productId: productId.toString(),
            quantity: 2,
          },
        ],
      };

      const existingItem: any = {
        productId,
        quantity: 3,
      };

      const cart: any = {
        userId,
        items: [existingItem],
        save: sinon.stub().resolves(),
        toObject: sinon.stub().returns({
          userId,
          items: [existingItem],
        }),
      };

      sinon.stub(Product, "findOne").resolves({
        _id: productId,
        stock_quantity: 10,
        isDeleted: false,
      } as any);

      sinon.stub(Cart, "findOne").resolves(cart);

      await cartController.addToCart(req, res);

      expect(existingItem.quantity).to.equal(5);
      expect(cart.save.calledOnce).to.equal(true);
    });

    it("should return insufficient stock when existing quantity exceeds stock", async () => {
      req.body = {
        items: [
          {
            productId: productId.toString(),
            quantity: 8,
          },
        ],
      };

      const existingItem: any = {
        productId,
        quantity: 5,
      };

      const cart: any = {
        userId,
        items: [existingItem],
        save: sinon.stub().resolves(),
      };

      sinon.stub(Product, "findOne").resolves({
        _id: productId,
        stock_quantity: 10,
        isDeleted: false,
      } as any);

      sinon.stub(Cart, "findOne").resolves(cart);

      await cartController.addToCart(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Insufficient stock");
    });

    it("should handle database error", async () => {
      req.body = {
        items: [
          {
            productId: productId.toString(),
            quantity: 2,
          },
        ],
      };

      sinon.stub(Product, "findOne").rejects(new Error("Database error"));

      await cartController.addToCart(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Failed to add product to cart");
    });
  });

  // =====================================================
  // getCart()
  // =====================================================
describe("getCart()", () => {
  it("should get cart successfully", async () => {
    const cartData: any = {
      _id: new mongoose.Types.ObjectId(),
      userId,
      items: [
        {
          productId,
          quantity: 2,
        },
      ],
    };

    const cart: any = {
      populate: sinon.stub(),
      select: sinon.stub(),
      toObject: sinon.stub().returns(cartData),
    };

    cart.populate.returns(cart);
    cart.select.resolves(cart);

    const findOneStub = sinon.stub(Cart, "findOne").returns(cart);

    await cartController.getCart(req, res);

    expect(findOneStub.calledOnce).to.equal(true);
    expect(res.json.calledOnce).to.equal(true);

    const response = res.json.firstCall.args[0];

    expect(response.message).to.equal(
      "cart items fetched successfully",
    );

    expect(response.data.userId).to.equal(undefined);
  });

  it("should return error when user information is missing", async () => {
    req.user = {};

    await cartController.getCart(req, res);

    const response = res.json.firstCall.args[0];

    expect(response.message).to.equal(
      "User information is missing",
    );
  });

  it("should return cart not found", async () => {
    const cart: any = {
      populate: sinon.stub(),
      select: sinon.stub(),
    };

    cart.populate.returns(cart);
    cart.select.resolves(null);

    const findOneStub = sinon.stub(Cart, "findOne").returns(cart);

    await cartController.getCart(req, res);

    expect(findOneStub.calledOnce).to.equal(true);

    const response = res.json.firstCall.args[0];

    expect(response.message).to.equal("Cart not found");
  });

  it("should handle database error", async () => {
    const findOneStub = sinon
      .stub(Cart, "findOne")
      .throws(new Error("Database error"));

    await cartController.getCart(req, res);

    expect(findOneStub.calledOnce).to.equal(true);

    const response = res.json.firstCall.args[0];

    expect(response.message).to.equal(
      "Failed to get cart",
    );
  });
});

  // =====================================================
  // updateCartItem()
  // =====================================================

  describe("updateCartItem()", () => {
    it("should update quantity successfully", async () => {
      req.body = {
        items: [
          {
            productId: productId.toString(),
            quantity: 5,
          },
        ],
      };

      const cartItem: any = {
        productId,
        quantity: 2,
        set: sinon.stub(),
      };

      const cart: any = {
        items: [cartItem],
        save: sinon.stub().resolves(),
        toObject: sinon.stub().returns({
          items: [cartItem],
        }),
      };

      sinon.stub(Cart, "findOne").returns({
        select: sinon.stub().resolves(cart),
      } as any);

      sinon.stub(Product, "findOne").resolves({
        _id: productId,
        stock_quantity: 10,
        isDeleted: false,
      } as any);

      await cartController.updateCartItem(req, res);

      expect(cartItem.quantity).to.equal(5);
      expect(cart.save.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Cart updated successfully");
    });

    it("should update isSelected successfully", async () => {
      req.body = {
        items: [
          {
            productId: productId.toString(),
            isSelected: false,
          },
        ],
      };

      const cartItem: any = {
        productId,
        quantity: 2,
        set: sinon.stub(),
      };

      const cart: any = {
        items: [cartItem],
        save: sinon.stub().resolves(),
        toObject: sinon.stub().returns({
          items: [cartItem],
        }),
      };

      sinon.stub(Cart, "findOne").returns({
        select: sinon.stub().resolves(cart),
      } as any);

      await cartController.updateCartItem(req, res);

      expect(cartItem.set.calledOnceWith("isSelected", false)).to.equal(true);

      expect(cart.save.calledOnce).to.equal(true);
    });

    it("should return error when user information is missing", async () => {
      req.user = {};

      req.body = {
        items: [
          {
            productId: productId.toString(),
            quantity: 2,
          },
        ],
      };

      await cartController.updateCartItem(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("User information is missing");
    });

    it("should return error when items are missing", async () => {
      req.body = {};

      await cartController.updateCartItem(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Items are required");
    });

    it("should return cart not found", async () => {
      req.body = {
        items: [
          {
            productId: productId.toString(),
            quantity: 2,
          },
        ],
      };

      sinon.stub(Cart, "findOne").returns({
        select: sinon.stub().resolves(null),
      } as any);

      await cartController.updateCartItem(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Cart not found");
    });

    it("should return error when product id is missing", async () => {
      req.body = {
        items: [
          {
            quantity: 2,
          },
        ],
      };

      const cart: any = {
        items: [],
      };

      sinon.stub(Cart, "findOne").returns({
        select: sinon.stub().resolves(cart),
      } as any);

      await cartController.updateCartItem(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Product ID is required");
    });

    it("should reject invalid product id", async () => {
      req.body = {
        items: [
          {
            productId: "invalid-id",
            quantity: 2,
          },
        ],
      };

      const cart: any = {
        items: [],
      };

      sinon.stub(Cart, "findOne").returns({
        select: sinon.stub().resolves(cart),
      } as any);

      await cartController.updateCartItem(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Invalid product ID");
    });

    it("should require quantity or isSelected", async () => {
      req.body = {
        items: [
          {
            productId: productId.toString(),
          },
        ],
      };

      const cartItem: any = {
        productId,
        quantity: 2,
      };

      const cart: any = {
        items: [cartItem],
      };

      sinon.stub(Cart, "findOne").returns({
        select: sinon.stub().resolves(cart),
      } as any);

      await cartController.updateCartItem(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Quantity or isSelected is required");
    });

    it("should return product not found in cart", async () => {
      req.body = {
        items: [
          {
            productId: productId.toString(),
            quantity: 2,
          },
        ],
      };

      const cart: any = {
        items: [],
      };

      sinon.stub(Cart, "findOne").returns({
        select: sinon.stub().resolves(cart),
      } as any);

      await cartController.updateCartItem(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        `Product ${productId.toString()} not found in cart`,
      );
    });

    it("should reject quantity less than 1", async () => {
      req.body = {
        items: [
          {
            productId: productId.toString(),
            quantity: 0,
          },
        ],
      };

      const cartItem: any = {
        productId,
        quantity: 2,
      };

      const cart: any = {
        items: [cartItem],
      };

      sinon.stub(Cart, "findOne").returns({
        select: sinon.stub().resolves(cart),
      } as any);

      await cartController.updateCartItem(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Quantity must be at least 1");
    });

    it("should return product not found", async () => {
      req.body = {
        items: [
          {
            productId: productId.toString(),
            quantity: 3,
          },
        ],
      };

      const cartItem: any = {
        productId,
        quantity: 2,
      };

      const cart: any = {
        items: [cartItem],
      };

      sinon.stub(Cart, "findOne").returns({
        select: sinon.stub().resolves(cart),
      } as any);

      sinon.stub(Product, "findOne").resolves(null);

      await cartController.updateCartItem(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Product not found");
    });

    it("should return insufficient stock", async () => {
      req.body = {
        items: [
          {
            productId: productId.toString(),
            quantity: 20,
          },
        ],
      };

      const cartItem: any = {
        productId,
        quantity: 2,
      };

      const cart: any = {
        items: [cartItem],
      };

      sinon.stub(Cart, "findOne").returns({
        select: sinon.stub().resolves(cart),
      } as any);

      sinon.stub(Product, "findOne").resolves({
        _id: productId,
        stock_quantity: 5,
      } as any);

      await cartController.updateCartItem(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Insufficient stock");
    });

    it("should reject invalid isSelected value", async () => {
      req.body = {
        items: [
          {
            productId: productId.toString(),
            isSelected: "false",
          },
        ],
      };

      const cartItem: any = {
        productId,
        quantity: 2,
        set: sinon.stub(),
      };

      const cart: any = {
        items: [cartItem],
      };

      sinon.stub(Cart, "findOne").returns({
        select: sinon.stub().resolves(cart),
      } as any);

      await cartController.updateCartItem(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("isSelected must be true or false");
    });

    it("should handle database error", async () => {
      req.body = {
        items: [
          {
            productId: productId.toString(),
            quantity: 2,
          },
        ],
      };

      sinon.stub(Cart, "findOne").throws(new Error("Database error"));

      await cartController.updateCartItem(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Failed to update cart");
    });
  });

  // =====================================================
  // removeCartItem()
  // =====================================================

  describe("removeCartItem()", () => {
    it("should remove product successfully", async () => {
      req.body = {
        productId: productId.toString(),
      };

      const item1: any = {
        productId,
        quantity: 2,
      };

      const item2: any = {
        productId: productId2,
        quantity: 1,
      };

      const cart: any = {
        items: [item1, item2],
        save: sinon.stub().resolves(),
      };

      sinon.stub(Cart, "findOne").resolves(cart);

      await cartController.removeCartItem(req, res);

      expect(cart.items.length).to.equal(1);

      expect(cart.items[0].productId.toString()).to.equal(
        productId2.toString(),
      );

      expect(cart.save.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Product removed from cart successfully",
      );
    });

    it("should return error when user information is missing", async () => {
      req.user = {};

      req.body = {
        productId: productId.toString(),
      };

      await cartController.removeCartItem(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("User information is missing");
    });

    it("should return error when product id is missing", async () => {
      req.body = {};

      await cartController.removeCartItem(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Product ID is required");
    });

    it("should reject invalid product id", async () => {
      req.body = {
        productId: "invalid-id",
      };

      await cartController.removeCartItem(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Invalid product ID");
    });

    it("should return cart not found", async () => {
      req.body = {
        productId: productId.toString(),
      };

      sinon.stub(Cart, "findOne").resolves(null);

      await cartController.removeCartItem(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Cart not found");
    });

    it("should return product not found in cart", async () => {
      req.body = {
        productId: productId.toString(),
      };

      const cart: any = {
        items: [
          {
            productId: productId2,
            quantity: 2,
          },
        ],
      };

      sinon.stub(Cart, "findOne").resolves(cart);

      await cartController.removeCartItem(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Product not found in cart");
    });

    it("should handle database error", async () => {
      req.body = {
        productId: productId.toString(),
      };

      sinon.stub(Cart, "findOne").rejects(new Error("Database error"));

      await cartController.removeCartItem(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Failed to remove product from cart");
    });
  });

  // =====================================================
  // clearCart()
  // =====================================================

  describe("clearCart()", () => {
    it("should clear cart successfully", async () => {
      const cart = {
        _id: new mongoose.Types.ObjectId(),
        userId,
        items: [],
      };

      const updateStub = sinon
        .stub(Cart, "findOneAndUpdate")
        .resolves(cart as any);

      await cartController.clearCart(req, res);

      expect(updateStub.calledOnce).to.equal(true);

      expect(updateStub.firstCall.args[0]).to.deep.equal({
        userId,
      });

      expect(updateStub.firstCall.args[1]).to.deep.equal({
        $set: {
          items: [],
        },
      });

      expect(updateStub.firstCall.args[2]).to.deep.equal({
        new: true,
      });

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Cart cleared successfully");
    });

    it("should return error when user information is missing", async () => {
      req.user = {};

      await cartController.clearCart(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("User information is missing");
    });

    it("should return cart not found", async () => {
      sinon.stub(Cart, "findOneAndUpdate").resolves(null);

      await cartController.clearCart(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Cart not found");
    });

    it("should handle database error", async () => {
      sinon.stub(Cart, "findOneAndUpdate").rejects(new Error("Database error"));

      await cartController.clearCart(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Failed to clear cart");
    });
  });
});
