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
const elasticClient = require("./src/config/elasticsearch");
const { ensureProductIndex } = require("./src/config/Elasticproduct.service");
const cors=require("cors");
const app=express();




async function testElasticSearch() {
    try {
        const response = await elasticClient.info();
        console.log(response);
        await ensureProductIndex(); // creates the "products" index if it doesn't exist yet
    } catch (error) {
        console.error("Elasticsearch connection failed:", error);
    }
}




app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieparser());
app.use("/auth",authrouter);
app.use("/product", productrouter);
app.use("/cart",cartrouter);




const PORT=process.env.PORT || 3000;
const Initializationconnectiom=async()=>{
   try{
        await Promise.all([client.connect(), main(),testElasticSearch()]);
        console.log("DB connected");
        app.listen(PORT,()=>{
            console.log(`server listen at ${PORT}`);
        })
   }catch(error){
      console.log(error.message);
   }
}

Initializationconnectiom();