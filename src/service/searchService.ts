import Product from "../model/productModel.js";

export const searchProductsService = async (
  filter: any,
  skip: number,
  limit: number,
) => {
  const totalProducts = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .select(
      "productName description price discountPrice stock_quantity categoryId images videos",
    )
    .populate("categoryId", "categoryName description")
    .skip(skip)
    .limit(limit);

  return {
    products,
    totalProducts,
  };
};