import { expect } from "chai";

import {
  validateCreateCategory,
  validateUpdateCategory,
} from "../src/validator/category.validator.js";

describe("Category Validator", () => {
  describe("validateCreateCategory", () => {
    it("should call next() for valid category data", () => {
      const req: any = {
        body: {
          categoryName: "Electronics",
          description: "Electronic products",
        },
      };

      const res: any = {};

      let nextCalled = false;

      const next = () => {
        nextCalled = true;
      };

      validateCreateCategory(req, res, next);

      expect(nextCalled).to.equal(true);
    });

    it("should return 400 when categoryName is missing", () => {
      const req: any = {
        body: {
          description: "Electronic products",
        },
      };

      let statusCode: number | undefined;

      const res: any = {
        status: (code: number) => {
          statusCode = code;

          return {
            json: () => {},
          };
        },
      };

      const next = () => {};

      validateCreateCategory(req, res, next);

      expect(statusCode).to.equal(400);
    });

    it("should return 400 when description is missing", () => {
      const req: any = {
        body: {
          categoryName: "Electronics",
        },
      };

      let statusCode: number | undefined;

      const res: any = {
        status: (code: number) => {
          statusCode = code;

          return {
            json: () => {},
          };
        },
      };

      const next = () => {};

      validateCreateCategory(req, res, next);

      expect(statusCode).to.equal(400);
    });

    it("should return 400 when categoryName is empty", () => {
      const req: any = {
        body: {
          categoryName: "",
          description: "Electronic products",
        },
      };

      let statusCode: number | undefined;

      const res: any = {
        status: (code: number) => {
          statusCode = code;

          return {
            json: () => {},
          };
        },
      };

      const next = () => {};

      validateCreateCategory(req, res, next);

      expect(statusCode).to.equal(400);
    });

    it("should return 400 when description is empty", () => {
      const req: any = {
        body: {
          categoryName: "Electronics",
          description: "",
        },
      };

      let statusCode: number | undefined;

      const res: any = {
        status: (code: number) => {
          statusCode = code;

          return {
            json: () => {},
          };
        },
      };

      const next = () => {};

      validateCreateCategory(req, res, next);

      expect(statusCode).to.equal(400);
    });

    it("should return 400 when categoryName contains only spaces", () => {
      const req: any = {
        body: {
          categoryName: "   ",
          description: "Electronic products",
        },
      };

      let statusCode: number | undefined;

      const res: any = {
        status: (code: number) => {
          statusCode = code;

          return {
            json: () => {},
          };
        },
      };

      const next = () => {};

      validateCreateCategory(req, res, next);

      expect(statusCode).to.equal(400);
    });

    it("should return 400 when description contains only spaces", () => {
      const req: any = {
        body: {
          categoryName: "Electronics",
          description: "   ",
        },
      };

      let statusCode: number | undefined;

      const res: any = {
        status: (code: number) => {
          statusCode = code;

          return {
            json: () => {},
          };
        },
      };

      const next = () => {};

      validateCreateCategory(req, res, next);

      expect(statusCode).to.equal(400);
    });
  });

  describe("validateUpdateCategory", () => {
    it("should call next() for valid update data", () => {
      const req: any = {
        body: {
          categoryName: "Updated Electronics",
          description: "Updated electronic products",
        },
      };

      const res: any = {};

      let nextCalled = false;

      const next = () => {
        nextCalled = true;
      };

      validateUpdateCategory(req, res, next);

      expect(nextCalled).to.equal(true);
    });

    it("should allow update when only categoryName is provided", () => {
      const req: any = {
        body: {
          categoryName: "Updated Electronics",
        },
      };

      const res: any = {};

      let nextCalled = false;

      const next = () => {
        nextCalled = true;
      };

      validateUpdateCategory(req, res, next);

      expect(nextCalled).to.equal(true);
    });

    it("should allow update when only description is provided", () => {
      const req: any = {
        body: {
          description: "Updated electronic products",
        },
      };

      const res: any = {};

      let nextCalled = false;

      const next = () => {
        nextCalled = true;
      };

      validateUpdateCategory(req, res, next);

      expect(nextCalled).to.equal(true);
    });

    it("should return 400 when categoryName is empty", () => {
      const req: any = {
        body: {
          categoryName: "",
        },
      };

      let statusCode: number | undefined;

      const res: any = {
        status: (code: number) => {
          statusCode = code;

          return {
            json: () => {},
          };
        },
      };

      const next = () => {};

      validateUpdateCategory(req, res, next);

      expect(statusCode).to.equal(400);
    });

    it("should return 400 when description is empty", () => {
      const req: any = {
        body: {
          description: "",
        },
      };

      let statusCode: number | undefined;

      const res: any = {
        status: (code: number) => {
          statusCode = code;

          return {
            json: () => {},
          };
        },
      };

      const next = () => {};

      validateUpdateCategory(req, res, next);

      expect(statusCode).to.equal(400);
    });

    it("should return 400 when categoryName contains only spaces", () => {
      const req: any = {
        body: {
          categoryName: "   ",
        },
      };

      let statusCode: number | undefined;

      const res: any = {
        status: (code: number) => {
          statusCode = code;

          return {
            json: () => {},
          };
        },
      };

      const next = () => {};

      validateUpdateCategory(req, res, next);

      expect(statusCode).to.equal(400);
    });

    it("should return 400 when description contains only spaces", () => {
      const req: any = {
        body: {
          description: "   ",
        },
      };

      let statusCode: number | undefined;

      const res: any = {
        status: (code: number) => {
          statusCode = code;

          return {
            json: () => {},
          };
        },
      };

      const next = () => {};

      validateUpdateCategory(req, res, next);

      expect(statusCode).to.equal(400);
    });
  });
});
