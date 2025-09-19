import express from "express";
import { allToken, addToken } from "../Controllers/auth";

const router = express.Router();

router.get("/alltokens", allToken);
router.post("/createtoken", addToken);

export default router;