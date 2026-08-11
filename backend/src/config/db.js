const mongoose =require("mongoose");

const main=async()=>{
   await mongoose.connect(process.env.MONGO_URL);
}

module.exports=main;