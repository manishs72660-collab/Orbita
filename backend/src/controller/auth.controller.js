const User =require("../models/user.models");
const validuser=require("../utils/validator");


const register=async(req,res)=>{
    try{
        const {username,usermail,mobile_num,address,password}=req.body;
        await validuser(req.body); 
        const user=User.findOne({usermail});
        if(user){
            throw new Error("user already exit");
        }
        
        
        
        


        
        




    }catch(error){

    }
}