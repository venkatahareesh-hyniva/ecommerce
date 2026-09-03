import { ROLES } from "../config/config.js";
import {
  sendInternalServerError,
  sendSuccessResponse,
} from "../utils/response-utils.js";

export const getAllRoles = async (req: any, res: any) => {
  try {
    return sendSuccessResponse(res, "Roles fetched successfully", ROLES);
  } catch (error) {
    console.log("Get all roles error:", error);
    return sendInternalServerError(res, "Failed to fetch roles");
  }
};
