import jwt from "jsonwebtoken";

export const generateToken = (user: any): string => {
  return jwt.sign(
    {
      Id: user._id,
      role: user.role,
      userId: user.userId,
      tokenVersion: user.tokenVersion,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1d",
    },
  );
};