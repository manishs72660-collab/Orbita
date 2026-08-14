const mongoose=require("mongoose");

const addressschema=new mongoose.Schema({
    city:{
        type:String,
        required:true,
    },
    home:{
        type:String,
        required:true,
    },
    pincode:{
        type:String,
        required:true,
    }
})

const Userschema= new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
    usermail:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    mobile_num:{
        type:Number,
        required:true,
        unique:true,
    },
    address:addressschema,
    role:{
        type:String,
        enum:["User","Admin"],
        default:"User"
    }
},{timestamps:true})

const User=mongoose.model("user",Userschema);
module.exports=User;