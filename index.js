const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//midleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kfi6tak.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("chatDB");

    app.post("/user", async (req, res) => {
      const newUser = req.body;
      const userCollection = database.collection("users");
      const result = await userCollection.insertOne(newUser);
      res.send(result);
    });

    app.get("/user/:email", async (req,res)=>{
      const userGmail = req.params.email;
      const chatCollection = database.collection(`${userGmail}`);
      const result = await chatCollection.find().toArray();
      res.send(result)
    })

    app.post("/chat/:user", async (req, res) => {
      const conversation = req.body;
      const chatCollection = database.collection(`${conversation.email}`);
      const adminCollection = database.collection("admin");
      const result = await chatCollection.insertOne(conversation);
      const admin = await adminCollection.insertOne(conversation);
      res.send(result,admin);
    });
   
    app.post("/adminAnswer", async (req, res) => {
      const conversation = req.body;
      const chatCollection = database.collection(`${conversation.email}`);
      // const adminCollection = database.collection("admin");
      const result = await chatCollection.insertOne(conversation);
      // const admin = await adminCollection.insertOne(conversation);
      res.send(result);
    });
   

    app.get("/admin", async (req, res) => {
      const result = await database.collection("admin").find().toArray();
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await database.collection("users").find().toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", function (req, res) {
  res.send("Welocme to Your chat app");
});
app.listen(`${port}`);
