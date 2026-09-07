import { expect } from "chai";
import jwt from "jsonwebtoken";
import sinon from "sinon";

import { authMiddleware } from "../src/middleware/authmiddleware.js";
import User from "../src/model/userModel.js";

import {
  createMockRequest,
  createMockResponse,
  createMockNext,
} from "./helpers.test.js";

describe("Auth Middleware", () => {
  const JWT_SECRET = "test-secret";

  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should reject request when authorization header is missing", async () => {
    const req = createMockRequest();

    const res = createMockResponse();

    const { next } = createMockNext();

    await authMiddleware(
      req as any,
      res as any,
      next,
    );

    expect(res.statusCode).to.equal(401);

    expect(res.body.message).to.equal(
      "Authentication token is required",
    );
  });

  it("should reject request when Bearer is missing", async () => {
    const req = createMockRequest();

    req.headers = {
      authorization: "invalid-token",
    };

    const res = createMockResponse();

    const { next } = createMockNext();

    await authMiddleware(
      req as any,
      res as any,
      next,
    );

    expect(res.statusCode).to.equal(401);

    expect(res.body.message).to.equal(
      "Bearer token is required",
    );
  });

    it("should reject invalid JWT", async () => {
    const req = createMockRequest();

    req.headers = {
      authorization: "Bearer invalid-token",
    };

    const res = createMockResponse();

    const { next } = createMockNext();

    await authMiddleware(
      req as any,
      res as any,
      next,
    );

    expect(res.statusCode).to.equal(401);

    expect(res.body.message).to.equal(
      "Invalid or expired token",
    );
  });

  it("should reject when user is not found", async () => {
    const token = jwt.sign(
      {
        Id: "507f1f77bcf86cd799439011",
        role: "user",
        userId: 1,
        tokenVersion: 0,
      },
      JWT_SECRET,
    );

    const req = createMockRequest();

    req.headers = {
      authorization: `Bearer ${token}`,
    };

    const res = createMockResponse();

    const { next } = createMockNext();

    const selectStub = sinon.stub().resolves(null);

    sinon.stub(User, "findById").returns({
      select: selectStub,
    } as any);

    await authMiddleware(
      req as any,
      res as any,
      next,
    );

    expect(res.statusCode).to.equal(401);

    expect(res.body.message).to.equal(
      "User associated with token not found ",
    );
  });

  it("should reject inactive user", async () => {
    const token = jwt.sign(
      {
        Id: "507f1f77bcf86cd799439011",
        role: "user",
        userId: 1,
        tokenVersion: 0,
      },
      JWT_SECRET,
    );

    const req = createMockRequest();

    req.headers = {
      authorization: `Bearer ${token}`,
    };

    const res = createMockResponse();

    const { next } = createMockNext();

    const inactiveUser = {
      _id: "507f1f77bcf86cd799439011",
      firstName: "Test",
      lastName: "User",
      email: "test@gmail.com",
      role: "user",
      status: "inactive",
      userId: 1,
      tokenVersion: 0,
    };

    const selectStub = sinon
      .stub()
      .resolves(inactiveUser);

    sinon.stub(User, "findById").returns({
      select: selectStub,
    } as any);

    await authMiddleware(
      req as any,
      res as any,
      next,
    );

    expect(res.statusCode).to.equal(403);

    expect(res.body.message).to.equal(
      "User account is inactive",
    );
  });

  it("should call next for valid user", async () => {
    const token = jwt.sign(
      {
        Id: "507f1f77bcf86cd799439011",
        role: "user",
        userId: 1,
        tokenVersion: 0,
      },
      JWT_SECRET,
    );

    const req = createMockRequest();

    req.headers = {
      authorization: `Bearer ${token}`,
    };

    const res = createMockResponse();

    const { next, wasCalled } = createMockNext();

    const activeUser = {
      _id: "507f1f77bcf86cd799439011",
      firstName: "Test",
      lastName: "User",
      email: "test@gmail.com",
      role: "user",
      status: "active",
      userId: 1,
      tokenVersion: 0,
    };

    const selectStub = sinon
      .stub()
      .resolves(activeUser);

    sinon.stub(User, "findById").returns({
      select: selectStub,
    } as any);

    await authMiddleware(
      req as any,
      res as any,
      next,
    );

    expect(wasCalled()).to.equal(true);

    expect(req.user).to.deep.equal(activeUser);
  });

  it("should reject token when tokenVersion does not match", async () => {
    const token = jwt.sign(
      {
        Id: "507f1f77bcf86cd799439011",
        role: "user",
        userId: 1,
        tokenVersion: 0,
      },
      JWT_SECRET,
    );

    const req = createMockRequest();

    req.headers = {
      authorization: `Bearer ${token}`,
    };

    const res = createMockResponse();

    const { next } = createMockNext();

    const user = {
      _id: "507f1f77bcf86cd799439011",
      firstName: "Test",
      lastName: "User",
      email: "test@gmail.com",
      role: "user",
      status: "active",
      userId: 1,

      // Different from token
      tokenVersion: 1,
    };

    const selectStub = sinon
      .stub()
      .resolves(user);

    sinon.stub(User, "findById").returns({
      select: selectStub,
    } as any);

    await authMiddleware(
      req as any,
      res as any,
      next,
    );

    expect(res.statusCode).to.equal(401);

    expect(res.body.message).to.equal(
      "Token is no longer valid. Please login again",
    );
  });
});