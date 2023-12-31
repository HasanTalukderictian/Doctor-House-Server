const express = require('express')
const app = express()
const port = process.env.PORT || 4000;
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// middleware 
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vtmwivk.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    

    const doctorsCollection = client.db("HospitalDB").collection("doctors");
    const booksCollection = client.db("HospitalDB").collection("bookings");


    app.get('/doctors', async(req, res) => {
        const cursor = doctorsCollection.find();
        const result = await cursor.toArray();
        res.send(result);;
    })

    app.get('/doctors/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
    
      try {
        const result = await doctorsCollection.findOne(query);
        res.json({ doctors: result }); // Send the data as an object with the 'doctors' property
      } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      }
    });

    
    app.get('/checkout/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
     
        // Include only the `title` and `imdb` fields in the returned document
        projection: { name: 1, category: 1, price: 1, doctorName:1,visiting_time:1 },
      };
    
    
        const result = await doctorsCollection.findOne(query, options);
        res.send(result) 
     
    });


    // try to fetch specific user data
    
    app.get('/bookings', async(req, res) => {
      // console.log(req.query.email);
      let query = {};
      if(req.query?.email){
          query= {email: req.query.email}
      }
      const result  = await booksCollection.find(query).toArray();
      res.send(result);
    })

    // trying to post data 
    app.post('/bookings', async(req, res) => {
      const bookings = req.body;
      console.log(bookings);
      const result = await booksCollection.insertOne(bookings);
      res.send(result);
    })

    app.delete('/bookings/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await booksCollection.deleteOne(query)
      res.send(result)
    })

    app.put('/bookings/:id', async(req, res) => {
      const updatedBookings = req.body;
      
    })



    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})