import mongoose from "mongoose";

export const isValidObjectId = (id: string) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const hasEmptyValue = (data: any) => {
  return Object.values(data).some(
    (value) => typeof value === "string" && value.trim() === ""
  );
};


// export const validateObjectId = (id: any): string | null => {
//   if (typeof id !== "string" || !id) {
//     return "Address ID is required";
//   }

//   if (!mongoose.isValidObjectId(id)) {
//     return "Invalid address ID";
//   }

//   return null;
// };