import express from "express";
import dotenv from "dotenv";
import connectDB from "./Configs/ConnectDB.js";
import authRouter from "./Routes/auth.route.js";
import cookieParser from "cookie-parser";
dotenv.config();
import cors from "cors";
import userRouter from "./Routes/user.route.js";
import assistantRouter from "./Routes/assistant.route.js";
import billingRouter from "./Routes/billing.route.js";

const app = express();
const privateCors = cors({
  origin: ["https://shifraai-198v.onrender.com"],

  credentials: true,
});

const publicCors = cors({
  origin: "*",

  credentials: true,
});

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json("hello from server");
});

app.use("/api/auth", privateCors, authRouter);
app.use("/api/user", privateCors, userRouter);
app.use("/api/assistant", publicCors, assistantRouter);
app.use("/api/billing", privateCors, billingRouter);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
  connectDB();
});
