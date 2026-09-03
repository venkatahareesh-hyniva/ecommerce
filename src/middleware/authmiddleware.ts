import jwt from "jsonwebtoken";
import User from "../model/userModel.js";
import { sendForBiddden, sendUnauthorized } from "../utils/response-utils.js";

export const authMiddleware = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return sendUnauthorized(res, "Authentication token is required");
    }
    if (!authHeader.startsWith("Bearer ")) {
      return sendUnauthorized(res, "Bearer token is required");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return sendUnauthorized(res, "Authentication token is required");
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const user = await User.findById(decoded.Id).select("-password -__v");

    if (!user) {
      return sendUnauthorized(res, "User associated with token not found ");
    }
    if (user.status !== "active") {
      return sendForBiddden(res, `User account is ${user.status}`);
    }
    if (decoded.tokenVersion !== user.tokenVersion) {
      return sendUnauthorized(
        res,
        "Token is no longer valid. Please login again",
      );
    }

    req.user = user;

    console.log("Logged in user:", req.user);
    console.log("User role:", req.user.role);
    next();
  } catch (error) {
    console.log("JWT error:", error);
    return sendUnauthorized(res, "Invalid or expired token");
  }
};
