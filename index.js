const express = require('express')
require('dotenv').config()
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express()
const port = 3000

 //  middleware
 app.use(cors())
 app.use(express.json())


 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pl15o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function bootstrap() {
  try {
    await client.connect();
    const database = client.db("online-embassy-one")
    const UsersCollection = database.collection("Users")


    // users get from database
    app.get('/users', async (req,res) =>{
        const query = {};
        const users = await UsersCollection.find(query).toArray();
        res.send(users)

    })


    // make user admin
    app.put('/users/admin/:id', async (req, res) => {
      console.log("route matched");
      
    })


    // user post from frontend to database

      app.post('/users', async (req, res) => {
        const user = req.body;
        const result = await UsersCollection.insertOne(user)
        res.send(result)
        })



    
  } finally {
//    await client.close();
  }
}
bootstrap().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello visa embassy!')
})

app.listen(port, () => {
  console.log(`visa embassy app listening on port ${port}`)
})