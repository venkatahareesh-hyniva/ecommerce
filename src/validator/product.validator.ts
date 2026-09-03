import Category from "../model/categoryModel.js";
import { sendBadRequest, sendNotFound } from "../utils/response-utils.js";
import { isValidObjectId } from "../utils/validation-utils.js";

export const validateCreateProduct = async (req: any, res: any, next: any) => {
  const { productName, description, price, stock_quantity, categoryId } = req.body;

  let errorMessage: string = "";

  if (typeof productName !== "string" || !productName.trim() ) {
    // return sendBadRequest(res, "Not a valid product name !");
    errorMessage = "Not a valid product name !"
  }

  if (typeof description !== "string" || !description.trim()) {
    errorMessage = "Product description cannot be empty";
  }

  if (typeof price !== "number" || price <= 0) {
    errorMessage = "Price must be greater than 0";
  }

   if (stock_quantity === undefined || stock_quantity < 0)  {
    errorMessage = "Stock cannot be negative";
  }

  if (typeof categoryId !== "string" || !categoryId.trim()) {
    errorMessage = "CategoryId cannot be empty";
  }

  if (!isValidObjectId(categoryId)) {
    errorMessage = "Invalid category ID";
  }
  
  if(errorMessage) {
    return sendBadRequest(res, errorMessage);
  }

  const category = await fetchCategoryDetailsByCategoryId(categoryId);
  if (!category) return sendNotFound(res, "Category not found");

  next();
};

export const validateUpdateProduct = (req: any, res: any, next: any) => {
  const {
    name,
    description,
    price,
    stock,
    categoryId,
    images,
    videos,
    deleteImages,
    deleteVideos,
    ...data
  } = req.body;

  if (name !== undefined && (typeof name !== "string" || name.trim() === "")) {
    return sendBadRequest(res, "Product name cannot be empty");
  }

  if (
    description !== undefined &&
    (typeof description !== "string" || description.trim() === "")
  ) {
    return sendBadRequest(res, "Product description cannot be empty");
  }

  if (price !== undefined && (typeof price !== "number" || price <= 0)) {
    return sendBadRequest(res, "Price must be greater than 0");
  }

  if (stock !== undefined && (typeof stock !== "number" || stock < 0)) {
    return sendBadRequest(res, "Stock cannot be negative");
  }

  if (
    categoryId !== undefined &&
    (typeof categoryId !== "string" || categoryId.trim() === "")
  ) {
    return sendBadRequest(res, "CategoryId cannot be empty");
  }

  if (
    Object.values(data).some(
      (value) => typeof value === "string" && value.trim() === "",
    )
  ) {
    return sendBadRequest(res, "Fields cannot be empty");
  }

  next();
};

const fetchCategoryDetailsByCategoryId = async (categoryId: string) => {
  return await Category.findOne({
    _id: categoryId,
    isDeleted: false,
  });
};
