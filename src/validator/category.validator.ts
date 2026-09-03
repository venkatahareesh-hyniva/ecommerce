import { sendBadRequest } from "../utils/response-utils.js";

export const validateCreateCategory = (req: any, res: any, next: any) => {

  const { categoryName, description } = req.body;

  if (!categoryName || !description) {
    return sendBadRequest(res, "CategoryName or description are required");
  }

  if (!categoryName.trim() || !description.trim()) {
    return sendBadRequest(res, "CategoryName or description are required");
  }

  next();
};

export const validateUpdateCategory = (req: any, res: any, next: any) => {
  const {
    categoryName,
    description,
    images,
    videos,
    deleteImages,
    deleteVideos,
    ...data
  } = req.body;

  if (
    description !== undefined &&
    (typeof description !== "string" || !description.trim())
  ) {
    return sendBadRequest(res, "Description cannot be empty");
  }

  if (categoryName !== undefined && (typeof categoryName !== "string" || !categoryName.trim())) {
    return sendBadRequest(res, "Category name cannot be empty");
  }

  if (Object.values(data).some((value) => typeof value === "string" && !value.trim())) {
    return sendBadRequest(res, "Fields cannot be empty");
  }

  next();
};
