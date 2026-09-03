import { expect } from "chai";
import { validateSignup } from "../src/validator/auth.validator.js";

describe("validateSignup", () => {

  it("should return error when required fields are missing", () => {
    const result = validateSignup({});

    expect(result).to.equal("All fields are required");
  });

  it("should return error for invalid first name", () => {
    const result = validateSignup({
      firstName: "Hareesh123",
      lastName: "User",
      email: "user@gmail.com",
      phoneNumber: "+919876543210",
      password: "Password@123",
    });

    expect(result).to.equal(
      "FirstName should contain only letters"
    );
  });

  it("should return error for invalid last name", () => {
    const result = validateSignup({
      firstName: "Hareesh",
      lastName: "User123",
      email: "user@gmail.com",
      phoneNumber: "+919876543210",
      password: "Password@123",
    });

    expect(result).to.equal(
      "LastName should contain only letters"
    );
  });

  it("should return error for invalid email", () => {
    const result = validateSignup({
      firstName: "Hareesh",
      lastName: "User",
      email: "invalid-email",
      phoneNumber: "+919876543210",
      password: "Password@123",
    });

    expect(result).to.equal("Invalid email format");
  });

  it("should return error for invalid phone number", () => {
    const result = validateSignup({
      firstName: "Hareesh",
      lastName: "User",
      email: "user@gmail.com",
      phoneNumber: "9876543210",
      password: "Password@123",
    });

    expect(result).to.equal(
      "Phone number must include a valid country code"
    );
  });

  it("should return error when password is less than 8 characters", () => {
    const result = validateSignup({
      firstName: "Hareesh",
      lastName: "User",
      email: "user@gmail.com",
      phoneNumber: "+919876543210",
      password: "Pass@1",
    });

    expect(result).to.equal(
      "Password must be at least 8 characters"
    );
  });

  it("should return error when password has no uppercase letter", () => {
    const result = validateSignup({
      firstName: "Hareesh",
      lastName: "User",
      email: "user@gmail.com",
      phoneNumber: "+919876543210",
      password: "password@123",
    });

    expect(result).to.equal(
      "Password must contain at least one uppercase"
    );
  });

  it("should return error when password has no lowercase letter", () => {
    const result = validateSignup({
      firstName: "Hareesh",
      lastName: "User",
      email: "user@gmail.com",
      phoneNumber: "+919876543210",
      password: "PASSWORD@123",
    });

    expect(result).to.equal(
      "Password must contain at least one lowercase"
    );
  });

  it("should return error when password has no number", () => {
    const result = validateSignup({
      firstName: "Hareesh",
      lastName: "User",
      email: "user@gmail.com",
      phoneNumber: "+919876543210",
      password: "Password@abc",
    });

    expect(result).to.equal(
      "Password must contain at least one number"
    );
  });

  it("should return error when password has no special character", () => {
    const result = validateSignup({
      firstName: "Hareesh",
      lastName: "User",
      email: "user@gmail.com",
      phoneNumber: "+919876543210",
      password: "Password123",
    });

    expect(result).to.equal(
      "Password must contain at least one special character"
    );
  });

  it("should return null for valid signup data", () => {
    const result = validateSignup({
      firstName: "Hareesh",
      lastName: "User",
      email: "user@gmail.com",
      phoneNumber: "+919876543210",
      password: "Password@123",
    });

    expect(result).to.equal(null);
  });

});