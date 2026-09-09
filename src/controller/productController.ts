import Product from "../model/productModel.js";
import {
  sendBadRequest,
  sendForBiddden,
  sendInternalServerError,
  sendNotFound,
  sendSuccessResponse,
} from "../utils/response-utils.js";
import { isValidObjectId } from "../utils/validation-utils.js";

// export const createProduct = async (req: any, res: any) => {
//   try {
//     const {
//       productName,
//       description,
//       price,
//       stock_quantity,
//       categoryId,
//       images,
//       videos,
//     } = req.body;
//     const user = req.user;

//     const existingProduct = await Product.findOne({
//       productName: productName.trim(),
//     }).select("+isDeleted");

//     if (existingProduct) {
//       if (existingProduct.isDeleted === true) {
//         existingProduct.isDeleted = false;
//         existingProduct.updatedBy = user._id;
//         await existingProduct.save();

//         return sendSuccessResponse(
//           res,
//           "Product restored successfully",
//           existingProduct,
//         );
//       }
//       return sendBadRequest(res, "Product already exists");
//     }

//     const product = await Product.create({
//       productName: productName.trim(),
//       description,
//       price,
//       stock_quantity,
//       categoryId,
//       images,
//       videos,
//       createdBy: user._id,
//       updatedBy: user._id,
//     });
//     return sendSuccessResponse(res, "Product created successfully", product);
//   } catch (error) {
//     console.log(error);
//     return sendBadRequest(res, "Failed to create product");
//   }
// };

// export const updateProduct = async (req: any, res: any) => {
//   try {
//     const productid = req.params.productId;
//     const loggedInUser = req.user;

//     const {
//       productName,
//       description,
//       price,
//       stock_quantity,
//       categoryId,
//       images = [],
//       videos = [],
//       deleteImages = [],
//       deleteVideos = [],
//       ...data
//     } = req.body;

//     if (!isValidObjectId(productid)) {
//       return sendBadRequest(res, "Invalid product ID");
//     }

//     const existingProduct = await Product.findOne({
//       _id: productid,
//       isDeleted: false,
//     });

//     if (!existingProduct) {
//       return sendBadRequest(res, "Product not found or has been deleted");
//     }

//     if (loggedInUser.role === "dealer") {
//       if (
//         existingProduct.createdBy.toString() !== loggedInUser._id.toString()
//       ) {
//         return sendForBiddden(res, "You can only modify your own products");
//       }
//     }

//     if (productName !== undefined) {
//       if (productName.trim() !== existingProduct.productName.trim()) {
//         return sendBadRequest(res, "Product productName cannot be changed");
//       }
//     }

//     if (categoryId !== undefined) {
//       if (
//         !existingProduct.categoryId ||
//         existingProduct.categoryId.toString() !== categoryId.toString()
//       ) {
//         return sendBadRequest(
//           res,
//           "Category cannot be changed for this product",
//         );
//       }
//     }

//     const updateData: any = {
//       updatedBy: loggedInUser._id,
//     };

//     if (description !== undefined) {
//       updateData.description = description;
//     }

//     if (price !== undefined) {
//       updateData.price = price;
//     }

//     if (stock_quantity !== undefined) {
//       updateData.stock_quantity = stock_quantity;
//     }

//     if (Object.keys(data).length > 0) {
//       Object.assign(updateData, data);
//     }

//     await Product.findOneAndUpdate(
//       {
//         _id: productid,
//         isDeleted: false,
//       },
//       {
//         $set: updateData,
//       },
//     );

//     const mediaData: any = {};

//     if (images.length > 0) {
//       mediaData.images = {
//         $each: images,
//       };
//     }

//     if (videos.length > 0) {
//       mediaData.videos = {
//         $each: videos,
//       };
//     }

//     if (Object.keys(mediaData).length > 0) {
//       await Product.findOneAndUpdate(
//         {
//           _id: productid,
//           isDeleted: false,
//         },
//         {
//           $addToSet: mediaData,
//         },
//       );
//     }

//     if (deleteImages.length > 0 || deleteVideos.length > 0) {
//       const pullData: any = {};

