import express from "express";

import {
  
  getDealerProducts,
  getDealerOrders,
  updateDealerOrderStatus,
  getDealerOrderById} from "../controller/dealerController.js";


const dealerRouter = express.Router();


dealerRouter.get("/products", getDealerProducts);

dealerRouter.get("/orders", getDealerOrders);

dealerRouter.get("/orders/:orderId", getDealerOrderById);

dealerRouter.patch("/orders/:orderId/status", updateDealerOrderStatus);

export default dealerRouter;
