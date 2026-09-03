import jwt from "jsonwebtoken";
import User from "../model/userModel.js";

export const optionalAuthMiddleware = async (req: any, res: any,  next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return next();
    }
    const token = authHeader.split(" ")[1];

    if (!token) {
      return next();
    }

    const decoded: any = jwt.verify(token,process.env.JWT_SECRET as string);
    const user = await User.findById(decoded.Id);

    if (!user) {
        return next();
    }

    if (user.status !== "active") {
      return next();
    }
      req.user = user;
    
    next();
  } catch (error) {
    next();
  }
};