import { User } from "../models/User.js";

async function createUser(req, res) {
  const { name } = req.body;
  const user = await User.create({name});
  res.status(201).json(user);
}


async function getUser(req,res){
  const {id} = req.params;
  const user = await User.findById(id);
  if(user === null){
    return res.status(404).json({error:"User is not found"});
  }
  res.status(200).json(user);

}
export{createUser,getUser};