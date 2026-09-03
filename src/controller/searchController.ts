import mongoose from "mongoose";
import Product from "../model/productModel.js";
import {
  sendBadRequest,
  sendInternalServerError,
  sendNotFound,
  sendSuccessResponse,
} from "../utils/response-utils.js";
import { isValidObjectId } from "../utils/validation-utils.js";

export const searchProducts = async (req: any, res: any) => {
  try {
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = req.query;

    const { id } = req.params;

    const filter: any = {
      isDeleted: false,
    };

    if (id) {
      if (!isValidObjectId(id)) {
        return sendBadRequest(res, "Invalid product ID");
      }

      filter._id = id;
    }

    if (search) {
      filter.productName = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    if (categoryId) {
      if (!isValidObjectId(categoryId)) {
        return sendBadRequest(res, "Invalid category ID");
      }

      filter.categoryId = categoryId;
    }

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        const minimum = Number(minPrice);

        if (isNaN(minimum)) {
          return sendBadRequest(res, "Invalid minimum price");
        }

        filter.price.$gte = minimum;
      }

      if (maxPrice) {
        const maximum = Number(maxPrice);

        if (isNaN(maximum)) {
          return sendBadRequest(res, "Invalid maximum price");
        }

        filter.price.$lte = maximum;
      }
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      return sendBadRequest(res, "Page must be a positive number");
    }

    if (
      !Number.isInteger(limitNumber) ||
      limitNumber < 1 ||
      limitNumber > 100
    ) {
      return sendBadRequest(res, "Limit must be between 1 and 100");
    }

    const skip = (pageNumber - 1) * limitNumber;

    const totalProducts = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .select(
        "productName description price discountPrice stock_quantity categoryId images videos createdBy updatedBy",
      )
      .populate("categoryId", "categoryName description")
      .populate({
        path: "createdBy",
        select: "firstName lastName email -_id",
      })
      .populate({
        path: "updatedBy",
        select: "firstName lastName email -_id",
      })
      .skip(skip)
      .limit(limitNumber);

    if (id) {
      if (products.length === 0) {
        return sendNotFound(res, "Product not found");
      }

      return sendSuccessResponse(
        res,
        "Product fetched successfully",
        products[0],
      );
    }

    const totalPages = Math.ceil(totalProducts / limitNumber);

    return sendSuccessResponse(res, "Products found successfully", {
      products,
      pagination: {
        currentPage: pageNumber,
        limit: limitNumber,
        totalProducts,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.log("Get products error:", error);

    return sendInternalServerError(res, "Failed to get products");
  }
};

//export const getAllProducts = async (req: any, res: any) => {
//   try {
//     const { search, productId, minPrice, maxPrice } = req.query;

//     const filter: any = {
//       isDeleted: false,
//     };

//     if (search) {
//       filter.productName = {
//         $regex: search.trim(),
//         $options: "i",
//       };
//     }

//     if (productId) {
//       if (!mongoose.isValidObjectId(productId)) {
//         return sendBadRequest(res, "Invalid product ID");
//       }

//       filter._id = productId;
//     }

//     if (minPrice || maxPrice) {
//       filter.price = {};

//       if (minPrice) {
//         filter.price.$gte = Number(minPrice);
//       }

//       if (maxPrice) {
//         filter.price.$lte = Number(maxPrice);
//       }
//     }

//     const products = await Product.find(filter)
//       .select(
//         "productName description price discountPrice stock_quantity categoryId images videos createdBy updatedBy",
//       )
//       .populate("categoryId", "categoryName description")
//       .populate({
//         path: "createdBy",
//         select: "firstName -_id",
//       })
//       .populate({
//         path: "updatedBy",
//         select: "firstName -_id",
//       });

//     return sendSuccessResponse(res, "Products found successfully", products);
//   } catch (error) {
//     console.log(error);
//     return sendInternalServerError(res, "Failed to get products");
//   }
//};

//export const getProductById = async (req: any, res: any) => {
//   try {
//     const { id } = req.params;
//     const user = req.user;

//     if (!isValidObjectId(id)) {
//       return sendBadRequest(res, "Invalid product ID");
//     }

//     const filter: any = {
//       _id: id,
//       isDeleted: false,
//     };

//     if (user?.role === "dealer") {
//       filter.createdBy = user._id;
//     }

//     const product = await Product.findOne(filter)
//       .select(
//         "productName description price discountPrice stock_quantity images videos categoryId createdBy updatedBy",
//       )
//       .populate("categoryId", "categoryName description")
//       .populate("createdBy", "firstName lastName email -_id");

//     if (!product) {
//       return sendNotFound(res, "Product not found");
//     }

//     return sendSuccessResponse(res, "Product fetched successfully", product);
//   } catch (error) {
//     console.log(error);
//     return sendInternalServerError(res, "Failed to fetch product");
//   }
//};
