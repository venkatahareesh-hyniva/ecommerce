import mongoose from "mongoose";
const cartSchema = new mongoose.Schema(
  {
    userId: String,
    items: [
      {
        _id: false,
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        isSelected: {
          type: Boolean,
          default: true,
        },
        __v: {
          type: Number,
          select: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);
const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
