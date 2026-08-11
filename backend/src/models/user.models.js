const mongoose=require("mongoose");

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
    address: {
        type: [String],
        required: true,
    },
    role:{
        type:String,
        enum:["User","Admin"],
        default:"User"
    }
},{timestamps:true})

const User=mongoose.model("user",Userschema);
module.exports=User;