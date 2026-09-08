import express from "express";
import dotenv from "dotenv";
import connectdb from "./dbConfig/dbConnection.js";
import cartRouter from "./router/cartRouter.js";
import categoryRouter from "./router/categoryRouter.js";
import productRouter from "./router/productRouter.js";
import orderRouter from "./router/orderRouter.js";
import authRouter from "./router/authRouter.js";
import addressRouter from "./router/addressRouter.js";
import adminRouter from "./router/adminRouter.js";
import dealerRouter from "./router/dealerRouter.js";
import userRouter from "./router/userRouter.js";
import { authMiddleware } from "./middleware/authmiddleware.js";
import { authorizeRoles } from "./middleware/rolemiddleware.js";
import roleRouter from "./router/roleRouter.js";
import { ROLES } from "./config/config.js";
import searchRouter from "./router/searchRouter.js";


dotenv.config();
const app = express();
app.use(express.json());
connectdb();

app.get("/", (req, res) => {
  res.send("HELLO FROM ECOMMERCE SERVER 7000");
});

//auth
app.use("/api/auth", authRouter);
//admin
app.use("/api/admin",authMiddleware,authorizeRoles([ROLES.ADMIN]),adminRouter)
//dealer
app.use("/api/dealer", authMiddleware, authorizeRoles([ROLES.DEALER]), dealerRouter);
//user
app.use("/api/user", authMiddleware, userRouter);
//category
app.use("/api/categories", categoryRouter);
// product
app.use("/api/products",authMiddleware, authorizeRoles([ROLES.DEALER]), productRouter);
//carts
app.use("/api/cart",authMiddleware, authorizeRoles([ROLES.USER]), cartRouter);
//orders
app.use("/api/orders",authMiddleware, orderRouter)
//address
app.use("/api/users",authMiddleware, authorizeRoles([ROLES.USER]),addressRouter)
//role Management
app.use("/api/roles",roleRouter)
//search
app.use("/api/search",searchRouter)


app.use((req: any, res: any) => {
  return res.status(404).json({
    message: `The requested endpoint ${req.method} ${req.originalUrl} was not found.`,
  });
});

app.listen(7000, () => {
  console.log("Server is running on port 7000");
});
