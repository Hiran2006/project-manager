import { Router } from "express";

const route = Router()

route.get("/",(req,res)=>{
    res.json({success:true,message:"Server is Working"});
})

export default route