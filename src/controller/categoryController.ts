import Category from "../model/categoryModel.js";
import {
  sendSuccessResponse,
  sendBadRequest,
} from "../utils/response-utils.js";
import { isValidObjectId } from "../utils/validation-utils.js";

export const createCategory = async (req: any, res: any) => {
  try {
    const { categoryName, description, images, videos } = req.body;
    const user = req.user;

    const existingCategory = await Category.findOne({
      categoryName: categoryName.trim(),
    }).select("+isDeleted");

    if (existingCategory) {
      if (existingCategory.isDeleted) {
        existingCategory.isDeleted = false;
        await existingCategory.save();

        return sendSuccessResponse(
          res,
          "Category restored successfully",
          existingCategory,
        );
      }
      return sendBadRequest(res, "Category already exists");
    }

    const category = await Category.create({
      categoryName: categoryName.trim(),
      description,
      images,
      videos,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    const responseData: any = category.toObject();
    delete responseData.isDeleted;
    delete responseData.__v;

    responseData.createdBy = {
      name: user.firstName,
      role: user.role,
    };

    return sendSuccessResponse(res,"Category created successfully", responseData);
  } catch (error) {
    console.log(error);

    return sendBadRequest(res, "Failed to create category");
  }
};

export const getCategory = async (req: any, res: any) => {
  try {
    const filter = { isDeleted: false };
    const categories = await Category.find(filter)
      .select("categoryName description images createdBy")
      .populate({ path: "createdBy", select: "-_id firstName " });

    return sendSuccessResponse(res, "Categories found", categories);
  } catch (error) {
    console.log(error);
    return sendBadRequest(res, "Failed to get categories");
  }
};

export const getCategoryById = async (req: any, res: any) => {
  try {
    const id = req.params.id;

    if (!isValidObjectId(id)) {
      return sendBadRequest(res, "Invalid category Id");
    }
    const category = await Category.findById(id)
      .select("categoryName description images videos createdBy")
      .populate({ path: "createdBy", select: "-_id firstName role" });

    if (!category) {
      return sendBadRequest(res, "CategoryId not Found");
    }
    return sendSuccessResponse(res, "Category found successfully", category);
  } catch (error) {
    console.log(error);
    return sendBadRequest(res, "Failed to get category");
  }
};

export const updateCategory = async (req: any, res: any) => {
  try {
    const id = req.params.id;
    const user = req.user;

    const {
      categoryName,
      description,
      images,
      videos,
      deleteImages = [],
      deleteVideos = [],
    } = req.body;

    if (!isValidObjectId(id)) {
      return sendBadRequest(res, "Invalid category ID");
    }

    const existingCategory = await Category.findById(id);

    if (!existingCategory) {
      return sendBadRequest(res, "Category not found");
    }

    if (categoryName !== undefined) {
      if (categoryName.trim() !== existingCategory.categoryName.trim()) {
        return sendBadRequest(res, "Category Name cannot be changed");
      }
    }

    if (description !== undefined) {
      existingCategory.description = description.trim();
    }

    if (images?.length > 0) {
      const duplicateImage = images.find((image: string) =>
        existingCategory.images.includes(image),
      );

      if (duplicateImage) {
        return sendBadRequest(res, `Image "${duplicateImage}" already exists`);
      }

      existingCategory.images.push(...images);
    }

    if (videos?.length > 0) {
      existingCategory.videos.push(...videos);
    }

    if (deleteImages.length > 0) {
      existingCategory.images = existingCategory.images.filter(
        (image: string) => !deleteImages.includes(image),
      );
    }

    if (deleteVideos.length > 0) {
      existingCategory.videos = existingCategory.videos.filter(
        (video: string) => !deleteVideos.includes(video),
      );
    }

    const { __v, ...responseData } = existingCategory.toObject();
    responseData.updatedBy = {
      name: user.firstName,
      role: user.role,
    };

    await existingCategory.save();
    return sendSuccessResponse(
      res,
      "Category updated successfully",
      responseData,
    );
  } catch (error) {
    console.log(error);
    return sendBadRequest(res, "Failed to update category");
  }
};

export const deleteCategory = async (req: any, res: any) => {
  try {
    const id = req.params.id;

    if (!isValidObjectId(id)) {
      return sendBadRequest(res, "Invalid category ID");
    }

    const existingCategory = await Category.findById(id);

    if (!existingCategory) {
      return sendBadRequest(res, "Category not found");
    }

    await Category.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });

    return sendSuccessResponse(res, "Category deleted successfully");
  } catch (error) {
    console.log(error);

    return sendBadRequest(res, "Failed to delete category");
  }
};
