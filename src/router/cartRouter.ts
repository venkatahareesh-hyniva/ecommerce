import express from "express";
import { addToCart, clearCart, getCart, removeCartItem, updateCartItem } from "../controller/cartController.js";

import { ROLES } from "../config/config.js";

const cartRouter = express.Router();

cartRouter.post("/", addToCart);
cartRouter.get("/", getCart);
cartRouter.patch("/", updateCartItem);
cartRouter.delete("/remove", removeCartItem);
cartRouter.delete("/", clearCart);

export default cartRouter;
