import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";

import * as authController from "../../src/controller/authController.js";
import User from "../../src/model/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("Auth Controller", () => {
  let req: any;
  let res: any;

  const userId = new mongoose.Types.ObjectId();

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

  describe("register()", () => {
    it("should return bad request when validation fails", async () => {
      req.body = {};

      await authController.register(req, res);
      expect(res.json.calledOnce).to.equal(true);
      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("All fields are required");
    });

    it("should return bad request when user already exists", async () => {
      req.body = {
        firstName: "Hareesh",
        lastName: "Jagarlamudi",
        email: "hareesh@gmail.com",
        countryCode: "+91",
        phoneNumber: "9876543210",
        password: "Password@123",
        role: "user",
      };

      const existingUser: any = {
        _id: userId,
        email: "hareesh@gmail.com",
      };

      const findOneStub = sinon.stub(User, "findOne").resolves(existingUser);

      await authController.register(req, res);

      expect(findOneStub.calledOnce).to.equal(true);
      expect(res.json.calledOnce).to.equal(true);
      const response: any = res.json.firstCall.args[0];

      expect(response.message).to.equal("User already exists");
    });

    it("should register user successfully", async () => {
      req.body = {
        firstName: "Hareesh",
        middleName: "K",
        lastName: "Jagarlamudi",
        email: "hareesh@gmail.com",
        countryCode: "+91",
        phoneNumber: "9876543210",
        password: "Password@123",
        address: {
          street: "Main Road",
          city: "Bengaluru",
          state: "Karnataka",
          country: "India",
          pincode: "560001",
        },
        role: "user",
      };

      const findOneStub = sinon.stub(User, "findOne");

      findOneStub.onFirstCall().resolves(null);

      const sortStub = sinon.stub().resolves({
        userId: 5,
      });

      findOneStub.onSecondCall().returns({
        sort: sortStub,
      } as any);

      const hashStub = sinon.stub(bcrypt, "hash") as any;
      hashStub.resolves("hashedPassword");
      const createStub = sinon.stub(User, "create").resolves({
        _id: userId,
        userId: 6,
      } as any);

      await authController.register(req, res);

      expect(findOneStub.calledTwice).to.equal(true);
      expect(sortStub.calledOnce).to.equal(true);
      expect(hashStub.calledOnce).to.equal(true);
      expect(createStub.calledOnce).to.equal(true);

      const createArgs: any = createStub.firstCall.args[0];

      expect(createArgs.userId).to.equal(6);
      expect(createArgs.firstName).to.equal("Hareesh");
      expect(createArgs.lastName).to.equal("Jagarlamudi");
      expect(createArgs.email).to.equal("hareesh@gmail.com");
      expect(createArgs.countryCode).to.equal("+91");
      expect(createArgs.phoneNumber).to.equal("9876543210");
      expect(createArgs.password).to.equal("hashedPassword");
      expect(createArgs.role).to.equal("user");
      expect(createArgs.status).to.equal("active");

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("user created successfully");
    });

    it("should register dealer with pending status", async () => {
      req.body = {
        firstName: "Dealer",
        lastName: "Test",
        email: "dealer@gmail.com",
        countryCode: "+91",
        phoneNumber: "9876543211",
        password: "Password@123",
        role: "dealer",
      };

      const findOneStub = sinon.stub(User, "findOne");

      findOneStub.onFirstCall().resolves(null);

      const sortStub = sinon.stub().resolves({
        userId: 10,
      });

      findOneStub.onSecondCall().returns({
        sort: sortStub,
      } as any);

      const hashStub = sinon.stub(bcrypt, "hash") as any;
      hashStub.resolves("hashedPassword");
      const createStub = sinon.stub(User, "create").resolves({
        _id: userId,
        userId: 11,
      } as any);

      await authController.register(req, res);

      expect(findOneStub.calledTwice).to.equal(true);
      expect(sortStub.calledOnce).to.equal(true);
      expect(hashStub.calledOnce).to.equal(true);
      expect(createStub.calledOnce).to.equal(true);

      const createArgs: any = createStub.firstCall.args[0];

      expect(createArgs.userId).to.equal(11);
      expect(createArgs.firstName).to.equal("Dealer");
      expect(createArgs.email).to.equal("dealer@gmail.com");
      expect(createArgs.role).to.equal("dealer");
      expect(createArgs.status).to.equal("pending");

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("dealer created successfully");
    });

    it("should return internal server error when register fails", async () => {
      req.body = {
        firstName: "Hareesh",
        lastName: "Jagarlamudi",
        email: "hareesh@gmail.com",
        countryCode: "+91",
        phoneNumber: "9876543210",
        password: "Password@123",
        role: "user",
      };

      const findOneStub = sinon
        .stub(User, "findOne")
        .rejects(new Error("Database error"));

      await authController.register(req, res);
      expect(findOneStub.calledOnce).to.equal(true);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Failed to create account");
    });
  });

  describe("Login()", () => {
    it("should return bad request when login validation fails", async () => {
      req.body = {};

      await authController.Login(req, res);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Email and Password are required");
    });

    it("should return not found when user does not exist", async () => {
      req.body = {
        email: "test@gmail.com",
        password: "Password@123",
      };

      const findOneStub = sinon.stub(User, "findOne").resolves(null);

      await authController.Login(req, res);

      expect(findOneStub.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("User not found");
    });

    it("should return unauthorized when password is incorrect", async () => {
      req.body = {
        email: "test@gmail.com",
        password: "WrongPassword",
      };

      const user: any = {
        _id: userId,
        email: "test@gmail.com",
        password: "hashedPassword",
        role: "user",
        userId: 1,
        status: "active",
        tokenVersion: 0,
      };

      const findOneStub = sinon.stub(User, "findOne").resolves(user);

      const compareStub = sinon.stub(bcrypt, "compare").resolves(false);

      await authController.Login(req, res);

      expect(findOneStub.calledOnce).to.equal(true);
      expect(compareStub.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Invalid Password");
    });

    it("should return forbidden when user account is inactive", async () => {
      req.body = {
        email: "test@gmail.com",
        password: "Password@123",
      };

      const user: any = {
        _id: userId,
        email: "test@gmail.com",
        password: "hashedPassword",
        role: "user",
        userId: 1,
        status: "inactive",
        tokenVersion: 0,
      };

      sinon.stub(User, "findOne").resolves(user);

      sinon.stub(bcrypt, "compare").resolves(true);

      await authController.Login(req, res);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("User account status is inactive");
    });

    it("should login successfully", async () => {
      req.body = {
        email: "test@gmail.com",
        password: "Password@123",
      };

      const user: any = {
        _id: userId,
        email: "test@gmail.com",
        password: "hashedPassword",
        role: "user",
        userId: 1,
        status: "active",
        tokenVersion: 0,
      };

      const findOneStub = sinon.stub(User, "findOne").resolves(user);

      const compareStub = sinon.stub(bcrypt, "compare").resolves(true);

      const signStub = sinon.stub(jwt, "sign") as any;
      signStub.returns("test-jwt-token");

      await authController.Login(req, res);

      expect(findOneStub.calledOnce).to.equal(true);
      expect(compareStub.calledOnce).to.equal(true);
      expect(signStub.calledOnce).to.equal(true);

      const signArgs: any = signStub.firstCall.args;

      expect(signArgs[0].Id).to.equal(user._id);
      expect(signArgs[0].role).to.equal("user");
      expect(signArgs[0].userId).to.equal(1);
      expect(signArgs[0].tokenVersion).to.equal(0);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Login successful");

      expect(response.data.token).to.equal("test-jwt-token");
    });

    it("should return internal server error when login fails", async () => {
      req.body = {
        email: "test@gmail.com",
        password: "Password@123",
      };

      sinon.stub(User, "findOne").rejects(new Error("Database error"));

      await authController.Login(req, res);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Failed to login");
    });
  });

  describe("logout()", () => {
    it("should logout successfully", async () => {
      const updateStub = sinon.stub(User, "findByIdAndUpdate").resolves({
        _id: userId,
        tokenVersion: 1,
      } as any);

      await authController.logout(req, res);

      expect(updateStub.calledOnce).to.equal(true);

      const userIdArg = updateStub.firstCall.args[0];

      expect(userIdArg).to.equal(userId);

      const updateArgs: any = updateStub.firstCall.args[1];

      expect(updateArgs.$inc.tokenVersion).to.equal(1);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Logout successful");
    });

    it("should return internal server error when logout fails", async () => {
      sinon
        .stub(User, "findByIdAndUpdate")
        .rejects(new Error("Database error"));

      await authController.logout(req, res);

      expect(res.json.calledOnce).to.equal(true);

      const response = res.json.firstCall.args[0];

      expect(response.message).to.equal("Failed to logout");
    });
  });
});
