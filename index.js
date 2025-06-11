const express = require('express')
require('dotenv').config()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const fileUpload = require('express-fileupload');

const app = express()
const port = 3000

//  middleware
app.use(cors())
app.use(express.json())
app.use(fileUpload());



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
    const serviceCollection = database.collection("services")
    const UsersCollection = database.collection("Users")
    const bookingCollection = database.collection("bookings")
    const appointmentItemCollection = database.collection("appointmentItems")
     
    app.get('/all-services', async (req,res) => {
      const query = {};
      const result = await serviceCollection.find(query).toArray();
      res.send(result)
    })


    app.post('/add-service', async (req, res) =>{
      const name = req.body.name;
      const description = req.body.description;
       const pic = req.files.image;
       const picData = pic.data
       const encodePic = picData.toString('base64')
       const imageBuffer = Buffer.from(encodePic, 'base64')

       const service = {
        name,
        des: description,
        image: imageBuffer
       }

       const result = await serviceCollection.insertOne(service)
       res.send(result)
  
    })




    // service option 
    app.get('/appointmentItemsServices', async (req, res) => {
      const date = req.query.date;
      const query = {};
      const options = await appointmentItemCollection.find(query).toArray();
      // get all booking of the frontend provided date

      const bookingQuery = {appointmentDate: date}
      const alreadyBooked = await bookingCollection.find(bookingQuery).toArray();
      

      options.forEach(option => {
        const optionBooked = alreadyBooked.filter(book => book.serviceName === option.name);
        const bookedSlots = optionBooked.map(booked => booked.slot);
        const remainingSlots = option.slots.filter(slot => !bookedSlots.includes(slot))
        option.slots = remainingSlots
        
        })
        res.send( options)
       })


       app.get("/bookings", async (req, res) =>{
        const email = req.query.email;
        const query = {email: email}
        const bookings =await bookingCollection.find(query).toArray();
        res.send(bookings)
        

       })


    app.post('/bookings', async(req,res)=>{
      const bookings = req.body;
     console.log(bookings);
  
      

      const query = {
      appointmentDate:bookings.appointmentDate,
      email:bookings.email,
      serviceNname:bookings.serviceNname
      }
      

      const alreadyBooked = await bookingCollection.find(query).toArray();
      if (alreadyBooked.length){
        const message = `you already have a booking on ${bookings.
          appointmentDate}, please try another service`;
          return res.send({acknowledged:false,message })
      }
      const result = await bookingCollection.insertOne( bookings);
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