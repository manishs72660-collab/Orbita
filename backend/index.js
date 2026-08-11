const dotenv=require("dotenv");
dotenv.config();
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
const express=require("express");
const main=require("./src/config/db");
const client=require("./src/config/redis");



const app=express();

const PORT=process.env.PORT;
const Initializationconnectiom=async()=>{
   try{
        await Promise.all([client.connect(), main()]);
        console.log("DB connected");
        app.listen(PORT,()=>{
            console.log(`server listen at ${PORT}`);
        })
   }catch(error){
      console.log(error.message);
   }
}

Initializationconnectiom();