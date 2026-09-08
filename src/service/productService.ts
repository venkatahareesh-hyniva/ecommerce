import Product from "../model/productModel.js";

class ProductService {
  // CREATE PRODUCT
  async createProduct(productData: any, user: any): Promise<any> {
    const {
      productName,
      description,
      price,
      stock_quantity,
      categoryId,
      images,
      videos,
    } = productData;

    const trimmedProductName = productName.trim();

    // Check only active products
    const existingProduct = await Product.findOne({
      productName: trimmedProductName,
      isDeleted: false,
    });

    // Active product already exists
    if (existingProduct) {
      return {
        type: "exists",
        data: null,
      };
    }

    // Create a NEW product
    // even if an old product with the same name was deleted
    const product = await Product.create({
      productName: trimmedProductName,
      description,
      price,
      stock_quantity,
      categoryId,
      images,
      videos,
      createdBy: user._id,
      updatedBy: user._id,
    });

    const responseData: any = product.toObject();


    delete responseData.createdBy;
    delete responseData.updatedBy;
    delete responseData.isDeleted;
    delete responseData.__v;

    return {
      type: "created",
      data: responseData,
    };
  }

  
  async updateProduct(
    productId: string,
    productData: any,
    user: any,
  ): Promise<any> {
    const {
      productName,
      description,
      price,
      stock_quantity,
      categoryId,
      images = [],
      videos = [],
      deleteImages = [],
      deleteVideos = [],
      ...data
    } = productData;

    const existingProduct = await Product.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!existingProduct) {
      return {
        type: "notFound",
        data: null,
      };
    }

   
    if (existingProduct.createdBy.toString() !== user._id.toString()) {
      return {
        type: "notOwner",
        data: null,
      };
    }

   
    if (productName !== undefined) {
      if (productName.trim() !== existingProduct.productName.trim()) {
        return {
          type: "nameChange",
          data: null,
        };
      }
    }

   
    if (categoryId !== undefined) {
      if (
        !existingProduct.categoryId ||
        existingProduct.categoryId.toString() !== categoryId.toString()
      ) {
        return {
          type: "categoryChange",
          data: null,
        };
      }
    }

    const updateData: any = {
      updatedBy: user._id,
    };

    
    if (description !== undefined) {
      updateData.description = description;
    }

    
    if (price !== undefined) {
      updateData.price = price;
    }

   
    if (stock_quantity !== undefined) {
      updateData.stock_quantity = stock_quantity;
    }

   
    if (Object.keys(data).length > 0) {
      Object.assign(updateData, data);
    }

   
    await Product.findOneAndUpdate(
      {
        _id: productId,
        isDeleted: false,
      },
      {
        $set: updateData,
      },
    );

    
    const mediaData: any = {};

    if (images.length > 0) {
      mediaData.images = {
        $each: images,
      };
    }

    if (videos.length > 0) {
      mediaData.videos = {
        $each: videos,
      };
    }

    if (Object.keys(mediaData).length > 0) {
      await Product.findOneAndUpdate(
        {
          _id: productId,
          isDeleted: false,
        },
        {
          $addToSet: mediaData,
        },
      );
    }

    
    if (deleteImages.length > 0 || deleteVideos.length > 0) {
      const pullData: any = {};

      if (deleteImages.length > 0) {
        pullData.images = {
          $in: deleteImages,
        };
      }

      if (deleteVideos.length > 0) {
        pullData.videos = {
          $in: deleteVideos,
        };
      }

      await Product.findOneAndUpdate(
        {
          _id: productId,
          isDeleted: false,
        },
        {
          $pull: pullData,
        },
      );
    }

   
    const updatedProduct = await Product.findOne({
      _id: productId,
      isDeleted: false,
    }).select("-createdBy -updatedBy -__v -isDeleted");

    return {
      type: "updated",
      data: updatedProduct,
    };
  }


  async deleteProduct(productId: string, user: any): Promise<any> {
    const existingProduct = await Product.findOne({
      _id: productId,
      isDeleted: false,
    });

    if (!existingProduct) {
      return {
        type: "notFound",
        data: null,
      };
    }

    if (existingProduct.createdBy.toString() !== user._id.toString()) {
      return {
        type: "notOwner",
        data: null,
      };
    }

    await Product.findByIdAndUpdate(productId, {
      $set: {
        isDeleted: true,
      },
    });

    return {
      type: "deleted",
      data: null,
    };
  }
}

export default new ProductService();
