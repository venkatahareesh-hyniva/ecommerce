import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import sinonChai from "sinon-chai";
import { use } from "chai";

use(sinonChai);
import Category from "../../src/model/categoryModel.js";
import * as categoryController from "../../src/controller/categoryController.js";

describe("Category Controller", () => {
  let req: any;
  let res: any;

  const categoryId = new mongoose.Types.ObjectId().toString();
  const userId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: {
        _id: userId,
        firstName: "Hareesh",
        role: "admin",
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

  // =========================================================
  // CREATE CATEGORY
  // =========================================================

  describe("createCategory()", () => {
    it("should create category successfully", async () => {
      req.body = {
        categoryName: " Electronics ",
        description: "Electronic products",
        images: ["image1.jpg"],
        videos: ["video1.mp4"],
      };

      const createdCategory: any = {
        _id: categoryId,
        categoryName: "Electronics",
        description: "Electronic products",
        images: ["image1.jpg"],
        videos: ["video1.mp4"],
        createdBy: userId,
        updatedBy: userId,
        isDeleted: false,
        __v: 0,
      };

      const toObjectStub = sinon.stub().returns({
        ...createdCategory,
      });

      const findOneQuery: any = {
        select: sinon.stub().resolves(null),
      };

      sinon.stub(Category, "findOne").returns(findOneQuery);

      sinon.stub(Category, "create").resolves({
        ...createdCategory,
        toObject: toObjectStub,
      } as any);

      await categoryController.createCategory(req, res);

      expect(Category.findOne).to.have.been.calledOnce;

      expect(Category.create).to.have.been.calledOnceWith({
        categoryName: "Electronics",
        description: "Electronic products",
        images: ["image1.jpg"],
        videos: ["video1.mp4"],
        createdBy: userId,
        updatedBy: userId,
      });

      expect(res.status).to.have.been.called;
      expect(res.json).to.have.been.called;
    });

    it("should restore a deleted category", async () => {
      req.body = {
        categoryName: "Electronics",
        description: "Electronic products",
      };

      const deletedCategory: any = {
        _id: categoryId,
        categoryName: "Electronics",
        description: "Electronic products",
        images: [],
        videos: [],
        isDeleted: true,
        save: sinon.stub().resolves(),
      };

      const findOneQuery: any = {
        select: sinon.stub().resolves(deletedCategory),
      };

      sinon.stub(Category, "findOne").returns(findOneQuery);

      await categoryController.createCategory(req, res);

      expect(deletedCategory.isDeleted).to.equal(false);
      expect(deletedCategory.save).to.have.been.calledOnce;
      expect(res.status).to.have.been.called;
      expect(res.json).to.have.been.called;
    });

    it("should return error when category already exists", async () => {
      req.body = {
        categoryName: "Electronics",
      };

      const existingCategory: any = {
        categoryName: "Electronics",
        isDeleted: false,
      };

      const findOneQuery: any = {
        select: sinon.stub().resolves(existingCategory),
      };

      sinon.stub(Category, "findOne").returns(findOneQuery);

      await categoryController.createCategory(req, res);

      expect(res.status).to.have.been.called;
      expect(res.json).to.have.been.called;

      const response = res.json.firstCall.args[0];

      expect(JSON.stringify(response)).to.include(
        "Category already exists",
      );
    });

    it("should handle create category error", async () => {
      req.body = {
        categoryName: "Electronics",
      };

      const findOneQuery: any = {
        select: sinon.stub().rejects(new Error("Database error")),
      };

      sinon.stub(Category, "findOne").returns(findOneQuery);

      await categoryController.createCategory(req, res);

      expect(res.status).to.have.been.called;
      expect(res.json).to.have.been.called;
    });
  });

  // =========================================================
  // GET ALL CATEGORIES
  // =========================================================

  describe("getCategory()", () => {
    it("should get all categories successfully", async () => {
      const categories = [
        {
          _id: categoryId,
          categoryName: "Electronics",
          description: "Electronic products",
          images: ["image1.jpg"],
          createdBy: {
            firstName: "Hareesh",
          },
        },
        {
          _id: new mongoose.Types.ObjectId(),
          categoryName: "Mobiles",
          description: "Mobile products",
          images: ["image2.jpg"],
          createdBy: {
            firstName: "Hareesh",
          },
        },
      ];

      const populateStub = sinon.stub().resolves(categories);

      const selectStub = sinon.stub().returns({
        populate: populateStub,
      });

      sinon.stub(Category, "find").returns({
        select: selectStub,
      } as any);

      await categoryController.getCategory(req, res);

      expect(Category.find).to.have.been.calledOnceWith({
        isDeleted: false,
      });

      expect(selectStub).to.have.been.calledOnceWith(
        "categoryName description images createdBy",
      );

      expect(populateStub).to.have.been.calledOnce;

      expect(res.status).to.have.been.called;
      expect(res.json).to.have.been.called;
    });

    it("should return empty category list", async () => {
      const populateStub = sinon.stub().resolves([]);

      const selectStub = sinon.stub().returns({
        populate: populateStub,
      });

      sinon.stub(Category, "find").returns({
        select: selectStub,
      } as any);

      await categoryController.getCategory(req, res);

      expect(res.status).to.have.been.called;
      expect(res.json).to.have.been.called;
    });

    it("should handle get categories error", async () => {
      sinon.stub(Category, "find").throws(new Error("Database error"));

      await categoryController.getCategory(req, res);

      expect(res.status).to.have.been.called;
      expect(res.json).to.have.been.called;

      const response = res.json.firstCall.args[0];

      expect(JSON.stringify(response)).to.include(
        "Failed to get categories",
      );
    });
  });

 describe("getCategoryById()", () => {
  it("should get category by id successfully", async () => {
    req.params.id = categoryId;

    const category = {
      _id: categoryId,
      categoryName: "Electronics",
      description: "Electronic products",
      images: ["image1.jpg"],
      videos: ["video1.mp4"],
      createdBy: {
        firstName: "Hareesh",
        role: "admin",
      },
    };

    const populateStub = sinon.stub().resolves(category);

    const selectStub = sinon.stub().returns({
      populate: populateStub,
    });

    sinon.stub(Category, "findById").returns({
      select: selectStub,
    } as any);

    await categoryController.getCategoryById(req, res);

    expect(res.status.called).to.equal(true);
    expect(res.json.called).to.equal(true);

    const response = res.json.firstCall.args[0];

    expect(response.message).to.equal("Category found successfully");
  });

  it("should reject invalid category id", async () => {
    req.params.id = "invalid-id";

    await categoryController.getCategoryById(req, res);

    expect(res.status.called).to.equal(true);
    expect(res.json.called).to.equal(true);

    const response = res.json.firstCall.args[0];

    expect(response.message).to.equal("Invalid category Id");
  });

  it("should return category not found", async () => {
    req.params.id = categoryId;

    const populateStub = sinon.stub().resolves(null);

    const selectStub = sinon.stub().returns({
      populate: populateStub,
    });

    sinon.stub(Category, "findById").returns({
      select: selectStub,
    } as any);

    await categoryController.getCategoryById(req, res);

    expect(res.status.called).to.equal(true);
    expect(res.json.called).to.equal(true);

    const response = res.json.firstCall.args[0];

    expect(response.message).to.equal("CategoryId not Found");
  });

  it("should handle database error", async () => {
    req.params.id = categoryId;

    sinon.stub(Category, "findById").throws(
      new Error("Database error")
    );

    await categoryController.getCategoryById(req, res);

    expect(res.status.called).to.equal(true);
    expect(res.json.called).to.equal(true);

    const response = res.json.firstCall.args[0];

    expect(response.message).to.equal("Failed to get category");
  });
});

  // =========================================================
  // UPDATE CATEGORY
  // =========================================================

 describe("updateCategory()", () => {
  it("should update description successfully", async () => {
    req.params.id = categoryId;

    req.body = {
      description: " Updated description ",
    };

    const existingCategory: any = {
      _id: categoryId,
      categoryName: "Electronics",
      description: "Old description",
      images: ["image1.jpg"],
      videos: [],
      createdBy: userId,
      updatedBy: userId,
      __v: 0,

      toObject: sinon.stub().returns({
        _id: categoryId,
        categoryName: "Electronics",
        description: "Updated description",
        images: ["image1.jpg"],
        videos: [],
        createdBy: userId,
        updatedBy: userId,
        __v: 0,
      }),

      save: sinon.stub().resolves(),
    };

    sinon.stub(Category, "findById").resolves(
      existingCategory
    );

    await categoryController.updateCategory(req, res);

    expect(existingCategory.description).to.equal(
      "Updated description"
    );

    expect(existingCategory.save.called).to.equal(true);

    expect(res.status.called).to.equal(true);
    expect(res.json.called).to.equal(true);

    const response = res.json.firstCall.args[0];

    expect(response.message).to.equal(
      "Category updated successfully"
    );
  });

  it("should reject invalid category id", async () => {
    req.params.id = "invalid-id";

    req.body = {
      description: "Updated description",
    };

    await categoryController.updateCategory(req, res);

    expect(res.status.called).to.equal(true);
    expect(res.json.called).to.equal(true);

    const response = res.json.firstCall.args[0];

    expect(response.message).to.equal(
      "Invalid category ID"
    );
  });

  it("should return category not found", async () => {
    req.params.id = categoryId;

    sinon.stub(Category, "findById").resolves(null);

    await categoryController.updateCategory(req, res);

    expect(res.status.called).to.equal(true);
    expect(res.json.called).to.equal(true);

    const response = res.json.firstCall.args[0];

    expect(response.message).to.equal(
      "Category not found"
    );
  });

  it("should reject changing category name", async () => {
    req.params.id = categoryId;

    req.body = {
      categoryName: "Mobiles",
    };

    const existingCategory: any = {
      _id: categoryId,
      categoryName: "Electronics",
      description: "Electronic products",
      images: [],
      videos: [],
    };

    sinon.stub(Category, "findById").resolves(
      existingCategory
    );

    await categoryController.updateCategory(req, res);

    expect(res.status.called).to.equal(true);
    expect(res.json.called).to.equal(true);

    const response = res.json.firstCall.args[0];

    expect(response.message).to.equal(
      "Category Name cannot be changed"
    );
  });

  it("should reject duplicate image", async () => {
    req.params.id = categoryId;

    req.body = {
      images: ["image1.jpg"],
    };

    const existingCategory: any = {
      _id: categoryId,
      categoryName: "Electronics",
      images: ["image1.jpg"],
      videos: [],
      description: "Electronic products",
    };

    sinon.stub(Category, "findById").resolves(
      existingCategory
    );

    await categoryController.updateCategory(req, res);

    expect(res.status.called).to.equal(true);
    expect(res.json.called).to.equal(true);

    const response = res.json.firstCall.args[0];

    expect(response.message).to.equal(
      'Image "image1.jpg" already exists'
    );
  });

  it("should add new images", async () => {
    req.params.id = categoryId;

    req.body = {
      images: ["image2.jpg", "image3.jpg"],
    };

    const existingCategory: any = {
      _id: categoryId,
      categoryName: "Electronics",
      description: "Electronic products",
      images: ["image1.jpg"],
      videos: [],
      createdBy: userId,
      updatedBy: userId,
      __v: 0,

      toObject: sinon.stub().returns({}),

      save: sinon.stub().resolves(),
    };

    sinon.stub(Category, "findById").resolves(
      existingCategory
    );

    await categoryController.updateCategory(req, res);

    expect(
      existingCategory.images
    ).to.deep.equal([
      "image1.jpg",
      "image2.jpg",
      "image3.jpg",
    ]);

    expect(existingCategory.save.called).to.equal(true);
  });

  it("should add new videos", async () => {
    req.params.id = categoryId;

    req.body = {
      videos: ["video2.mp4", "video3.mp4"],
    };

    const existingCategory: any = {
      _id: categoryId,
      categoryName: "Electronics",
      description: "Electronic products",
      images: [],
      videos: ["video1.mp4"],
      createdBy: userId,
      updatedBy: userId,
      __v: 0,

      toObject: sinon.stub().returns({}),

      save: sinon.stub().resolves(),
    };

    sinon.stub(Category, "findById").resolves(
      existingCategory
    );

    await categoryController.updateCategory(req, res);

    expect(
      existingCategory.videos
    ).to.deep.equal([
      "video1.mp4",
      "video2.mp4",
      "video3.mp4",
    ]);

    expect(existingCategory.save.called).to.equal(true);
  });

  it("should delete selected images", async () => {
    req.params.id = categoryId;

    req.body = {
      deleteImages: ["image2.jpg"],
    };

    const existingCategory: any = {
      _id: categoryId,
      categoryName: "Electronics",
      description: "Electronic products",
      images: [
        "image1.jpg",
        "image2.jpg",
        "image3.jpg",
      ],
      videos: [],
      createdBy: userId,
      updatedBy: userId,
      __v: 0,

      toObject: sinon.stub().returns({}),

      save: sinon.stub().resolves(),
    };

    sinon.stub(Category, "findById").resolves(
      existingCategory
    );

    await categoryController.updateCategory(req, res);

    expect(
      existingCategory.images
    ).to.deep.equal([
      "image1.jpg",
      "image3.jpg",
    ]);

    expect(existingCategory.save.called).to.equal(true);
  });

  it("should delete selected videos", async () => {
    req.params.id = categoryId;

    req.body = {
      deleteVideos: ["video2.mp4"],
    };

    const existingCategory: any = {
      _id: categoryId,
      categoryName: "Electronics",
      description: "Electronic products",
      images: [],
      videos: [
        "video1.mp4",
        "video2.mp4",
      ],
      createdBy: userId,
      updatedBy: userId,
      __v: 0,

      toObject: sinon.stub().returns({}),

      save: sinon.stub().resolves(),
    };

    sinon.stub(Category, "findById").resolves(
      existingCategory
    );

    await categoryController.updateCategory(req, res);

    expect(
      existingCategory.videos
    ).to.deep.equal([
      "video1.mp4",
    ]);

    expect(existingCategory.save.called).to.equal(true);
  });

  it("should handle update category error", async () => {
    req.params.id = categoryId;

    sinon.stub(Category, "findById").rejects(
      new Error("Database error")
    );

    await categoryController.updateCategory(req, res);

    expect(res.status.called).to.equal(true);
    expect(res.json.called).to.equal(true);

    const response = res.json.firstCall.args[0];

    expect(response.message).to.equal(
      "Failed to update category"
    );
  });
});
  // =========================================================
  // DELETE CATEGORY
  // =========================================================
describe("deleteCategory()", () => {
  it("should delete category successfully", async () => {
    req.params.id = categoryId;

    const existingCategory = {
      _id: categoryId,
      categoryName: "Electronics",
    };

    sinon.stub(Category, "findById").resolves(
      existingCategory
    );

    const updateStub = sinon
      .stub(Category, "findByIdAndUpdate")
      .resolves(existingCategory as any);

    await categoryController.deleteCategory(req, res);

    expect(updateStub.called).to.equal(true);

    expect(
      updateStub.firstCall.args[0]
    ).to.equal(categoryId);

    expect(
      updateStub.firstCall.args[1]
    ).to.deep.equal({
      $set: {
        isDeleted: true,
      },
    });

    expect(res.status.called).to.equal(true);
    expect(res.json.called).to.equal(true);

    const response = res.json.firstCall.args[0];

    expect(response.message).to.equal(
      "Category deleted successfully"
    );
  });

  it("should reject invalid category id", async () => {
    req.params.id = "invalid-id";

    await categoryController.deleteCategory(req, res);

    expect(res.status.called).to.equal(true);
    expect(res.json.called).to.equal(true);

    const response = res.json.firstCall.args[0];

    expect(response.message).to.equal(
      "Invalid category ID"
    );
  });

  it("should return category not found", async () => {
    req.params.id = categoryId;

    sinon.stub(Category, "findById").resolves(null);

    await categoryController.deleteCategory(req, res);

    expect(res.status.called).to.equal(true);
    expect(res.json.called).to.equal(true);

    const response = res.json.firstCall.args[0];

    expect(response.message).to.equal(
      "Category not found"
    );
  });

  it("should handle delete category error", async () => {
    req.params.id = categoryId;

    sinon.stub(Category, "findById").rejects(
      new Error("Database error")
    );

    await categoryController.deleteCategory(req, res);

    expect(res.status.called).to.equal(true);
    expect(res.json.called).to.equal(true);

    const response = res.json.firstCall.args[0];

    expect(response.message).to.equal(
      "Failed to delete category"
    );
  });
});
});
