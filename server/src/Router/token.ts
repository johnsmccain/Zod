import express from "express";
import { allToken, createAccount } from "../Controllers/auth";

const router = express.Router();

router.get("/alltokens", allToken);
router.post("/createtoken", createAccount);

export default router;