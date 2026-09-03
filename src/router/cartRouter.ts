import express from "express";
import { addToCart, clearCart, getCart, removeCartItem, updateCartItem } from "../controller/cartController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { authorizeRoles } from "../middleware/rolemiddleware.js";
import { ROLES } from "../config/config.js";

const cartRouter = express.Router();

cartRouter.post("/",authMiddleware,authorizeRoles([ROLES.USER]), addToCart);
cartRouter.get("/",authMiddleware,authorizeRoles([ROLES.USER]), getCart);
cartRouter.patch("/:productId",authMiddleware, authorizeRoles([ROLES.USER]), updateCartItem);
cartRouter.delete("/remove",authMiddleware, authorizeRoles([ROLES.USER]), removeCartItem);
cartRouter.delete("/",authMiddleware, authorizeRoles([ROLES.USER]), clearCart);

export default cartRouter;
