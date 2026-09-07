import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";

import Order from "../../src/model/orderModel.js";
import Product from "../../src/model/productModel.js";
import Address from "../../src/model/addressModel.js";
import Cart from "../../src/model/cartModel.js";

import * as orderController from "../../src/controller/orderController.js";

describe("Order Controller", () => {
  let req: any;
  let res: any;

  const userId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();
  const addressId = new mongoose.Types.ObjectId();
  const orderId = new mongoose.Types.ObjectId();

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
  // checkout()
  // =====================================================

  describe("checkout()", () => {
    it("should create order successfully", async () => {
      req.body = {
        addressId: addressId.toString(),
        paymentMethod: "COD",
      };

      const address: any = {
        _id: addressId,
      };

      const cartItem: any = {
        productId,
        quantity: 2,
        isSelected: true,
      };

      const cartItems: any = [cartItem];

      cartItems.pull = sinon.stub();

      const cart: any = {
        items: cartItems,
        save: sinon.stub().resolves(),
      };
      
      const product: any = {
          _id: productId,
          productName: "Phone",
          price: 1000,
          discountPrice: 900,
          stock_quantity: 10,
          createdBy: userId,
        };
        
        const addressFindStub = sinon.stub(Address, "findOne").resolves(address);
        
        const addressFindAllStub = sinon
        .stub(Address, "find")
        .resolves([address]);
        
        const cartFindStub = sinon.stub(Cart, "findOne").resolves(cart);
        const productFindStub = sinon.stub(Product, "findOne").resolves(product);

      const productUpdateStub = sinon
        .stub(Product, "findOneAndUpdate")
        .resolves(product);

      const orderCreateStub = sinon
        .stub(Order, "create")
        .resolves({ _id: orderId } as any);

      await orderController.checkout(req, res);
      console.log("pull calls:", cart.items.pull.callCount);
      console.log("save calls:", cart.save.callCount);
      expect(addressFindStub.calledOnce).to.equal(true);
      expect(addressFindAllStub.calledOnce).to.equal(true);
      expect(cartFindStub.calledOnce).to.equal(true);
      expect(productFindStub.calledOnce).to.equal(true);
      expect(productUpdateStub.calledOnce).to.equal(true);
      expect(orderCreateStub.calledOnce).to.equal(true);

      expect(cart.items.pull.calledOnce).to.equal(true);
      expect(cart.save.calledOnce).to.equal(true);

      // expect(res.status.calledOnce).to.equal(true);
      expect(res.json.calledOnce).to.equal(true);
      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Order created successfully");
    });

    it("should return error when user information is missing", async () => {
      req.user = {};

      await orderController.checkout(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("User information is missing");
    });

    it("should return error when address is missing", async () => {
      req.body = {
        paymentMethod: "COD",
      };

      await orderController.checkout(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Address is required");
    });

    it("should return error when payment method is missing", async () => {
      req.body = {
        addressId: addressId.toString(),
      };

      await orderController.checkout(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Payment method is required");
    });

    it("should return error for invalid payment method", async () => {
      req.body = {
        addressId: addressId.toString(),
        paymentMethod: "Invalid",
      };

      await orderController.checkout(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Invalid payment method");
    });

    it("should return address not found", async () => {
      req.body = {
        addressId: addressId.toString(),
        paymentMethod: "COD",
      };

      sinon.stub(Address, "find").resolves([]);
      const addressFindStub = sinon.stub(Address, "findOne").resolves(null);

      await orderController.checkout(req, res);

      expect(addressFindStub.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Address not found");
    });

    it("should return cart not found", async () => {
      req.body = {
        addressId: addressId.toString(),
        paymentMethod: "COD",
      };

      sinon.stub(Address, "find").resolves([]);
      sinon.stub(Address, "findOne").resolves({
        _id: addressId,
      } as any);

      const cartFindStub = sinon.stub(Cart, "findOne").resolves(null);

      await orderController.checkout(req, res);

      expect(cartFindStub.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Cart not found");
    });

    it("should return error when cart is empty", async () => {
      req.body = {
        addressId: addressId.toString(),
        paymentMethod: "COD",
      };

      sinon.stub(Address, "find").resolves([]);
      sinon.stub(Address, "findOne").resolves({
        _id: addressId,
      } as any);

      sinon.stub(Cart, "findOne").resolves({
        items: [],
      } as any);

      await orderController.checkout(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Cart is empty");
    });

    it("should return error when no products are selected", async () => {
      req.body = {
        addressId: addressId.toString(),
        paymentMethod: "COD",
      };

      sinon.stub(Address, "find").resolves([]);
      sinon.stub(Address, "findOne").resolves({
        _id: addressId,
      } as any);

      sinon.stub(Cart, "findOne").resolves({
        items: [
          {
            productId,
            quantity: 2,
            isSelected: false,
          },
        ],
      } as any);

      await orderController.checkout(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("No products selected for checkout");
    });

    it("should return product not found", async () => {
      req.body = {
        addressId: addressId.toString(),
        paymentMethod: "COD",
      };

      sinon.stub(Address, "find").resolves([]);
      sinon.stub(Address, "findOne").resolves({
        _id: addressId,
      } as any);

      sinon.stub(Cart, "findOne").resolves({
        items: [
          {
            productId,
            quantity: 2,
            isSelected: true,
          },
        ],
      } as any);

      sinon.stub(Product, "findOne").resolves(null);

      await orderController.checkout(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(`Product ${productId} not found`);
    });

    it("should return insufficient stock", async () => {
      req.body = {
        addressId: addressId.toString(),
        paymentMethod: "COD",
      };

      sinon.stub(Address, "find").resolves([]);
      sinon.stub(Address, "findOne").resolves({
        _id: addressId,
      } as any);

      sinon.stub(Cart, "findOne").resolves({
        items: [
          {
            productId,
            quantity: 20,
            isSelected: true,
          },
        ],
      } as any);

      sinon.stub(Product, "findOne").resolves({
        _id: productId,
        productName: "Phone",
        price: 1000,
        stock_quantity: 5,
        createdBy: userId,
      } as any);

      await orderController.checkout(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Not enough stock for Phone");
    });

    it("should return error when product price is missing", async () => {
      req.body = {
        addressId: addressId.toString(),
        paymentMethod: "COD",
      };

      sinon.stub(Address, "find").resolves([]);
      sinon.stub(Address, "findOne").resolves({
        _id: addressId,
      } as any);

      sinon.stub(Cart, "findOne").resolves({
        items: [
          {
            productId,
            quantity: 2,
            isSelected: true,
          },
        ],
      } as any);

      sinon.stub(Product, "findOne").resolves({
        _id: productId,
        productName: "Phone",
        price: null,
        discountPrice: null,
        stock_quantity: 10,
        createdBy: userId,
      } as any);

      await orderController.checkout(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Price is missing for Phone");
    });

    it("should handle database error", async () => {
      req.body = {
        addressId: addressId.toString(),
        paymentMethod: "COD",
      };

      sinon.stub(Address, "find").rejects(new Error("Database error"));

      await orderController.checkout(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Failed to checkout");
    });
  });

  // =====================================================
  // getOrders()
  // =====================================================

  describe("getOrders()", () => {
    it("should get orders successfully", async () => {
      const orderData: any = {
        _id: orderId,
        userId,
        items: [
          {
            productId,
            productName: "Phone",
            quantity: 2,
            price: 900,
            subtotal: 1800,
            dealerId: userId,
          },
        ],
        totalAmount: 1800,
      };

      const order: any = {
        toObject: sinon.stub().returns(orderData),
      };

      const orders = [order];

      const sortStub = sinon.stub().resolves(orders);
      const selectStub = sinon.stub().returns({
        sort: sortStub,
      });
      const populateStub = sinon.stub().returns({
        select: selectStub,
      });

      const findStub = sinon.stub(Order, "find").returns({
        populate: populateStub,
      } as any);

      await orderController.getOrders(req, res);

      expect(findStub.calledOnce).to.equal(true);
      expect(populateStub.calledOnce).to.equal(true);
      expect(selectStub.calledOnce).to.equal(true);
      expect(sortStub.calledOnce).to.equal(true);

      expect(orderData.items[0].dealerId).to.equal(undefined);

      expect(res.status.calledOnce).to.equal(true);
      expect(res.json.calledOnce).to.equal(true);
    });

    it("should return error when user information is missing", async () => {
      req.user = {};

      await orderController.getOrders(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("User information is missing");
    });

    it("should return empty orders successfully", async () => {
      const sortStub = sinon.stub().resolves([]);

      const selectStub = sinon.stub().returns({
        sort: sortStub,
      });

      const populateStub = sinon.stub().returns({
        select: selectStub,
      });

      sinon.stub(Order, "find").returns({
        populate: populateStub,
      } as any);

      await orderController.getOrders(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Orders fetched successfully");

      expect(response.data).to.deep.equal([]);
    });

    it("should handle database error", async () => {
      sinon.stub(Order, "find").throws(new Error("Database error"));

      await orderController.getOrders(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Failed to fetch orders");
    });
  });

  // =====================================================
  // getOrderById()
  // =====================================================

  describe("getOrderById()", () => {
    it("should return error when order id is missing", async () => {
      req.params = {};

      await orderController.getOrderById(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("orderId required");
    });

    it("should get order by id successfully", async () => {
      req.params = {
        id: orderId.toString(),
      };

      const order: any = {
        _id: orderId,
        userId,
        items: [],
      };

      const selectStub = sinon.stub().resolves(order);

      const populateShippingStub = sinon.stub().returns({
        select: selectStub,
      });

      const populateProductStub = sinon.stub().returns({
        populate: populateShippingStub,
      });

      const findOneStub = sinon.stub(Order, "findOne").returns({
        populate: populateProductStub,
      } as any);

      await orderController.getOrderById(req, res);

      expect(findOneStub.calledOnce).to.equal(true);
      expect(populateProductStub.calledOnce).to.equal(true);
      expect(populateShippingStub.calledOnce).to.equal(true);
      expect(selectStub.calledOnce).to.equal(true);

      expect(res.status.calledOnce).to.equal(true);
      expect(res.json.calledOnce).to.equal(true);
    });

    it("should return order not found", async () => {
      req.params = {
        id: orderId.toString(),
      };

      const selectStub = sinon.stub().resolves(null);

      const populateShippingStub = sinon.stub().returns({
        select: selectStub,
      });

      const populateProductStub = sinon.stub().returns({
        populate: populateShippingStub,
      });

      sinon.stub(Order, "findOne").returns({
        populate: populateProductStub,
      } as any);

      await orderController.getOrderById(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("order not found");
    });

    it("should handle database error", async () => {
      req.params = {
        id: orderId.toString(),
      };

      sinon.stub(Order, "findOne").throws(new Error("Database error"));

      await orderController.getOrderById(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Failed to fetch order");
    });
  });

  // =====================================================
  // cancelOrder()
  // =====================================================

  describe("cancelOrder()", () => {
    it("should cancel order successfully", async () => {
      req.params = {
        orderId: orderId.toString(),
      };

      req.body = {
        cancellationReason: "Changed my mind",
      };

      const order: any = {
        _id: orderId,
        userId,
        status: "Pending",
        cancellationReason: undefined,
        save: sinon.stub().resolves(),
      };

      const findOneStub = sinon.stub(Order, "findOne").resolves(order);

      await orderController.cancelOrder(req, res);

      expect(findOneStub.calledOnce).to.equal(true);
      expect(order.status).to.equal("Cancelled");
      expect(order.cancellationReason).to.equal("Changed my mind");
      expect(order.save.calledOnce).to.equal(true);

      expect(res.status.calledOnce).to.equal(true);
      expect(res.json.calledOnce).to.equal(true);
    });

    it("should return error when user information is missing", async () => {
      req.user = {};

      req.params = {
        orderId: orderId.toString(),
      };

      req.body = {
        cancellationReason: "Changed my mind",
      };

      await orderController.cancelOrder(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("User information is missing");
    });

    it("should return error when order id is missing", async () => {
      req.params = {};

      req.body = {
        cancellationReason: "Changed my mind",
      };

      await orderController.cancelOrder(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Order ID is required");
    });

    it("should return error when cancellation reason is missing", async () => {
      req.params = {
        orderId: orderId.toString(),
      };

      req.body = {};

      await orderController.cancelOrder(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Cancellation reason is required");
    });

    it("should return error when cancellation reason is empty", async () => {
      req.params = {
        orderId: orderId.toString(),
      };

      req.body = {
        cancellationReason: "   ",
      };

      await orderController.cancelOrder(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Cancellation reason is required");
    });

    it("should return error for invalid order id", async () => {
      req.params = {
        orderId: "invalid-id",
      };

      req.body = {
        cancellationReason: "Changed my mind",
      };

      await orderController.cancelOrder(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Invalid order ID");
    });

    it("should return order not found", async () => {
      req.params = {
        orderId: orderId.toString(),
      };

      req.body = {
        cancellationReason: "Changed my mind",
      };

      const findOneStub = sinon.stub(Order, "findOne").resolves(null);

      await orderController.cancelOrder(req, res);

      expect(findOneStub.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Order not found");
    });

    it("should return error when order is already cancelled", async () => {
      req.params = {
        orderId: orderId.toString(),
      };

      req.body = {
        cancellationReason: "Changed my mind",
      };

      sinon.stub(Order, "findOne").resolves({
        _id: orderId,
        userId,
        status: "Cancelled",
      } as any);

      await orderController.cancelOrder(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Order is already cancelled");
    });

    it("should handle database error", async () => {
      req.params = {
        orderId: orderId.toString(),
      };

      req.body = {
        cancellationReason: "Changed my mind",
      };

      sinon.stub(Order, "findOne").rejects(new Error("Database error"));

      await orderController.cancelOrder(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Something went wrong");
    });
  });
});
