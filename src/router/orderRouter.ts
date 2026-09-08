import express, { Router } from "express";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { authorizeRoles } from "../middleware/rolemiddleware.js";
import { cancelOrder, cancelOrderItems, checkout, getOrderById, getOrders } from "../controller/orderController.js";
import { ROLES } from "../config/config.js";


const orderRouter = express.Router();
orderRouter.post("/", authMiddleware, authorizeRoles([ROLES.USER]), checkout);
orderRouter.get("/",authMiddleware,authorizeRoles([ROLES.USER]) ,getOrders);
orderRouter.get("/:id",authMiddleware,authorizeRoles([ROLES.USER,ROLES.DEALER]) ,getOrderById);
orderRouter.delete("/:orderId",authMiddleware,authorizeRoles([ROLES.USER,ROLES.DEALER]) ,cancelOrder);
orderRouter.delete("/:orderId/cancelItems",authMiddleware,authorizeRoles([ROLES.USER,ROLES.DEALER]) ,cancelOrderItems);


export default orderRouter;