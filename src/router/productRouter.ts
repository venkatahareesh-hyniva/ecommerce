import express from "express";

import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controller/productController.js";

import {
  validateCreateProduct,
  validateUpdateProduct,
} from "../validator/product.validator.js";

import { authMiddleware } from "../middleware/authmiddleware.js";
import { authorizeRoles} from "../middleware/rolemiddleware.js";
import { ROLES } from "../config/config.js";

const productRouter = express.Router();

productRouter.post("/",authMiddleware, authorizeRoles([ROLES.DEALER]), validateCreateProduct, createProduct);

productRouter.patch("/:productId",authMiddleware, authorizeRoles([ROLES.DEALER]), validateUpdateProduct,updateProduct);

productRouter.delete("/:productId",authMiddleware, authorizeRoles([ROLES.DEALER]), deleteProduct);



export default productRouter;
