
import { sendForBiddden, sendUnauthorized } from "../utils/response-utils.js";


export const authorizeRoles = (allowedRoles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return sendUnauthorized(res, "Authentication required");
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendForBiddden(res, "Access denied");
    }

    next();
  };
};