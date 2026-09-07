import { expect } from "chai";

import {
  sendBadRequest,
  sendNotFound,
  sendUnauthorized,
  sendForBiddden,
  sendSuccessResponse,
  sendCreatedResponse,
} from "../src/utils/response-utils.js";

import { createMockResponse } from "./helpers.test.js";

describe("Response Utils", () => {

  it("should send 400 Bad Request", () => {

    const res = createMockResponse();

    sendBadRequest(res, "Invalid data");

    expect(res.statusCode).to.equal(400);
    expect(res.body.message).to.equal("Invalid data");
  });


  it("should send 404 Not Found", () => {

    const res = createMockResponse();

    sendNotFound(res, "Product not found");

    expect(res.statusCode).to.equal(404);
    expect(res.body.message).to.equal("Product not found");
  });


  it("should send 401 Unauthorized", () => {

    const res = createMockResponse();

    sendUnauthorized(res, "Authentication required");

    expect(res.statusCode).to.equal(401);
    expect(res.body.message).to.equal(
      "Authentication required"
    );
  });


  it("should send 403 Forbidden", () => {

    const res = createMockResponse();

    sendForBiddden(res, "Access denied");

    expect(res.statusCode).to.equal(403);
    expect(res.body.message).to.equal("Access denied");
  });


  it("should send successful response", () => {

    const res = createMockResponse();

    sendSuccessResponse(
      res,
      "Product fetched",
      { name: "iPhone" }
    );

    expect(res.statusCode).to.equal(200);

    expect(res.body.message).to.equal(
      "Product fetched"
    );

    expect(res.body.data.name).to.equal("iPhone");
  });


  it("should send created response", () => {

    const res = createMockResponse();

    sendCreatedResponse(
      res,
      "Product created",
      { name: "iPhone" }
    );

    expect(res.statusCode).to.equal(201);

    expect(res.body.message).to.equal(
      "Product created"
    );
  });

});