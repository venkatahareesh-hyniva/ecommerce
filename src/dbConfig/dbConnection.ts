import mongoose from "mongoose";

const connectdb = async () => {
  try {
    const mongo_url = process.env.MONGO_URI || "";
    await mongoose.connect(mongo_url);

    console.log("MongoDB connected");
  } catch (error: any) {
    console.log("MongoDb connection Error:", error);
  }
};
export default connectdb;
