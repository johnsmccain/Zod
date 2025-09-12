import express from "express";
import cors from "cors";

import userRouter from "./Router/user";
import accountRouter from "./Router/account";
import tokenRouter from "./Router/token";

// MIDDLEWARE
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTES
app.use("/api/v1/users", userRouter);
app.use("/api/v1/accounts", accountRouter);
app.use("/api/v1/tokens", tokenRouter);

export default app;
