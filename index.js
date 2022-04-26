const express = require('express');
const cors = require("cors");
var jwt = require('jsonwebtoken');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000
// middleware
app.use(cors())
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_KEY}@cluster0.utysy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{
        await client.connect();
        const database = client.db("genius").collection("service");
        const databaseOrderCollection = client.db("genius").collection("order");

        // auth
        app.post("/login", async (req, res)=>{
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn: "1d"})
            res.send({accessToken})
        })
         // services api
        app.get("/service", async (req, res)=>{
            const query = {};
        const cursor = database.find(query);
        const services = await cursor.toArray();
        res.send(services)
        })

        app.get("/service/:id", async (req, res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)}
            const service = await database.findOne(query);
            res.send(service )
        })

        app.post("/service", async(req, res)=>{
            const newService = req.body;
            const result = await database.insertOne(newService);
            res.send(result);
        })

        app.delete("/service/:id", async (req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await database.deleteOne(query);
            res.send(result)
        })
        // order collection api
        app.post("/order", async(req, res)=>{
            const authHeader = req.headers.authorization;
            console.log(authHeader);
            const order = req.body;
            const result = await databaseOrderCollection.insertOne(order);
            res.send(result);
        })
        
        app.get("/order",async (req, res)=>{
            const query = {};
            const order = databaseOrderCollection.find(query);
            const orderServices = await order.toArray();
            res.send(orderServices);
        })
       

    }finally{

}}

run().catch(console.dir);
app.get("/", (req, res)=>{
    res.send("server runing")
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })

//   complete