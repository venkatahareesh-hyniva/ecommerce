import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    categoryName: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    images: {
      type: [String],
      default: [],
    },

    videos: {
      type: [String],
      default: [],
    },

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

// Active category names must be unique
// Deleted category names can be reused
CategorySchema.index(
  { categoryName: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  },
);

const Category = mongoose.model("Category", CategorySchema);

export default Category;