import express from "express";

import {
  approveDealer,
  rejectDealer,
  getUsers,
  activateDealer,
  deactivateDealer,
  getAllProductsForAdmin,
  getProductByIdForAdmin,
} from "../controller/adminController.js";

const adminRouter = express.Router();

adminRouter.get("/users", getUsers);
adminRouter.get("/products", getAllProductsForAdmin);
adminRouter.get("/products/:productId", getProductByIdForAdmin);
adminRouter.put("/dealers/:dealerId/approve", approveDealer);
adminRouter.put("/dealers/:dealerId/reject", rejectDealer);
adminRouter.put("/dealers/:dealerId/deactivate", deactivateDealer);
adminRouter.put("/dealers/:dealerId/activate", activateDealer);

export default adminRouter;
