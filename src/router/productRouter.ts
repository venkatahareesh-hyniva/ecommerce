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

const productRouter = express.Router();

productRouter.post("/", validateCreateProduct, createProduct);

productRouter.patch("/:productId", validateUpdateProduct,updateProduct);

productRouter.delete("/:productId", deleteProduct);



export default productRouter;
