import { expect } from "chai";
import {
  isValidObjectId,
  hasEmptyValue,
} from "../src/utils/validation-utils.js";

describe("Validation Utils", () => {

  describe("isValidObjectId", () => {

    it("should return true for a valid ObjectId", () => {
      const result = isValidObjectId(
        "507f1f77bcf86cd799439011"
      );

      expect(result).to.equal(true);
    });

    it("should return false for an invalid ObjectId", () => {
      const result = isValidObjectId("12345");

      expect(result).to.equal(false);
    });

  });

  describe("hasEmptyValue", () => {

    it("should return true when a value is empty", () => {
      const result = hasEmptyValue({
        firstName: "Hareesh",
        lastName: "",
      });

      expect(result).to.equal(true);
    });

    it("should return false when there are no empty values", () => {
      const result = hasEmptyValue({
        firstName: "Hareesh",
        lastName: "User",
      });

      expect(result).to.equal(false);
    });

  });

});