const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(__dirname, '.env') })

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const Product = require('./models/Product')

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 4000
const rawUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stockcrud'

let MONGODB_URI = rawUri
try {
  const hasDbPath = /mongodb(?:\+srv)?:\/\/[^/]+\/.+/.test(rawUri)
  if (!hasDbPath) {
    if (rawUri.includes('?')) {
      MONGODB_URI = rawUri.replace('?', '/stockcrud?')
    } else {
      MONGODB_URI = rawUri.endsWith('/') ? `${rawUri}stockcrud` : `${rawUri}/stockcrud`
    }
  }
} catch {
  MONGODB_URI = rawUri
}

const maskUri = (uri) => uri.replace(/:\/\/(.*?:).*?@/, '://$1****@')
console.log('Using MongoDB URI:', maskUri(MONGODB_URI))

const connectToMongo = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      family: 4,
    })

    console.log('Connected to MongoDB')
    console.log('MongoDB database:', mongoose.connection.name)
  } catch (err) {
    console.error('MongoDB connection error')
    console.error('name:', err.name)
    console.error('message:', err.message)
    if (err.reason) console.error('reason:', err.reason)
    if (err.code) console.error('code:', err.code)
    if (err.codeName) console.error('codeName:', err.codeName)
    process.exit(1)
  }
}

connectToMongo()

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    mongoState: mongoose.connection.readyState,
    database: mongoose.connection.name || null,
  })
})

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 })
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

app.post('/api/products', async (req, res) => {
  try {
    const { name, quantity, price } = req.body
    const product = new Product({ name, quantity, price })
    const saved = await product.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body
    const updated = await Product.findByIdAndUpdate(id, updates, { new: true })
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Product.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
