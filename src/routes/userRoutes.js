import express from "express";
import { createUser, getUser,getAllUsers } from "../controllers/userController.js";

const router = express.Router();

router.get("/", getAllUsers);
router.post("/",createUser);
router.get("/:id",getUser);

export{router};