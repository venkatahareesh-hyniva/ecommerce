import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";

import * as addressController from "../../src/controller/addressController.js";
import Address from "../../src/model/addressModel.js";
import User from "../../src/model/userModel.js";

describe("Address Controller", () => {
  let req: any;
  let res: any;

  const userId = new mongoose.Types.ObjectId();
  const mongoAddressId = new mongoose.Types.ObjectId();

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

  // ============================================================
  // createAddress()
  // ============================================================

  describe("createAddress()", () => {
    it("should return bad request when user information is missing", async () => {
      req.user = {};

      await addressController.createAddress(req, res);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "User information is missing",
      );
    });

    it("should create address successfully when no previous address exists", async () => {
      req.body = {
        addressLine1: "123 Main Street",
        addressLine2: "Apartment 101",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001",
        country: "India",
      };

      const newAddress: any = {
        _id: mongoAddressId,
        addressId: 1,
        userId,
        addressLine1: "123 Main Street",
        addressLine2: "Apartment 101",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001",
        country: "India",
      };

      const sortStub = sinon.stub().resolves(null);

      const findOneStub = sinon
        .stub(Address, "findOne")
        .returns({
          sort: sortStub,
        } as any);

      const createStub = sinon
        .stub(Address, "create")
        .resolves(newAddress);

      const updateUserStub = sinon
        .stub(User, "findByIdAndUpdate")
        .resolves({});

      await addressController.createAddress(req, res);

      expect(findOneStub.calledOnce).to.equal(true);
      expect(sortStub.calledOnce).to.equal(true);
      expect(createStub.calledOnce).to.equal(true);
      expect(updateUserStub.calledOnce).to.equal(true);

      const createArgs = createStub.firstCall.args[0] as any;

      expect(createArgs.addressId).to.equal(1);
      expect(createArgs.userId).to.equal(userId);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Address created successfully",
      );
    });

    it("should create address with next addressId when previous address exists", async () => {
      req.body = {
        addressLine1: "456 Park Road",
        addressLine2: "Flat 202",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500001",
        country: "India",
      };

      const lastAddress: any = {
        addressId: 3,
      };

      const newAddress: any = {
        _id: mongoAddressId,
        addressId: 4,
        userId,
      };

      const sortStub = sinon.stub().resolves(lastAddress);

      const findOneStub = sinon
        .stub(Address, "findOne")
        .returns({
          sort: sortStub,
        } as any);

      const createStub = sinon
        .stub(Address, "create")
        .resolves(newAddress);

      const updateUserStub = sinon
        .stub(User, "findByIdAndUpdate")
        .resolves({});

      await addressController.createAddress(req, res);

      expect(findOneStub.calledOnce).to.equal(true);
      expect(sortStub.calledOnce).to.equal(true);
      expect(createStub.calledOnce).to.equal(true);
      expect(updateUserStub.calledOnce).to.equal(true);

      const createArgs = createStub.firstCall.args[0] as any;

      expect(createArgs.addressId).to.equal(4);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Address created successfully",
      );
    });

    it("should return internal server error when createAddress fails", async () => {
      req.body = {
        addressLine1: "123 Main Street",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001",
        country: "India",
      };

      const sortStub = sinon
        .stub()
        .rejects(new Error("Database error"));

      sinon.stub(Address, "findOne").returns({
        sort: sortStub,
      } as any);

      await addressController.createAddress(req, res);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Failed to create address",
      );
    });
  });

  // ============================================================
  // updateAddress()
  // ============================================================

  describe("updateAddress()", () => {
    it("should return bad request when user information is missing", async () => {
      req.user = {};
      req.params.addressId = "1";

      await addressController.updateAddress(req, res);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "User information is missing",
      );
    });

    it("should return bad request when address ID is missing", async () => {
      req.params = {};

      await addressController.updateAddress(req, res);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Address ID is required",
      );
    });

    it("should update address successfully", async () => {
      req.params.addressId = "1";

      req.body = {
        addressLine1: "Updated Street",
        addressLine2: "Updated Apartment",
        city: "Bengaluru",
        state: "Karnataka",
        country: "India",
        pincode: "560002",
      };

      const updatedAddress: any = {
        addressId: 1,
        addressLine1: "Updated Street",
        city: "Bengaluru",
      };

      const selectStub = sinon
        .stub()
        .resolves(updatedAddress);

      const findOneAndUpdateStub = sinon
        .stub(Address, "findOneAndUpdate")
        .returns({
          select: selectStub,
        } as any);

      await addressController.updateAddress(req, res);

      expect(findOneAndUpdateStub.calledOnce).to.equal(true);
      expect(selectStub.calledOnce).to.equal(true);

      const query = findOneAndUpdateStub.firstCall.args[0] as any;

      expect(query.addressId).to.equal("1");
      expect(query.userId).to.equal(userId);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Address updated successfully",
      );
    });

    it("should return not found when address does not exist", async () => {
      req.params.addressId = "1";

      const selectStub = sinon.stub().resolves(null);

      sinon.stub(Address, "findOneAndUpdate").returns({
        select: selectStub,
      } as any);

      await addressController.updateAddress(req, res);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Address not found",
      );
    });

    it("should return internal server error when update fails", async () => {
      req.params.addressId = "1";

      const selectStub = sinon
        .stub()
        .rejects(new Error("Database error"));

      sinon.stub(Address, "findOneAndUpdate").returns({
        select: selectStub,
      } as any);

      await addressController.updateAddress(req, res);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Failed to update address",
      );
    });
  });

  // ============================================================
  // getAddresses()
  // ============================================================

  describe("getAddresses()", () => {
    it("should get all addresses successfully", async () => {
      const addresses: any[] = [
        {
          addressId: 1,
          addressLine1: "Street 1",
          city: "Bengaluru",
        },
        {
          addressId: 2,
          addressLine1: "Street 2",
          city: "Hyderabad",
        },
      ];

      const selectStub = sinon
        .stub()
        .resolves(addresses);

      const findStub = sinon
        .stub(Address, "find")
        .returns({
          select: selectStub,
        } as any);

      await addressController.getAddresses(req, res);

      expect(findStub.calledOnce).to.equal(true);
      expect(selectStub.calledOnce).to.equal(true);

      const query = findStub.firstCall.args[0] as any;

      expect(query.userId).to.equal(userId);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Addresses found successfully",
      );

      expect(response.data).to.deep.equal(addresses);
    });

    it("should return internal server error when getAddresses fails", async () => {
      const selectStub = sinon
        .stub()
        .rejects(new Error("Database error"));

      sinon.stub(Address, "find").returns({
        select: selectStub,
      } as any);

      await addressController.getAddresses(req, res);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Failed to get addresses",
      );
    });
  });

  // ============================================================
  // getAddressById()
  // ============================================================

  describe("getAddressById()", () => {
    it("should return bad request for invalid address ID", async () => {
      req.params.addressId = "abc";

      await addressController.getAddressById(req, res);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Invalid address ID",
      );
    });

    it("should return bad request for zero address ID", async () => {
      req.params.addressId = "0";

      await addressController.getAddressById(req, res);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Invalid address ID",
      );
    });

    it("should return bad request for negative address ID", async () => {
      req.params.addressId = "-1";

      await addressController.getAddressById(req, res);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Invalid address ID",
      );
    });

    it("should get address by ID successfully", async () => {
      req.params.addressId = "1";

      const address: any = {
        addressId: 1,
        addressLine1: "123 Main Street",
        city: "Bengaluru",
        state: "Karnataka",
      };

      const selectStub = sinon
        .stub()
        .resolves(address);

      const findOneStub = sinon
        .stub(Address, "findOne")
        .returns({
          select: selectStub,
        } as any);

      await addressController.getAddressById(req, res);

      expect(findOneStub.calledOnce).to.equal(true);
      expect(selectStub.calledOnce).to.equal(true);

      const query = findOneStub.firstCall.args[0] as any;

      expect(query.addressId).to.equal(1);
      expect(query.userId).to.equal(userId);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Address found successfully",
      );

      expect(response.data).to.deep.equal(address);
    });

    it("should return not found when address does not exist", async () => {
      req.params.addressId = "1";

      const selectStub = sinon.stub().resolves(null);

      sinon.stub(Address, "findOne").returns({
        select: selectStub,
      } as any);

      await addressController.getAddressById(req, res);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Address not found",
      );
    });

    it("should return internal server error when getAddressById fails", async () => {
      req.params.addressId = "1";

      const selectStub = sinon
        .stub()
        .rejects(new Error("Database error"));

      sinon.stub(Address, "findOne").returns({
        select: selectStub,
      } as any);

      await addressController.getAddressById(req, res);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Failed to get address",
      );
    });
  });

  // ============================================================
  // deleteAddress()
  // ============================================================

  describe("deleteAddress()", () => {
    it("should return bad request for invalid address ID", async () => {
      req.params.addressId = "abc";

      await addressController.deleteAddress(req, res);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Invalid address ID",
      );
    });

    it("should return bad request for zero address ID", async () => {
      req.params.addressId = "0";

      await addressController.deleteAddress(req, res);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Invalid address ID",
      );
    });

    it("should delete address successfully", async () => {
      req.params.addressId = "1";

      const deletedAddress: any = {
        addressId: 1,
        userId,
      };

      const deleteStub = sinon
        .stub(Address, "findOneAndDelete")
        .resolves(deletedAddress);

      await addressController.deleteAddress(req, res);

      expect(deleteStub.calledOnce).to.equal(true);

      const query = deleteStub.firstCall.args[0] as any;

      expect(query.addressId).to.equal(1);
      expect(query.userId).to.equal(userId);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Address deleted successfully",
      );
    });

    it("should return not found when address does not exist", async () => {
      req.params.addressId = "1";

      const deleteStub = sinon
        .stub(Address, "findOneAndDelete")
        .resolves(null);

      await addressController.deleteAddress(req, res);

      expect(deleteStub.calledOnce).to.equal(true);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Address not found",
      );
    });

    it("should return internal server error when delete fails", async () => {
      req.params.addressId = "1";

      sinon
        .stub(Address, "findOneAndDelete")
        .rejects(new Error("Database error"));

      await addressController.deleteAddress(req, res);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal(
        "Failed to delete address",
      );
    });
  });
});