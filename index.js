const express = require('express')
require('dotenv').config()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
    const appoinmentServicesCollection = database.collection("appointments")

    // service option 
     app.get('/appointmentServices', async (req, res) => {
      const query = {};
      const result = await appoinmentServicesCollection.find(query).toArray();
      res.send(result)
     })


    // users get from database
    app.get('/users', async (req, res) => {
      const query = {};
      const users = await UsersCollection.find(query).toArray();
      res.send(users)

    })
    // is admin chek
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = {email: email}
      const user = await UsersCollection.findOne(query);
      res.send({isAdmin: user?.role === 'admin'})
      

    })

    // make user admin / update with set role
    app.put('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const option = { upsert: true }
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await UsersCollection.updateOne(filter, updatedDoc, option);
      res.send(result)

    })


    // user post from frontend to database

    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await UsersCollection.insertOne(user)
      res.send(result)
    })

    app.delete('/users/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await UsersCollection.deleteOne(query)
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