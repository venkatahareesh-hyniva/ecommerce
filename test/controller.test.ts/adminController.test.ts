import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";

import * as adminController from "../../src/controller/adminController.js";
import User from "../../src/model/userModel.js";
import Product from "../../src/model/productModel.js";
import { USER_STATUS } from "../../src/config/config.js";
// import * as validationUtils from "../../src/utils/validation-utils.js";

describe("Admin Controller", () => {
  let req: any;
  let res: any;

  const dealerId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      query: {},
      user: {
        role: "admin",
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

  // =========================================================
  // approveDealer()
  // =========================================================

  describe("approveDealer()", () => {
    it("should approve dealer successfully", async () => {
      req.params.dealerId = dealerId.toString();

      const dealer: any = {
        _id: dealerId,
        role: "dealer",
        status: USER_STATUS.PENDING,
        rejectionReason: "Old reason",
        save: sinon.stub().resolves(),
      };

      const selectStub = sinon.stub().resolves(dealer);

      sinon.stub(User, "findOne").returns({
        select: selectStub,
      } as any);

      await adminController.approveDealer(req, res);

      expect(dealer.status).to.equal(USER_STATUS.ACTIVE);
      expect(dealer.rejectionReason).to.equal(null);
      expect(dealer.save.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Dealer approved successfully",
      );
    });

    it("should return not found when dealer does not exist", async () => {
      req.params.dealerId = dealerId.toString();

      const selectStub = sinon.stub().resolves(null);

      sinon.stub(User, "findOne").returns({
        select: selectStub,
      } as any);

      await adminController.approveDealer(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Dealer not found");
    });

    it("should return bad request when dealer is already active", async () => {
      req.params.dealerId = dealerId.toString();

      const dealer: any = {
        status: USER_STATUS.ACTIVE,
      };

      const selectStub = sinon.stub().resolves(dealer);

      sinon.stub(User, "findOne").returns({
        select: selectStub,
      } as any);

      await adminController.approveDealer(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Dealer is already active",
      );
    });

    it("should return bad request when dealer status is not pending", async () => {
      req.params.dealerId = dealerId.toString();

      const dealer: any = {
        status: USER_STATUS.REJECTED,
      };

      const selectStub = sinon.stub().resolves(dealer);

      sinon.stub(User, "findOne").returns({
        select: selectStub,
      } as any);

      await adminController.approveDealer(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        `Dealer cannot be approved because status is ${USER_STATUS.REJECTED}`,
      );
    });

    it("should handle database error", async () => {
      req.params.dealerId = dealerId.toString();

      const selectStub = sinon
        .stub()
        .rejects(new Error("Database error"));

      sinon.stub(User, "findOne").returns({
        select: selectStub,
      } as any);

      await adminController.approveDealer(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Failed to approve dealer",
      );
    });
  });

  // =========================================================
  // rejectDealer()
  // =========================================================

  describe("rejectDealer()", () => {
    it("should reject dealer successfully", async () => {
      req.params.dealerId = dealerId.toString();

      req.body = {
        rejectionReason: "  Documents are incomplete  ",
      };

      const dealer: any = {
        status: USER_STATUS.PENDING,
        rejectionReason: null,
        save: sinon.stub().resolves(),
      };

      const selectStub = sinon.stub().resolves(dealer);

      sinon.stub(User, "findOne").returns({
        select: selectStub,
      } as any);

      await adminController.rejectDealer(req, res);

      expect(dealer.status).to.equal(USER_STATUS.REJECTED);
      expect(dealer.rejectionReason).to.equal(
        "Documents are incomplete",
      );
      expect(dealer.save.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Dealer rejected successfully",
      );
    });

    it("should return forbidden when logged in user is not admin", async () => {
      req.user.role = "user";

      req.params.dealerId = dealerId.toString();

      req.body = {
        rejectionReason: "Invalid documents",
      };

      await adminController.rejectDealer(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Only admin can reject dealer",
      );
    });

    it("should return bad request when rejection reason is missing", async () => {
      req.params.dealerId = dealerId.toString();

      req.body = {};

      await adminController.rejectDealer(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Rejection reason is required",
      );
    });

    it("should return bad request when rejection reason is empty", async () => {
      req.params.dealerId = dealerId.toString();

      req.body = {
        rejectionReason: "   ",
      };

      await adminController.rejectDealer(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Rejection reason is required",
      );
    });

    it("should return not found when dealer does not exist", async () => {
      req.params.dealerId = dealerId.toString();

      req.body = {
        rejectionReason: "Invalid documents",
      };

      const selectStub = sinon.stub().resolves(null);

      sinon.stub(User, "findOne").returns({
        select: selectStub,
      } as any);

      await adminController.rejectDealer(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Dealer not found");
    });

    it("should return bad request when dealer is not pending", async () => {
      req.params.dealerId = dealerId.toString();

      req.body = {
        rejectionReason: "Invalid documents",
      };

      const dealer: any = {
        status: USER_STATUS.ACTIVE,
      };

      const selectStub = sinon.stub().resolves(dealer);

      sinon.stub(User, "findOne").returns({
        select: selectStub,
      } as any);

      await adminController.rejectDealer(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        `Dealer cannot be rejected because status is ${USER_STATUS.ACTIVE}`,
      );
    });

    it("should handle database error", async () => {
      req.params.dealerId = dealerId.toString();

      req.body = {
        rejectionReason: "Invalid documents",
      };

      const selectStub = sinon
        .stub()
        .rejects(new Error("Database error"));

      sinon.stub(User, "findOne").returns({
        select: selectStub,
      } as any);

      await adminController.rejectDealer(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Failed to reject dealer",
      );
    });
  });

  // =========================================================
  // deactivateDealer()
  // =========================================================

  describe("deactivateDealer()", () => {
    it("should return bad request for invalid dealer ID", async () => {
      req.params.dealerId = "invalid-id";

    //   sinon
    //     .stub(validationUtils, "isValidObjectId")
    //     .returns(false);

      await adminController.deactivateDealer(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Invalid dealer ID",
      );
    });

    it("should deactivate dealer successfully", async () => {
      req.params.dealerId = dealerId.toString();

    //   sinon
    //     .stub(validationUtils, "isValidObjectId")
    //     .returns(true);

      const dealer: any = {
        status: USER_STATUS.ACTIVE,
        save: sinon.stub().resolves(),
      };

      const selectStub = sinon.stub().resolves(dealer);

      sinon.stub(User, "findOne").returns({
        select: selectStub,
      } as any);

      await adminController.deactivateDealer(req, res);

      expect(dealer.status).to.equal(
        USER_STATUS.INACTIVE,
      );

      expect(dealer.save.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Dealer deactivated successfully",
      );
    });

    it("should return not found when dealer does not exist", async () => {
      req.params.dealerId = dealerId.toString();

    //   sinon
    //     .stub(validationUtils, "isValidObjectId")
    //     .returns(true);

      const selectStub = sinon.stub().resolves(null);

      sinon.stub(User, "findOne").returns({
        select: selectStub,
      } as any);

      await adminController.deactivateDealer(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Dealer not found",
      );
    });

    it("should return bad request when dealer is not active", async () => {
      req.params.dealerId = dealerId.toString();

    //   sinon
    //     .stub(validationUtils, "isValidObjectId")
    //     .returns(true);

      const dealer: any = {
        status: USER_STATUS.PENDING,
      };

      const selectStub = sinon.stub().resolves(dealer);

      sinon.stub(User, "findOne").returns({
        select: selectStub,
      } as any);

      await adminController.deactivateDealer(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        `Dealer cannot be deactivated because status is ${USER_STATUS.PENDING}`,
      );
    });

    it("should handle database error", async () => {
      req.params.dealerId = dealerId.toString();

    //   sinon
    //     .stub(validationUtils, "isValidObjectId")
    //     .returns(true);

      const selectStub = sinon
        .stub()
        .rejects(new Error("Database error"));

      sinon.stub(User, "findOne").returns({
        select: selectStub,
      } as any);

      await adminController.deactivateDealer(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Failed to deactivate dealer",
      );
    });
  });

  // =========================================================
  // activateDealer()
  // =========================================================

  describe("activateDealer()", () => {
    it("should return bad request for invalid dealer ID", async () => {
      req.params.dealerId = "invalid-id";

    //   sinon
    //     .stub(validationUtils, "isValidObjectId")
    //     .returns(false);

      await adminController.activateDealer(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Invalid dealer ID",
      );
    });

    it("should activate dealer successfully", async () => {
      req.params.dealerId = dealerId.toString();

    //   sinon
    //     .stub(validationUtils, "isValidObjectId")
    //     .returns(true);

      const dealer: any = {
        status: USER_STATUS.INACTIVE,
        save: sinon.stub().resolves(),
      };

      const selectStub = sinon.stub().resolves(dealer);

      sinon.stub(User, "findOne").returns({
        select: selectStub,
      } as any);

      await adminController.activateDealer(req, res);

      expect(dealer.status).to.equal(
        USER_STATUS.ACTIVE,
      );

      expect(dealer.save.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Dealer activated successfully",
      );
    });

    it("should return not found when dealer does not exist", async () => {
      req.params.dealerId = dealerId.toString();

    //   sinon
    //     .stub(validationUtils, "isValidObjectId")
    //     .returns(true);

      const selectStub = sinon.stub().resolves(null);

      sinon.stub(User, "findOne").returns({
        select: selectStub,
      } as any);

      await adminController.activateDealer(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Dealer not found",
      );
    });

    it("should return bad request when dealer is not inactive", async () => {
      req.params.dealerId = dealerId.toString();

    //   sinon
    //     .stub(validationUtils, "isValidObjectId")
    //     .returns(true);

      const dealer: any = {
        status: USER_STATUS.ACTIVE,
      };

      const selectStub = sinon.stub().resolves(dealer);

      sinon.stub(User, "findOne").returns({
        select: selectStub,
      } as any);

      await adminController.activateDealer(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        `Dealer cannot be activated because status is ${USER_STATUS.ACTIVE}`,
      );
    });

    it("should handle database error", async () => {
      req.params.dealerId = dealerId.toString();

    //   sinon
    //     .stub(validationUtils, "isValidObjectId")
    //     .returns(true);

      const selectStub = sinon
        .stub()
        .rejects(new Error("Database error"));

      sinon.stub(User, "findOne").returns({
        select: selectStub,
      } as any);

      await adminController.activateDealer(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Failed to activate dealer",
      );
    });
  });

  // =========================================================
  // getUsers()
  // =========================================================

  describe("getUsers()", () => {
    it("should get all users successfully", async () => {
      req.query = {};

      const user1: any = {
        toObject: sinon.stub().returns({
          _id: new mongoose.Types.ObjectId(),
          firstName: "Hareesh",
          role: "user",
          rejectionReason: "Should be removed",
        }),
      };

      const user2: any = {
        toObject: sinon.stub().returns({
          _id: dealerId,
          firstName: "Dealer",
          role: "dealer",
          rejectionReason: "Invalid documents",
        }),
      };

      const users = [user1, user2];

      const selectStub = sinon.stub().resolves(users);

      sinon.stub(User, "find").returns({
        select: selectStub,
      } as any);

      await adminController.getUsers(req, res);

      expect(selectStub.calledOnce).to.equal(true);

      const findArgs = (User.find as any).firstCall.args[0];

      expect(findArgs).to.deep.equal({});

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Users fetched successfully",
      );

      expect(response.data).to.have.length(2);

      expect(
        response.data[0].rejectionReason,
      ).to.equal(undefined);

      expect(
        response.data[1].rejectionReason,
      ).to.equal("Invalid documents");
    });

    it("should filter users by role", async () => {
      req.query = {
        role: "dealer",
      };

      const user: any = {
        toObject: sinon.stub().returns({
          firstName: "Dealer",
          role: "dealer",
        }),
      };

      const selectStub = sinon.stub().resolves([user]);

      sinon.stub(User, "find").returns({
        select: selectStub,
      } as any);

      await adminController.getUsers(req, res);

      const findArgs = (User.find as any).firstCall.args[0];

      expect(findArgs).to.deep.equal({
        role: "dealer",
      });
    });

    it("should filter users by status", async () => {
      req.query = {
        status: USER_STATUS.ACTIVE,
      };

      const user: any = {
        toObject: sinon.stub().returns({
          firstName: "Hareesh",
          role: "user",
        }),
      };

      const selectStub = sinon.stub().resolves([user]);

      sinon.stub(User, "find").returns({
        select: selectStub,
      } as any);

      await adminController.getUsers(req, res);

      const findArgs = (User.find as any).firstCall.args[0];

      expect(findArgs).to.deep.equal({
        status: USER_STATUS.ACTIVE,
      });
    });

    it("should filter users by role and status", async () => {
      req.query = {
        role: "dealer",
        status: USER_STATUS.PENDING,
      };

      const user: any = {
        toObject: sinon.stub().returns({
          firstName: "Dealer",
          role: "dealer",
        }),
      };

      const selectStub = sinon.stub().resolves([user]);

      sinon.stub(User, "find").returns({
        select: selectStub,
      } as any);

      await adminController.getUsers(req, res);

      const findArgs = (User.find as any).firstCall.args[0];

      expect(findArgs).to.deep.equal({
        role: "dealer",
        status: USER_STATUS.PENDING,
      });
    });

    it("should handle database error", async () => {
      const selectStub = sinon
        .stub()
        .rejects(new Error("Database error"));

      sinon.stub(User, "find").returns({
        select: selectStub,
      } as any);

      await adminController.getUsers(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Failed to fetch users",
      );
    });
  });

  // =========================================================
  // getAllProductsForAdmin()
  // =========================================================

  describe("getAllProductsForAdmin()", () => {
    it("should get all products successfully", async () => {
      const product1: any = {
        _id: productId,
        productName: "iPhone 15",
        price: 70000,
      };

      const product2Id = new mongoose.Types.ObjectId();

      const product2: any = {
        _id: product2Id,
        productName: "Samsung S24",
        price: 65000,
      };

      const products = [product1, product2];

      const leanStub = sinon.stub().resolves(products);

      const sortStub = sinon.stub().returns({
        lean: leanStub,
      });

      const populateUpdatedByStub = sinon.stub().returns({
        sort: sortStub,
      });

      const populateCreatedByStub = sinon.stub().returns({
        populate: populateUpdatedByStub,
      });

      const populateCategoryStub = sinon.stub().returns({
        populate: populateCreatedByStub,
      });

      sinon.stub(Product, "find").returns({
        populate: populateCategoryStub,
      } as any);

      await adminController.getAllProductsForAdmin(req, res);

      expect(leanStub.calledOnce).to.equal(true);

      expect(product1.productId).to.equal(productId);
      expect(product1._id).to.equal(undefined);

      expect(product2.productId).to.equal(product2Id);
      expect(product2._id).to.equal(undefined);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Products fetched successfully",
      );

      expect(response.data).to.have.length(2);
    });

    it("should handle database error", async () => {
      sinon.stub(Product, "find").throws(
        new Error("Database error"),
      );

      await adminController.getAllProductsForAdmin(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Failed to fetch products",
      );
    });
  });

  // =========================================================
  // getProductByIdForAdmin()
  // =========================================================

  describe("getProductByIdForAdmin()", () => {
    it("should get product by id successfully", async () => {
      req.params.productId = productId.toString();

      const product: any = {
        _id: productId,
        productName: "iPhone 15",
        price: 70000,
        categoryId: {
          categoryName: "Mobiles",
        },
        toObject: sinon.stub().returns({
          _id: productId,
          productName: "iPhone 15",
          price: 70000,
        }),
      };

      const populateUpdatedByStub = sinon.stub().resolves(product);

      const populateCreatedByStub = sinon.stub().returns({
        populate: populateUpdatedByStub,
      });

      const populateCategoryStub = sinon.stub().returns({
        populate: populateCreatedByStub,
      });

      sinon.stub(Product, "findOne").returns({
        populate: populateCategoryStub,
      } as any);

      await adminController.getProductByIdForAdmin(req, res);

      const findArgs = (Product.findOne as any).firstCall.args[0];

      expect(findArgs).to.deep.equal({
        _id: productId.toString(),
        isDeleted: false,
      });

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Product fetched successfully",
      );

      expect(response.data._id).to.equal(undefined);

      expect(response.data.productName).to.equal(
        "iPhone 15",
      );
    });

    it("should return not found when product does not exist", async () => {
      req.params.productId = productId.toString();

      const populateUpdatedByStub = sinon.stub().resolves(null);

      const populateCreatedByStub = sinon.stub().returns({
        populate: populateUpdatedByStub,
      });

      const populateCategoryStub = sinon.stub().returns({
        populate: populateCreatedByStub,
      });

      sinon.stub(Product, "findOne").returns({
        populate: populateCategoryStub,
      } as any);

      await adminController.getProductByIdForAdmin(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Product not found",
      );
    });

    it("should handle database error", async () => {
      req.params.productId = productId.toString();

      sinon.stub(Product, "findOne").throws(
        new Error("Database error"),
      );

      await adminController.getProductByIdForAdmin(req, res);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Failed to fetch product",
      );
    });
  });
});