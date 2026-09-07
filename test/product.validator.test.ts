import { expect } from "chai";
import {
  validateCreateProduct,
  validateUpdateProduct,
} from "../src/validator/product.validator.js";

import {
  createMockRequest,
  createMockResponse,
  createMockNext,
} from "./helpers.test.js";

describe("Product Validators", () => {

  describe("validateCreateProduct()", () => {

    it("should reject missing product name", async () => {

      const req = createMockRequest({
        description: "Smart phone",
        price: 10000,
        stock_quantity: 10,
        categoryId: "507f1f77bcf86cd799439011",
      });

      const res = createMockResponse();
      const { next } = createMockNext();

      await validateCreateProduct(req, res, next);

      expect(res.statusCode).to.equal(400);

      expect(res.body.message).to.equal(
        "Not a valid product name !"
      );
    });


    it("should reject empty description", async () => {

      const req = createMockRequest({
        productName: "iPhone",
        description: "",
        price: 10000,
        stock_quantity: 10,
        categoryId: "507f1f77bcf86cd799439011",
      });

      const res = createMockResponse();
      const { next } = createMockNext();

      await validateCreateProduct(req, res, next);

      expect(res.statusCode).to.equal(400);

      expect(res.body.message).to.equal(
        "Product description cannot be empty"
      );
    });


    it("should reject invalid price", async () => {

      const req = createMockRequest({
        productName: "iPhone",
        description: "Smart phone",
        price: 0,
        stock_quantity: 10,
        categoryId: "507f1f77bcf86cd799439011",
      });

      const res = createMockResponse();
      const { next } = createMockNext();

      await validateCreateProduct(req, res, next);

      expect(res.statusCode).to.equal(400);

      expect(res.body.message).to.equal(
        "Price must be greater than 0"
      );
    });


    it("should reject negative stock", async () => {

      const req = createMockRequest({
        productName: "iPhone",
        description: "Smart phone",
        price: 10000,
        stock_quantity: -1,
        categoryId: "507f1f77bcf86cd799439011",
      });

      const res = createMockResponse();
      const { next } = createMockNext();

      await validateCreateProduct(req, res, next);

      expect(res.statusCode).to.equal(400);

      expect(res.body.message).to.equal(
        "Stock cannot be negative"
      );
    });


    it("should reject invalid category ID", async () => {

      const req = createMockRequest({
        productName: "iPhone",
        description: "Smart phone",
        price: 10000,
        stock_quantity: 10,
        categoryId: "123",
      });

      const res = createMockResponse();
      const { next } = createMockNext();

      await validateCreateProduct(req, res, next);

      expect(res.statusCode).to.equal(400);

      expect(res.body.message).to.equal(
        "Invalid category ID"
      );
    });

  });


  describe("validateUpdateProduct()", () => {

    it("should call next for valid update", () => {

      const req = createMockRequest({
        name: "iPhone 15",
        price: 50000,
        stock: 10,
      });

      const res = createMockResponse();
      const { next, wasCalled } = createMockNext();

      validateUpdateProduct(req, res, next);

      expect(wasCalled()).to.equal(true);
    });


    it("should reject empty product name", () => {

      const req = createMockRequest({
        name: "   ",
      });

      const res = createMockResponse();
      const { next } = createMockNext();

      validateUpdateProduct(req, res, next);

      expect(res.statusCode).to.equal(400);

      expect(res.body.message).to.equal(
        "Product name cannot be empty"
      );
    });


    it("should reject invalid price", () => {

      const req = createMockRequest({
        price: 0,
      });

      const res = createMockResponse();
      const { next } = createMockNext();

      validateUpdateProduct(req, res, next);

      expect(res.statusCode).to.equal(400);

      expect(res.body.message).to.equal(
        "Price must be greater than 0"
      );
    });


    it("should reject negative stock", () => {

      const req = createMockRequest({
        stock: -1,
      });

      const res = createMockResponse();
      const { next } = createMockNext();

      validateUpdateProduct(req, res, next);

      expect(res.statusCode).to.equal(400);

      expect(res.body.message).to.equal(
        "Stock cannot be negative"
      );
    });


    it("should reject empty category ID", () => {

      const req = createMockRequest({
        categoryId: "",
      });

      const res = createMockResponse();
      const { next } = createMockNext();

      validateUpdateProduct(req, res, next);

      expect(res.statusCode).to.equal(400);

      expect(res.body.message).to.equal(
        "CategoryId cannot be empty"
      );
    });

  });

});