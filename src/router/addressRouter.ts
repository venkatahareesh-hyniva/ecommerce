import express from "express";

import {
  createAddress,
  getAddresses,
  getAddressById,
  deleteAddress,
  updateAddress,
} from "../controller/addressController.js";

import { authMiddleware } from "../middleware/authmiddleware.js";
import { authorizeRoles } from "../middleware/rolemiddleware.js";

const addressRouter = express.Router();

addressRouter.post("/me/address",createAddress);

addressRouter.get("/me/addresses",getAddresses);

addressRouter.put("/me/address/:addressId",updateAddress);

addressRouter.get("/me/address/:addressId",getAddressById);

addressRouter.delete("/me/address/:addressId",deleteAddress);

export default addressRouter;
