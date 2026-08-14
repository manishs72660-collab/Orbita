const dotenv=require("dotenv");
dotenv.config();
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);
const express=require("express");
const main=require("./src/config/db");
const client=require("./src/config/redis");
const authrouter=require("./src/routes/auth.routes");
const cookieparser=require("cookie-parser");
const productrouter=require("./src/routes/product.routes");
const cartrouter=require("./src/routes/Cart.routes");
const cors=require("cors");
const app=express();


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieparser());
app.use("/auth",authrouter);
app.use("/product", productrouter);
app.use("/cart",cartrouter);




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