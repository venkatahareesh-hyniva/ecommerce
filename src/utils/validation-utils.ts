import mongoose from "mongoose";

export const isValidObjectId = (id: string) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const hasEmptyValue = (data: any) => {
  return Object.values(data).some(
    (value) => typeof value === "string" && value.trim() === ""
  );
};