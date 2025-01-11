const express = require('express')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')

const url = process.env.MONGODB_URI

const app = express()

const hostname = process.env.HOSTNAME 
const port = process.env.

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})

let database
let collection

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(url, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  })
  async function run() {
    try {
      await client.connect()

      await client.db("admin").command({ ping: 1 })
      console.log("Pinged your deployment. You successfully connected to MongoDB!")

      database = client.db("db-1")
      collection = database.collection("causes")

    } catch(err) {
      await client.close()
      console.error("Failed to connect to MongoDB:", err.message)
    }
  }
run().catch(console.dir)

app.get('/', (req, res) => {
    res.status(200).send('This is Treasures Terntribe Assessment API')
})

// Retrieve all causes
app.get('/causes', async (req, res) => {
    try {
        const causes = await collection.find().toArray()
        res.json(causes)
    } catch (err) {
        res.status(500).send(err.message)
    }
})

// Create a new cause
app.post('/causes', async (req, res) => {
    try {
        const { title, description, imageURL } = req.body
        
        // Parameters validation
        title && description && imageURL ? null : res.status(400).send('Missing required fields')
        title ? null : res.status(400).send('Missing title')
        description ? null : res.status(400).send('Missing description')
        imageURL ? null : res.status(400).send('Missing imageURL')  

        // Insert cause into collection
        const result = await collection.insertOne({cause: title, description, imageURL})
        res.json(result)

    } catch (err) {
        res.status(500).send(err.message)   
    }
})

// Retrieve a specific cause by id
app.get('/causes/:id', async (req, res) => {
    const { id } = req.params
    try {
        const cause = await collection.findOne({ _id: new ObjectId(id) })
        cause ? res.json(cause) : res.status(404).send('Cause not found')
    } catch (err) {
        res.status(500).send(err.message)   
    }
})

// Update a specific cause
app.put('/causes/:id', async (req, res) => {
    const { id } = req.params
    const { title, description, imageURL } = req.body
    try {
        // Parameters validation
        title && description && imageURL ? null : res.status(400).send('Missing required fields')
        title ? null : res.status(400).send('Missing title')
        description ? null : res.status(400).send('Missing description')
        imageURL ? null : res.status(400).send('Missing imageURL')  

        // Update cause in collection
        const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: { title, description, imageURL } })
        result.matchedCount ? res.json(result) : res.status(404).send('Cause not found')
    } catch (err) {
        res.status(500).send(err.message)   
    }
})

// Delete a cause
app.delete('/causes/:id', async (req, res) => {
    const { id } = req.params
    try {
        const result = await collection.deleteOne({ _id: new ObjectId(id) })
        result.deletedCount ? res.json(result) : res.status(404).send('Cause not found')
    } catch (err) {
        res.status(500).send(err)
    }
})

// Additional endpoint
app.post('/causes/:id/contribute', async (req, res) => {
    const { id } = req.params
    const { name, email, amount } = req.body
    try {

        // Parameters validation
        name && email && amount ? null : res.status(400).send('Missing required fields')
        name ? null : res.status(400).send('Missing name')
        email ? null : res.status(400).send('Missing email')
        amount ? null : res.status(400).send('Missing amount')  

        // Retrieve cause by id   
        const cause = await collection.findOne({ _id: new ObjectId(id) })
        cause.matchedCount ? null : res.status(404).send('Cause not found')

        const contributionCollection = database.collection("contributions")
        const contributions =  { name, email, amount }
        const result = await collection.insertOne({ causeId: new ObjectId(id), contributions })
        res.json(result)
    } catch (err) {
        res.status(500).send(err.message)   
    }
})