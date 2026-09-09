import express from "express";
import {
  createCategory,
  getCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controller/categoryController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import {
  validateCreateCategory,
  validateUpdateCategory,
} from "../validator/category.validator.js";
import { authorizeRoles } from "../middleware/rolemiddleware.js";
import { ROLES } from "../config/config.js";

const categoryRouter = express.Router();

categoryRouter.post("/", authMiddleware,authorizeRoles([ROLES.ADMIN,ROLES.DEALER]), validateCreateCategory, createCategory);
categoryRouter.get("/", getCategory);
categoryRouter.get("/:id", getCategoryById);
categoryRouter.put("/:id", authMiddleware, authorizeRoles([ROLES.ADMIN]),validateUpdateCategory, updateCategory);
categoryRouter.delete("/:id", authMiddleware, authorizeRoles([ROLES.ADMIN]), deleteCategory);

export default categoryRouter;
