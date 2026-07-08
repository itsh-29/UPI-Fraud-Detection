import express from "express";
import { createTransaction,getAllTransactions } from "../controllers/transactionController.js";

const router = express.Router();

router.post("/",createTransaction);
router.get("/",getAllTransactions);

export{router};