//       if (deleteImages.length > 0) {
//         pullData.images = {
//           $in: deleteImages,
//         };
//       }

//       if (deleteVideos.length > 0) {
//         pullData.videos = {
//           $in: deleteVideos,
//         };
//       }

//       await Product.findOneAndUpdate(
//         {
//           _id: productid,
//           isDeleted: false,
//         },
//         {
//           $pull: pullData,
//         },
//       );
//     }

//     const product = await Product.findOne({
//       _id: productid,
//       isDeleted: false,
//     }).select("-_id -__v -isDeleted");

//     return sendSuccessResponse(res, "Product updated successfully"); // product);
//   } catch (error) {
//     console.log(error);

//     return sendInternalServerError(res, "Failed to update product");
//   }
// };

// export const deleteProduct = async (req: any, res: any) => {
//   try {
//     const productid = req.params.productId;
//     const user = req.user;
//     console.log("Product ID:", productid);

//     if (!isValidObjectId(productid)) {
//       return sendBadRequest(res, "Invalid product ID");
//     }

//     const existingProduct = await Product.findById(productid);

//     if (!existingProduct) {
//       return sendNotFound(res, "Product not found");
//     }

//     if (user.role === "dealer" && existingProduct.createdBy !== user._id) {
//       return sendForBiddden(res, "You can only delete your own products");
//     }

//     await Product.findByIdAndUpdate(productid, {
//       $set: {
//         isDeleted: true,
//       },
//     });

//     return sendSuccessResponse(res, "Product deleted successfully");
//   } catch (error) {
//     console.log(error);

//     return sendInternalServerError(res, "Failed to delete product");
//   }
// };

import productService from "../service/productService.js";


export const createProduct = async (req: any, res: any) => {
  try {
    const {
      productName,
      description,
      price,
      stock_quantity,
      categoryId,
      images,
      videos,
    } = req.body;

    const user = req.user;

    if (!productName) {
      return sendBadRequest(res, "Product name is required");
    }

    const result = await productService.createProduct(
      {
        productName,
        description,
        price,
        stock_quantity,
        categoryId,
        images,
        videos,
      },
      user._id,
    );

    if (result.type === "exists") {
      return sendBadRequest(res, "Product already exists");
    }

    return sendSuccessResponse(
      res,
      "Product created successfully",
      result.data,
    );
  } catch (error) {
    console.log("Create product error:", error);
    return sendBadRequest(res, "Failed to create product");
  }
};


export const updateProduct = async (req: any, res: any) => {
  try {
    const productId = req.params.productId;
    const user = req.user;

    if (!isValidObjectId(productId)) {
      return sendBadRequest(res, "Invalid product ID");
    }

    const result = await productService.updateProduct(
      productId,
      req.body,
      user,
    );

    if (result.type === "notFound") {
      return sendNotFound(res, "Product not found or has been deleted");
    }

    if (result.type === "notOwner") {
      return sendForBiddden(res, "You can only modify your own products");
    }

    if (result.type === "nameChange") {
      return sendBadRequest(res, "Product name cannot be changed");
    }

    if (result.type === "categoryChange") {
      return sendBadRequest(res, "Category cannot be changed for this product");
    }

    return sendSuccessResponse(
      res,
      "Product updated successfully",
      result.data,
    );
  } catch (error) {
    console.log("Update product error:", error);
    return sendInternalServerError(res, "Failed to update product");
  }
};


export const deleteProduct = async (req: any, res: any) => {
  try {
    const productId = req.params.productId;
    const user = req.user;

    if (!isValidObjectId(productId)) {
      return sendBadRequest(res, "Invalid product ID");
    }

    const result = await productService.deleteProduct(productId, user);

    if (result.type === "notFound") {
      return sendNotFound(res, "Product not found");
    }

    if (result.type === "notOwner") {
      return sendForBiddden(res, "You can only delete your own products");
    }

    return sendSuccessResponse(res, "Product deleted successfully");
  } catch (error) {
    console.log("Delete product error:", error);
    return sendInternalServerError(res, "Failed to delete product");
  }
};
