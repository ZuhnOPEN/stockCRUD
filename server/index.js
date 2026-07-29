require('dotenv').config()
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

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
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
