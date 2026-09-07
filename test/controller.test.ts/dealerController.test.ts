import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";

import * as dealerController from "../../src/controller/dealerController.js";
import Product from "../../src/model/productModel.js";
import Order from "../../src/model/orderModel.js";

describe("Dealer Controller", () => {
  let req: any;
  let res: any;

  const dealerId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();
  const orderId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: {
        _id: dealerId,
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

  // ============================================================
  // getDealerProducts()
  // ============================================================

  describe("getDealerProducts()", () => {
    it("should fetch dealer products successfully", async () => {
      const products: any = [
        {
          _id: productId,
          productName: "iPhone 15",
          price: 50000,
        },
      ];

      const populateStub = sinon.stub().resolves(products);

      const selectStub = sinon.stub().returns({
        populate: populateStub,
      });

      const findStub = sinon.stub(Product, "find").returns({
        select: selectStub,
      } as any);

      await dealerController.getDealerProducts(req, res);

      expect(findStub.calledOnce).to.equal(true);
      expect(selectStub.calledOnce).to.equal(true);
      expect(populateStub.calledOnce).to.equal(true);

      const findArgs: any = findStub.firstCall.args[0];

      expect(findArgs.createdBy).to.equal(dealerId);
      expect(findArgs.isDeleted).to.equal(false);

      expect(res.json.calledOnce).to.equal(true);

      const response: any = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Dealer products fetched successfully",
      );

      expect(response.data).to.equal(products);
    });

    it("should return internal server error when fetching dealer products fails", async () => {
      const findStub = sinon
        .stub(Product, "find")
        .throws(new Error("Database error"));

      await dealerController.getDealerProducts(req, res);

      expect(findStub.calledOnce).to.equal(true);
      expect(res.json.calledOnce).to.equal(true);

      const response: any = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Failed to get dealer products",
      );
    });
  });

  // ============================================================
  // getDealerOrders()
  // ============================================================

  describe("getDealerOrders()", () => {
    it("should fetch dealer orders successfully", async () => {
      const otherDealerId = new mongoose.Types.ObjectId();
      const otherProductId = new mongoose.Types.ObjectId();

      const orderObject = {
        _id: orderId,
        items: [
          {
            productId: productId,
            productName: "iPhone 15",
            quantity: 2,
            dealerId: dealerId,
          },
          {
            productId: otherProductId,
            productName: "Laptop",
            quantity: 1,
            dealerId: otherDealerId,
          },
        ],
      };

      const order: any = {
        toObject: sinon.stub().returns(orderObject),
      };

      const orders: any = [order];

      const selectStub = sinon.stub().resolves(orders);

      const populateItemsStub = sinon.stub().returns({
        select: selectStub,
      });

      const populateUserStub = sinon.stub().returns({
        populate: populateItemsStub,
      });

      const findStub = sinon.stub(Order, "find").returns({
        populate: populateUserStub,
      } as any);

      await dealerController.getDealerOrders(req, res);

      expect(findStub.calledOnce).to.equal(true);
      expect(populateUserStub.calledOnce).to.equal(true);
      expect(populateItemsStub.calledOnce).to.equal(true);
      expect(selectStub.calledOnce).to.equal(true);

      const findArgs: any = findStub.firstCall.args[0];

      expect(findArgs["items.dealerId"]).to.equal(dealerId);

      expect(res.json.calledOnce).to.equal(true);

      const response: any = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Dealer orders fetched successfully",
      );

      expect(response.data).to.be.an("array");
      expect(response.data[0].items).to.have.length(1);

      expect(response.data[0].items[0].dealerId).to.equal(undefined);
    });

    it("should return internal server error when fetching dealer orders fails", async () => {
      const findStub = sinon
        .stub(Order, "find")
        .throws(new Error("Database error"));

      await dealerController.getDealerOrders(req, res);

      expect(findStub.calledOnce).to.equal(true);
      expect(res.json.calledOnce).to.equal(true);

      const response: any = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Failed to get dealer orders",
      );
    });
  });

  // ============================================================
  // getDealerOrderById()
  // ============================================================

  describe("getDealerOrderById()", () => {
    it("should return dealer order successfully", async () => {
      req.params.orderId = orderId.toString();

      const dealerProducts: any = [
        {
          _id: productId,
        },
      ];

      const productSelectStub = sinon
        .stub()
        .resolves(dealerProducts);

      const productFindStub = sinon
        .stub(Product, "find")
        .returns({
          select: productSelectStub,
        } as any);

      const order: any = {
        _id: orderId,
        items: [
          {
            productId: productId,
          },
        ],
      };

      const populateProductStub = sinon.stub().resolves(order);

      const populateUserStub = sinon.stub().returns({
        populate: populateProductStub,
      });

      const orderFindStub = sinon
        .stub(Order, "findOne")
        .returns({
          populate: populateUserStub,
        } as any);

      await dealerController.getDealerOrderById(req, res);

      expect(productFindStub.calledOnce).to.equal(true);
      expect(productSelectStub.calledOnce).to.equal(true);

      expect(orderFindStub.calledOnce).to.equal(true);
      expect(populateUserStub.calledOnce).to.equal(true);
      expect(populateProductStub.calledOnce).to.equal(true);

      const orderFindArgs: any =
        orderFindStub.firstCall.args[0];

      expect(orderFindArgs._id).to.equal(orderId.toString());

      expect(
        orderFindArgs["items.productId"].$in,
      ).to.deep.equal([productId]);

      expect(res.json.calledOnce).to.equal(true);

      const response: any = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Dealer order fetched successfully",
      );

      expect(response.data).to.equal(order);
    });

    it("should return not found when dealer order does not exist", async () => {
      req.params.orderId = orderId.toString();

      const productSelectStub = sinon
        .stub()
        .resolves([
          {
            _id: productId,
          },
        ]);

      sinon.stub(Product, "find").returns({
        select: productSelectStub,
      } as any);

      const populateProductStub = sinon
        .stub()
        .resolves(null);

      const populateUserStub = sinon.stub().returns({
        populate: populateProductStub,
      });

      const orderFindStub = sinon
        .stub(Order, "findOne")
        .returns({
          populate: populateUserStub,
        } as any);

      await dealerController.getDealerOrderById(req, res);

      expect(orderFindStub.calledOnce).to.equal(true);
      expect(res.json.calledOnce).to.equal(true);

      const response: any = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Order not found or does not contain your products",
      );
    });

    it("should return internal server error when getting dealer order fails", async () => {
      req.params.orderId = orderId.toString();

      const productFindStub = sinon
        .stub(Product, "find")
        .throws(new Error("Database error"));

      await dealerController.getDealerOrderById(req, res);

      expect(productFindStub.calledOnce).to.equal(true);
      expect(res.json.calledOnce).to.equal(true);

      const response: any = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Failed to get dealer order",
      );
    });
  });

  // ============================================================
  // updateDealerOrderStatus()
  // ============================================================

  describe("updateDealerOrderStatus()", () => {
    it("should return bad request for invalid order status", async () => {
      req.params.orderId = orderId.toString();

      req.body = {
        productId: productId.toString(),
        status: "InvalidStatus",
      };

      await dealerController.updateDealerOrderStatus(req, res);

      expect(res.json.calledOnce).to.equal(true);

      const response: any = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Invalid order status",
      );
    });

    it("should return bad request when product ID is missing", async () => {
      req.params.orderId = orderId.toString();

      req.body = {
        status: "Confirmed",
      };

      await dealerController.updateDealerOrderStatus(req, res);

      expect(res.json.calledOnce).to.equal(true);

      const response: any = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Product ID is required",
      );
    });

    it("should return not found when product does not belong to dealer", async () => {
      req.params.orderId = orderId.toString();

      req.body = {
        productId: productId.toString(),
        status: "Confirmed",
      };

      const productFindOneStub = sinon
        .stub(Product, "findOne")
        .resolves(null);

      await dealerController.updateDealerOrderStatus(
        req,
        res,
      );

      expect(productFindOneStub.calledOnce).to.equal(true);

      const args: any =
        productFindOneStub.firstCall.args[0];

      expect(args._id).to.equal(productId.toString());
      expect(args.createdBy).to.equal(dealerId);
      expect(args.isDeleted).to.equal(false);

      expect(res.json.calledOnce).to.equal(true);

      const response: any = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Product not found or does not belong to you",
      );
    });

    it("should return not found when order does not exist", async () => {
      req.params.orderId = orderId.toString();

      req.body = {
        productId: productId.toString(),
        status: "Confirmed",
      };

      const productFindOneStub = sinon
        .stub(Product, "findOne")
        .resolves({
          _id: productId,
          createdBy: dealerId,
          isDeleted: false,
        } as any);

      const populateStub = sinon
        .stub()
        .resolves(null);

      const orderFindOneStub = sinon
        .stub(Order, "findOne")
        .returns({
          populate: populateStub,
        } as any);

      await dealerController.updateDealerOrderStatus(
        req,
        res,
      );

      expect(productFindOneStub.calledOnce).to.equal(true);
      expect(orderFindOneStub.calledOnce).to.equal(true);
      expect(populateStub.calledOnce).to.equal(true);

      expect(res.json.calledOnce).to.equal(true);

      const response: any = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Order not found or product does not belong to you",
      );
    });

    it("should return not found when product is not present in order", async () => {
      req.params.orderId = orderId.toString();

      req.body = {
        productId: productId.toString(),
        status: "Confirmed",
      };

      sinon.stub(Product, "findOne").resolves({
        _id: productId,
        createdBy: dealerId,
        isDeleted: false,
      } as any);

      const differentProductId =
        new mongoose.Types.ObjectId();

      const order: any = {
        items: [
          {
            productId: differentProductId,
            dealerId: dealerId,
          },
        ],
      };

      const populateStub = sinon
        .stub()
        .resolves(order);

      sinon.stub(Order, "findOne").returns({
        populate: populateStub,
      } as any);

      await dealerController.updateDealerOrderStatus(
        req,
        res,
      );

      expect(res.json.calledOnce).to.equal(true);

      const response: any = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Product not found in this order",
      );
    });

    it("should update dealer order status successfully", async () => {
      req.params.orderId = orderId.toString();

      req.body = {
        productId: productId.toString(),
        status: "Shipped",
      };

      const productFindOneStub = sinon
        .stub(Product, "findOne")
        .resolves({
          _id: productId,
          createdBy: dealerId,
          isDeleted: false,
        } as any);

      const item: any = {
        productId: productId,
        dealerId: dealerId,
        status: "Confirmed",
      };

      const orderObject = {
        _id: orderId,
        items: [
          {
            productId: productId,
            dealerId: dealerId,
            status: "Shipped",
          },
        ],
        shippingAddress: {
          addressLine1: "Main Road",
          city: "Bengaluru",
        },
      };

      const order: any = {
        items: [item],

        save: sinon.stub().resolves(),

        toObject: sinon.stub().returns(orderObject),
      };

      const populateStub = sinon
        .stub()
        .resolves(order);

      const orderFindOneStub = sinon
        .stub(Order, "findOne")
        .returns({
          populate: populateStub,
        } as any);

      await dealerController.updateDealerOrderStatus(
        req,
        res,
      );

      expect(productFindOneStub.calledOnce).to.equal(true);
      expect(orderFindOneStub.calledOnce).to.equal(true);
      expect(populateStub.calledOnce).to.equal(true);

      expect(item.status).to.equal("Shipped");
      expect(order.save.calledOnce).to.equal(true);
      expect(order.toObject.calledOnce).to.equal(true);

      const orderFindArgs: any =
        orderFindOneStub.firstCall.args[0];

      expect(orderFindArgs._id).to.equal(
        orderId.toString(),
      );

      expect(orderFindArgs["items.productId"]).to.equal(
        productId.toString(),
      );

      expect(orderFindArgs["items.dealerId"]).to.equal(
        dealerId,
      );

      expect(res.json.calledOnce).to.equal(true);

      const response: any = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Product order status updated successfully",
      );

      expect(response.data.items).to.have.length(1);
    });

    it("should return internal server error when updating order status fails", async () => {
      req.params.orderId = orderId.toString();

      req.body = {
        productId: productId.toString(),
        status: "Confirmed",
      };

      const productFindOneStub = sinon
        .stub(Product, "findOne")
        .rejects(new Error("Database error"));

      await dealerController.updateDealerOrderStatus(
        req,
        res,
      );

      expect(productFindOneStub.calledOnce).to.equal(true);

      expect(res.json.calledOnce).to.equal(true);

      const response: any = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Failed to update order status",
      );
    });
  });
});