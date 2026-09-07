import { expect } from "chai";
import sinon from "sinon";

import Product from "../../src/model/productModel.js";

import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../src/controller/productController.js";

describe("Product Controller", () => {
  let res: any;

  const userId = "507f1f77bcf86cd799439011";
  const productId = "507f1f77bcf86cd799439012";
  const categoryId = "507f1f77bcf86cd799439013";

  beforeEach(() => {
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("createProduct()", () => {
    it("should create a new product successfully", async () => {
      const req: any = {
        body: {
          productName: "iPhone 15",
          description: "Apple smartphone",
          price: 60000,
          stock_quantity: 10,
          categoryId,
          images: ["iphone.jpg"],
          videos: [],
        },
        user: {
          _id: userId,
          role: "admin",
        },
      };

      const selectStub = sinon.stub().resolves(null);

      sinon.stub(Product, "findOne").returns({
        select: selectStub,
      } as any);

      const createStub = sinon.stub(Product, "create").resolves({
        _id: productId,
        productName: "iPhone 15",
        price: 60000,
      } as any);

      await createProduct(req, res);

      expect(createStub.calledOnce).to.equal(true);

      expect(res.status.calledOnceWith(200)).to.equal(true);

      expect(
        res.json.calledOnceWithMatch({
          message: "Product created successfully",
        }),
      ).to.equal(true);
    });


    it("should trim product name before creating product", async () => {
      const req: any = {
        body: {
          productName: "  iPhone 15  ",
          description: "Apple smartphone",
          price: 60000,
          stock_quantity: 10,
          categoryId,
          images: [],
          videos: [],
        },
        user: {
          _id: userId,
          role: "admin",
        },
      };

      const selectStub = sinon.stub().resolves(null);

      sinon.stub(Product, "findOne").returns({
        select: selectStub,
      } as any);

      const createStub = sinon.stub(Product, "create").resolves({
        _id: productId,
      } as any);

      await createProduct(req, res);

      expect(createStub.calledOnce).to.equal(true);

      const createArguments = createStub.firstCall.args[0]!;

      expect(createArguments.productName).to.equal("iPhone 15");
    });


    it("should return bad request when product already exists", async () => {
      const req: any = {
        body: {
          productName: "iPhone 15",
          description: "Apple smartphone",
          price: 60000,
          stock_quantity: 10,
          categoryId,
        },
        user: {
          _id: userId,
          role: "admin",
        },
      };

      const existingProduct = {
        _id: productId,
        productName: "iPhone 15",
        isDeleted: false,
      };

      const selectStub = sinon.stub().resolves(existingProduct);

      sinon.stub(Product, "findOne").returns({
        select: selectStub,
      } as any);

      const createStub = sinon.stub(Product, "create");

      await createProduct(req, res);

      expect(res.status.calledOnceWith(400)).to.equal(true);

      expect(
        res.json.calledOnceWith({
          message: "Product already exists",
        }),
      ).to.equal(true);

      expect(createStub.called).to.equal(false);
    });


    it("should restore a deleted product", async () => {
      const req: any = {
        body: {
          productName: "iPhone 15",
          description: "Apple smartphone",
          price: 60000,
          stock_quantity: 10,
          categoryId,
        },
        user: {
          _id: userId,
          role: "admin",
        },
      };

      const existingProduct: any = {
        _id: productId,
        productName: "iPhone 15",
        isDeleted: true,
        updatedBy: undefined,
        save: sinon.stub().resolves(),
      };

      const selectStub = sinon.stub().resolves(existingProduct);

      sinon.stub(Product, "findOne").returns({
        select: selectStub,
      } as any);

      await createProduct(req, res);

      expect(existingProduct.isDeleted).to.equal(false);

      expect(existingProduct.updatedBy).to.equal(userId);

      expect(existingProduct.save.calledOnce).to.equal(true);

      expect(res.status.calledOnceWith(200)).to.equal(true);

      expect(
        res.json.calledOnceWithMatch({
          message: "Product restored successfully",
        }),
      ).to.equal(true);
    });


    it("should handle database error", async () => {
      const req: any = {
        body: {
          productName: "iPhone 15",
          description: "Apple smartphone",
          price: 60000,
          stock_quantity: 10,
          categoryId,
        },
        user: {
          _id: userId,
          role: "admin",
        },
      };

      const selectStub = sinon
        .stub()
        .rejects(new Error("Database error"));

      sinon.stub(Product, "findOne").returns({
        select: selectStub,
      } as any);

      await createProduct(req, res);

      expect(res.status.calledOnceWith(400)).to.equal(true);

      expect(
        res.json.calledOnceWith({
          message: "Failed to create product",
        }),
      ).to.equal(true);
    });
  });

  describe("updateProduct()", () => {
    it("should update product successfully", async () => {
      const req: any = {
        params: {
          productId,
        },
        body: {
          description: "Updated description",
          price: 55000,
          stock_quantity: 20,
        },
        user: {
          _id: userId,
          role: "admin",
        },
      };

      const existingProduct: any = {
        _id: productId,
        productName: "iPhone 15",
        categoryId,
        createdBy: userId,
      };

      const firstFindOne = sinon
        .stub(Product, "findOne")
        .onFirstCall()
        .resolves(existingProduct)
        .onSecondCall()
        .returns({
          select: sinon.stub().resolves({
            _id: productId,
            productName: "iPhone 15",
            description: "Updated description",
            price: 55000,
          }),
        } as any);

      const updateStub = sinon
        .stub(Product, "findOneAndUpdate")
        .resolves(existingProduct);

      await updateProduct(req, res);

      expect(firstFindOne.calledTwice).to.equal(true);

      expect(updateStub.calledOnce).to.equal(true);

      expect(res.status.calledOnceWith(200)).to.equal(true);

      expect(
        res.json.calledOnceWithMatch({
          message: "Product updated successfully",
        }),
      ).to.equal(true);
    });


    it("should reject invalid product ID", async () => {
      const req: any = {
        params: {
          productId: "123",
        },
        body: {
          price: 50000,
        },
        user: {
          _id: userId,
          role: "admin",
        },
      };

      await updateProduct(req, res);

      expect(res.status.calledOnceWith(400)).to.equal(true);

      expect(
        res.json.calledOnceWith({
          message: "Invalid product ID",
        }),
      ).to.equal(true);
    });


    it("should return bad request when product is not found", async () => {
      const req: any = {
        params: {
          productId,
        },
        body: {
          price: 50000,
        },
        user: {
          _id: userId,
          role: "admin",
        },
      };

      sinon.stub(Product, "findOne").resolves(null);

      await updateProduct(req, res);

      expect(res.status.calledOnceWith(400)).to.equal(true);

      expect(
        res.json.calledOnceWith({
          message: "Product not found or has been deleted",
        }),
      ).to.equal(true);
    });


    it("should prevent dealer from updating another dealer's product", async () => {
      const anotherDealerId = "507f1f77bcf86cd799439099";

      const req: any = {
        params: {
          productId,
        },
        body: {
          price: 50000,
        },
        user: {
          _id: userId,
          role: "dealer",
        },
      };

      const existingProduct: any = {
        _id: productId,
        productName: "iPhone 15",
        categoryId,
        createdBy: anotherDealerId,
      };

      sinon.stub(Product, "findOne").resolves(existingProduct);

      await updateProduct(req, res);

      expect(res.status.calledOnceWith(403)).to.equal(true);

      expect(
        res.json.calledOnceWith({
          message: "You can only modify your own products",
        }),
      ).to.equal(true);
    });


    it("should allow dealer to update their own product", async () => {
      const req: any = {
        params: {
          productId,
        },
        body: {
          price: 50000,
        },
        user: {
          _id: userId,
          role: "dealer",
        },
      };

      const existingProduct: any = {
        _id: productId,
        productName: "iPhone 15",
        categoryId,
        createdBy: userId,
      };

      sinon
        .stub(Product, "findOne")
        .onFirstCall()
        .resolves(existingProduct)
        .onSecondCall()
        .returns({
          select: sinon.stub().resolves({
            productName: "iPhone 15",
            price: 50000,
          }),
        } as any);

      const updateStub = sinon
        .stub(Product, "findOneAndUpdate")
        .resolves(existingProduct);

      await updateProduct(req, res);

      expect(updateStub.calledOnce).to.equal(true);

      expect(res.status.calledOnceWith(200)).to.equal(true);
    });


    it("should not allow product name to be changed", async () => {
      const req: any = {
        params: {
          productId,
        },
        body: {
          productName: "Samsung S25",
        },
        user: {
          _id: userId,
          role: "admin",
        },
      };

      const existingProduct: any = {
        _id: productId,
        productName: "iPhone 15",
        categoryId,
        createdBy: userId,
      };

      sinon.stub(Product, "findOne").resolves(existingProduct);

      await updateProduct(req, res);

      expect(res.status.calledOnceWith(400)).to.equal(true);

      expect(
        res.json.calledOnceWith({
          message: "Product productName cannot be changed",
        }),
      ).to.equal(true);
    });


    it("should not allow category to be changed", async () => {
      const req: any = {
        params: {
          productId,
        },
        body: {
          categoryId: "507f1f77bcf86cd799439099",
        },
        user: {
          _id: userId,
          role: "admin",
        },
      };

      const existingProduct: any = {
        _id: productId,
        productName: "iPhone 15",
        categoryId,
        createdBy: userId,
      };

      sinon.stub(Product, "findOne").resolves(existingProduct);

      await updateProduct(req, res);

      expect(res.status.calledOnceWith(400)).to.equal(true);

      expect(
        res.json.calledOnceWith({
          message: "Category cannot be changed for this product",
        }),
      ).to.equal(true);
    });


    it("should update images", async () => {
      const req: any = {
        params: {
          productId,
        },
        body: {
          images: ["iphone-front.jpg"],
        },
        user: {
          _id: userId,
          role: "admin",
        },
      };

      const existingProduct: any = {
        _id: productId,
        productName: "iPhone 15",
        categoryId,
        createdBy: userId,
      };

      sinon
        .stub(Product, "findOne")
        .onFirstCall()
        .resolves(existingProduct)
        .onSecondCall()
        .returns({
          select: sinon.stub().resolves(existingProduct),
        } as any);

      const updateStub = sinon
        .stub(Product, "findOneAndUpdate")
        .resolves(existingProduct);

      await updateProduct(req, res);

      expect(updateStub.calledTwice).to.equal(true);

      const secondUpdate = updateStub.secondCall.args[1]!;

      expect(secondUpdate.$addToSet).to.have.property("images");
    });


    it("should delete images", async () => {
      const req: any = {
        params: {
          productId,
        },
        body: {
          deleteImages: ["old-image.jpg"],
        },
        user: {
          _id: userId,
          role: "admin",
        },
      };

      const existingProduct: any = {
        _id: productId,
        productName: "iPhone 15",
        categoryId,
        createdBy: userId,
      };

      sinon
        .stub(Product, "findOne")
        .onFirstCall()
        .resolves(existingProduct)
        .onSecondCall()
        .returns({
          select: sinon.stub().resolves(existingProduct),
        } as any);

      const updateStub = sinon
        .stub(Product, "findOneAndUpdate")
        .resolves(existingProduct);

      await updateProduct(req, res);

      expect(updateStub.calledTwice).to.equal(true);

      const secondUpdate = updateStub.secondCall.args[1]!;

      expect(secondUpdate.$pull).to.deep.equal({
        images: {
          $in: ["old-image.jpg"],
        },
      });
    });


    it("should handle database error", async () => {
      const req: any = {
        params: {
          productId,
        },
        body: {
          price: 50000,
        },
        user: {
          _id: userId,
          role: "admin",
        },
      };

      sinon
        .stub(Product, "findOne")
        .rejects(new Error("Database error"));

      await updateProduct(req, res);

      expect(res.status.calledOnceWith(500)).to.equal(true);

      expect(
        res.json.calledOnceWithMatch({
          message: "Failed to update product",
        }),
      ).to.equal(true);
    });
  });


  describe("deleteProduct()", () => {
    it("should delete product successfully", async () => {
      const req: any = {
        params: {
          productId,
        },
        user: {
          _id: userId,
          role: "admin",
        },
      };

      const existingProduct: any = {
        _id: productId,
        createdBy: userId,
      };

      sinon
        .stub(Product, "findById")
        .resolves(existingProduct);

      const updateStub = sinon
        .stub(Product, "findByIdAndUpdate")
        .resolves(existingProduct);

      await deleteProduct(req, res);

      expect(updateStub.calledOnce).to.equal(true);

      expect(res.status.calledOnceWith(200)).to.equal(true);

      expect(
        res.json.calledOnceWith({
          message: "Product deleted successfully",
          data: undefined,
        }),
      ).to.equal(true);
    });


    it("should reject invalid product ID", async () => {
      const req: any = {
        params: {
          productId: "123",
        },
        user: {
          _id: userId,
          role: "admin",
        },
      };

      await deleteProduct(req, res);

      expect(res.status.calledOnceWith(400)).to.equal(true);

      expect(
        res.json.calledOnceWith({
          message: "Invalid product ID",
        }),
      ).to.equal(true);
    });


    it("should return not found when product does not exist", async () => {
      const req: any = {
        params: {
          productId,
        },
        user: {
          _id: userId,
          role: "admin",
        },
      };

      sinon.stub(Product, "findById").resolves(null);

      await deleteProduct(req, res);

      expect(res.status.calledOnceWith(404)).to.equal(true);

      expect(
        res.json.calledOnceWith({
          message: "Product not found",
        }),
      ).to.equal(true);
    });


    it("should prevent dealer from deleting another dealer's product", async () => {
      const anotherDealerId = "507f1f77bcf86cd799439099";

      const req: any = {
        params: {
          productId,
        },
        user: {
          _id: userId,
          role: "dealer",
        },
      };

      const existingProduct: any = {
        _id: productId,
        createdBy: anotherDealerId,
      };

      sinon
        .stub(Product, "findById")
        .resolves(existingProduct);

      await deleteProduct(req, res);

      expect(res.status.calledOnceWith(403)).to.equal(true);

      expect(
        res.json.calledOnceWith({
          message: "You can only delete your own products",
        }),
      ).to.equal(true);
    });


    it("should allow dealer to delete their own product", async () => {
      const req: any = {
        params: {
          productId,
        },
        user: {
          _id: userId,
          role: "dealer",
        },
      };

      const existingProduct: any = {
        _id: productId,
        createdBy: userId,
      };

      sinon
        .stub(Product, "findById")
        .resolves(existingProduct);

      const updateStub = sinon
        .stub(Product, "findByIdAndUpdate")
        .resolves(existingProduct);

      await deleteProduct(req, res);

      expect(updateStub.calledOnce).to.equal(true);

      const updateData = updateStub.firstCall.args[1]!;

      expect(updateData.$set!.isDeleted).to.equal(true);

      expect(res.status.calledOnceWith(200)).to.equal(true);
    });


    it("should handle database error", async () => {
      const req: any = {
        params: {
          productId,
        },
        user: {
          _id: userId,
          role: "admin",
        },
      };

      sinon
        .stub(Product, "findById")
        .rejects(new Error("Database error"));

      await deleteProduct(req, res);

      expect(res.status.calledOnceWith(500)).to.equal(true);

      expect(
        res.json.calledOnceWithMatch({
          message: "Failed to delete product",
        }),
      ).to.equal(true);
    });
  });
});