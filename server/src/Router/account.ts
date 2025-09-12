import express from "express";
import * as authController from "../Controllers/auth";

const router = express.Router();

router.get("/allaccounts", authController.allAccount);
router.post("/createaccount", authController.createAccount);

export default router;