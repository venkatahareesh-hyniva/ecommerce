import Category from "../model/categoryModel.js";

class CategoryService {
  
  async createCategory(categoryData: any, user: any): Promise<any> {
    const { categoryName, description, images, videos } = categoryData;
    const trimmedCategoryName = categoryName.trim();

    const existingCategory = await Category.findOne({
      categoryName: trimmedCategoryName,
      isDeleted: false,
    });

    if (existingCategory) {
      return {
        type: "exists",
        data: null,
      };
    }
    const category = await Category.create({
      categoryName: trimmedCategoryName,
      description,
      images,
      videos,
      createdBy: user._id,
    });

    const responseData: any = category.toObject();
    delete responseData.isDeleted;
    delete responseData.__v;

    responseData.createdBy = {
      name: user.firstName,
    };

    return {
      type: "created",
      data: responseData,
    };
  }

 
  async getCategories(): Promise<any> {
    const categories = await Category.find({
      isDeleted: false,
    })
      .select("categoryName description images createdBy")
      .populate({
        path: "createdBy",
        select: "-_id firstName role",
      });

    return categories;
  }

 
  async getCategoryById(id: string): Promise<any> {
    const category = await Category.findOne({
      _id: id,
      isDeleted: false,
    })
      .select("categoryName description images videos createdBy")
      .populate({
        path: "createdBy",
        select: "-_id firstName role",
      });

    return category;
  }

  
  async updateCategory(id: string, categoryData: any, user: any): Promise<any> {
    const {
      categoryName,
      description,
      images,
      videos,
      deleteImages = [],
      deleteVideos = [],
    } = categoryData;

    const existingCategory = await Category.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!existingCategory) {
      return {
        type: "notFound",
        data: null,
      };
    }

    if (existingCategory.createdBy.toString() !== user._id.toString()) {
      return {
        type: "notOwner",
        data: null,
      };
    }

    if (categoryName !== undefined) {
      if (categoryName.trim() !== existingCategory.categoryName.trim()) {
        return {
          type: "nameChange",
          data: null,
        };
      }
    }

      if (description !== undefined) {
      existingCategory.description = description.trim();
    }

      if (images?.length > 0) {
      const duplicateImage = images.find((image: string) =>
        existingCategory.images.includes(image),
      );

      if (duplicateImage) {
        return {
          type: "duplicateImage",
          data: duplicateImage,
        };
      }

      existingCategory.images.push(...images);
    }

      if (videos?.length > 0) {
      existingCategory.videos.push(...videos);
    }

      if (deleteImages.length > 0) {
      existingCategory.images = existingCategory.images.filter(
        (image: string) => !deleteImages.includes(image),
      );
    }

    if (deleteVideos.length > 0) {
      existingCategory.videos = existingCategory.videos.filter(
        (video: string) => !deleteVideos.includes(video),
      );
    }

    existingCategory.updatedBy = user._id;
    await existingCategory.save();

    const responseData: any = existingCategory.toObject();

    delete responseData.createdBy;
    delete responseData.updatedBy;
    delete responseData.isDeleted;
    delete responseData.__v;

    return {
      type: "updated",
      data: responseData,
    };
  }
  
  async deleteCategory(id: string): Promise<boolean> {
    const existingCategory = await Category.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!existingCategory) {
      return false;
    }

    await Category.findByIdAndUpdate(id, {
      $set: {
        isDeleted: true,
      },
    });

    return true;
  }
}

export default new CategoryService();
