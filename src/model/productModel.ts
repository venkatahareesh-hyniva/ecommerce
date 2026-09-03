import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
     createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productName: {
    type: String,
    required: true
    },
    description: {
      type: String,
      required: true
    },
    shortdescription: String,
    price: Number,
    discountPrice: Number,
    stock_quantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    brand_id: Number,

    images: {
      type: [String],
      default: undefined,
    },
    thumbnail: String,
    videos: {
      type: [String],
      default: undefined,
    },
    attributes: {
      type: mongoose.Schema.Types.Mixed,
    },
    variants: {
      type: mongoose.Schema.Types.Mixed,
    },
    rating: {
      average: Number,
      total_reviews: Number,
    },
    isDeleted:{
      type: Boolean,
      default: false,
      select:false,
    },
  //  createdBy: String,
  //  updatedBy: String,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
const Product = mongoose.model("Product", productSchema);
export default Product;
