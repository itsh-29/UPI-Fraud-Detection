import express from "express";
import { router as transactionRoutes } from "./routes/transactionRoutes.js";
import { router as userRoutes } from "./routes/userRoutes.js";

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.use("/transactions",transactionRoutes);
app.use("/users",userRoutes);




export{app};