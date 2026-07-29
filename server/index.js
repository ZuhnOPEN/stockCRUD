require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const Product = require('./models/Product')

const app = express()
app.use(cors())
app.use(express.json())

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://randolfgameplays23_db_user:pHFbg1qM5jwkL1DM@stockcrud.3bc66rd.mongodb.net/?'
const PORT = process.env.PORT || 4000
const appName = process.env.APP_NAME || 'stockCRUD'

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  })

// Routes
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
