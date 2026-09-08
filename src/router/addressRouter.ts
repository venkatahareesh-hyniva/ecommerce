import express from "express";

import {
  createAddress,
  getAddresses,
  getAddressById,
  deleteAddress,
  updateAddress,
} from "../controller/addressController.js";

const addressRouter = express.Router();

addressRouter.post("/me/address",createAddress);

addressRouter.get("/me/addresses",getAddresses);

addressRouter.put("/me/address/:id",updateAddress);

addressRouter.get("/me/address/:id",getAddressById);

addressRouter.delete("/me/address/:id",deleteAddress);

export default addressRouter;
