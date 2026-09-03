import express from "express";

import {
  approveDealer,
  rejectDealer,
  getUsers,
} from "../controller/adminController.js";

const adminRouter = express.Router();

adminRouter.get("/users", getUsers);
adminRouter.put("/dealer/:dealerId/approve", approveDealer);
adminRouter.put("/dealer/:dealerId/reject", rejectDealer);

export default adminRouter;
