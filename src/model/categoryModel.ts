import mongoose from "mongoose";
const categorySchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: {
        type: String,
      },
      role: {
        type: String,
      },
    },
    categoryName: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    images: {
      type: [String],
      default: [],
    },
    videos: [String],
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    timestamps: true,
    
  },
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
