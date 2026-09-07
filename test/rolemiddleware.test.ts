import { expect } from "chai";

import { authorizeRoles } from "../src/middleware/rolemiddleware.js";

import {
  createMockRequest,
  createMockResponse,
  createMockNext,
} from "./helpers.test.js";

describe("Role Middleware", () => {

  // ==========================================
  // 1. Unauthenticated user
  // ==========================================

  it("should reject unauthenticated user", () => {

    const req = createMockRequest() as any;

    // The helper creates user: {}
    // Remove it so middleware sees user as undefined
    req.user = undefined;

    const res = createMockResponse();

    const { next, wasCalled } = createMockNext();

    authorizeRoles(["admin"])(req, res, next);

    expect(res.statusCode).to.equal(401);

    expect(res.body.message).to.equal(
      "Authentication required"
    );

    expect(wasCalled()).to.equal(false);
  });


  // ==========================================
  // 2. Unauthorized role
  // ==========================================

  it("should reject unauthorized role", () => {

    const req = createMockRequest();

    req.user = {
      role: "user",
    };

    const res = createMockResponse();

    const { next, wasCalled } = createMockNext();

    authorizeRoles(["admin"])(req, res, next);

    expect(res.statusCode).to.equal(403);

    expect(res.body.message).to.equal(
      "Access denied"
    );

    expect(wasCalled()).to.equal(false);
  });


  // ==========================================
  // 3. Authorized role
  // ==========================================

  it("should allow authorized role", () => {

    const req = createMockRequest();

    req.user = {
      role: "admin",
    };

    const res = createMockResponse();

    const { next, wasCalled } = createMockNext();

    authorizeRoles(["admin"])(req, res, next);

    expect(wasCalled()).to.equal(true);
  });


  // ==========================================
  // 4. Multiple allowed roles
  // ==========================================

  it("should allow one of multiple roles", () => {

    const req = createMockRequest();

    req.user = {
      role: "dealer",
    };

    const res = createMockResponse();

    const { next, wasCalled } = createMockNext();

    authorizeRoles(
      ["admin", "dealer"]
    )(req, res, next);

    expect(wasCalled()).to.equal(true);
  });

});