import { User } from "../models/User.js";

async function createUser(req, res) {
  const { name } = req.body;
  const user = await User.create({name});
  res.status(201).json(user);
}

export{createUser};