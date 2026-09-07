import { expect } from "chai";
import {
  validateOrderItems,
  validateShippingAddress,
} from "../src/validator/order.validator.js";

describe("Order Validators", () => {

  const validProductId = "507f1f77bcf86cd799439011";


  describe("validateOrderItems()", () => {

    it("should return undefined for valid items", () => {

      const result = validateOrderItems([
        {
          productId: validProductId,
          quantity: 2,
        },
      ]);

      expect(result).to.equal(undefined);
    });


    it("should reject empty items", () => {

      const result = validateOrderItems([]);

      expect(result).to.equal("ITEMS_REQUIRED");
    });


    it("should reject non-array items", () => {

      const result = validateOrderItems(null as any);

      expect(result).to.equal("ITEMS_REQUIRED");
    });


    it("should reject missing product ID", () => {

      const result = validateOrderItems([
        {
          quantity: 2,
        },
      ]);

      expect(result).to.equal("PRODUCT_ID_REQUIRED");
    });


    it("should reject invalid product ID", () => {

      const result = validateOrderItems([
        {
          productId: "123",
          quantity: 2,
        },
      ]);

      expect(result).to.equal("INVALID_PRODUCT_ID");
    });


    it("should reject quantity less than one", () => {

      const result = validateOrderItems([
        {
          productId: validProductId,
          quantity: 0,
        },
      ]);

      expect(result).to.equal("INVALID_QUANTITY");
    });


    it("should reject decimal quantity", () => {

      const result = validateOrderItems([
        {
          productId: validProductId,
          quantity: 1.5,
        },
      ]);

      expect(result).to.equal("INVALID_QUANTITY");
    });

  });


  describe("validateShippingAddress()", () => {

    const validAddress = {
      address: "MG Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560001",
    };


    it("should return undefined for valid address", () => {

      const result = validateShippingAddress(validAddress);

      expect(result).to.equal(undefined);
    });


    it("should reject missing address", () => {

      const result = validateShippingAddress({
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560001",
      });

      expect(result).to.equal("Address is required");
    });


    it("should reject missing city", () => {

      const result = validateShippingAddress({
        address: "MG Road",
        state: "Karnataka",
        pincode: "560001",
      });

      expect(result).to.equal("City is required");
    });


    it("should reject missing state", () => {

      const result = validateShippingAddress({
        address: "MG Road",
        city: "Bangalore",
        pincode: "560001",
      });

      expect(result).to.equal("State is required");
    });


    it("should reject missing pincode", () => {

      const result = validateShippingAddress({
        address: "MG Road",
        city: "Bangalore",
        state: "Karnataka",
      });

      expect(result).to.equal("Pincode is required");
    });

  });

});