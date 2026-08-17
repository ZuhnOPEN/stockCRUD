require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Product = require('./models/Product')
const User = require('./models/User')

const app = express()
app.use(cors())
app.use(express.json())

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://randolfgameplays23_db_user:pHFbg1qM5jwkL1DM@stockcrud.3bc66rd.mongodb.net/?'
const PORT = process.env.PORT || 4000
const JWT_SECRET = process.env.JWT_SECRET || 'secretDiscoveredCRUD'

const memoryDb = {
  users: [],
  products: [],
}
let dbMode = 'mongo'

const toObjectId = (value) => (typeof value === 'string' ? value : String(value))

const normalizeMemoryUser = (user) => ({
  _id: user.id,
  id: String(user.id),
  name: user.name,
  email: user.email.toLowerCase(),
  password: user.password,
  createdAt: user.createdAt || new Date().toISOString(),
})

const normalizeMemoryProduct = (product) => ({
  _id: product.id,
  id: String(product.id),
  owner: product.owner,
  name: product.name,
  quantity: Number(product.quantity),
  price: Number(product.price),
  createdAt: product.createdAt || new Date().toISOString(),
})

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

const buildMemoryReply = (user) => ({
  token: jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' }),
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
  },
})

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB')
    dbMode = 'mongo'
  })
  .catch((err) => {
    console.warn('MongoDB connection failed. Falling back to in-memory QA store:', err.message)
    dbMode = 'memory'
  })

const findUserInMemory = async (email) => {
  const normalizedEmail = String(email || '')
    .trim()
    .toLowerCase()
  return memoryDb.users.find((user) => user.email.toLowerCase() === normalizedEmail) || null
}

const findProductsInMemory = (ownerId) =>
  memoryDb.products.filter((product) => String(product.owner) === String(ownerId))

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' })
    }

    if (dbMode === 'memory') {
      const existingUser = await findUserInMemory(email)
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' })
      }

      const hashedPassword = await bcrypt.hash(password, 10)
      const user = {
        id: `mem-user-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        name: name.trim(),
        email: String(email).trim().toLowerCase(),
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      }
      memoryDb.users.push(user)

      return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = new User({ name, email, password: hashedPassword })
    const savedUser = await user.save()

    res.status(201).json({
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      createdAt: savedUser.createdAt,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    if (dbMode === 'memory') {
      const user = await findUserInMemory(email)
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const passwordMatches = await bcrypt.compare(password, user.password)
      if (!passwordMatches) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      return res.json(buildMemoryReply(user))
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const passwordMatches = await bcrypt.compare(password, user.password)
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h',
    })

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Product routes
app.get('/api/products', authenticate, async (req, res) => {
  try {
    if (dbMode === 'memory') {
      const products = findProductsInMemory(req.user.userId).map(normalizeMemoryProduct)
      return res.json(products)
    }

    const products = await Product.find({ owner: req.user.userId }).sort({ createdAt: -1 })
    res.json(products)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

app.post('/api/products', authenticate, async (req, res) => {
  try {
    const { name, quantity, price } = req.body

    if (dbMode === 'memory') {
      const product = {
        id: `mem-product-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        owner: req.user.userId,
        name: String(name).trim(),
        quantity: Number(quantity),
        price: Number(price),
        createdAt: new Date().toISOString(),
      }
      memoryDb.products.push(product)
      return res.status(201).json(normalizeMemoryProduct(product))
    }

    const product = new Product({ owner: req.user.userId, name, quantity, price })
    const saved = await product.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.put('/api/products/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    if (dbMode === 'memory') {
      const index = memoryDb.products.findIndex(
        (product) =>
          String(product.id) === String(id) && String(product.owner) === String(req.user.userId),
      )
      if (index === -1) {
        return res.status(404).json({ error: 'Not found' })
      }

      memoryDb.products[index] = {
        ...memoryDb.products[index],
        ...updates,
        quantity: Number(updates.quantity ?? memoryDb.products[index].quantity),
        price: Number(updates.price ?? memoryDb.products[index].price),
      }

      return res.json(normalizeMemoryProduct(memoryDb.products[index]))
    }

    const updated = await Product.findOneAndUpdate({ _id: id, owner: req.user.userId }, updates, {
      new: true,
    })
    if (!updated) return res.status(404).json({ error: 'Not found' })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.delete('/api/products/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params

    if (dbMode === 'memory') {
      const before = memoryDb.products.length
      memoryDb.products = memoryDb.products.filter(
        (product) =>
          !(String(product.id) === String(id) && String(product.owner) === String(req.user.userId)),
      )

      if (memoryDb.products.length === before) {
        return res.status(404).json({ error: 'Not found' })
      }
      return res.json({ success: true })
    }

    const deleted = await Product.findOneAndDelete({ _id: id, owner: req.user.userId })
    if (!deleted) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT} in ${dbMode} mode`)
})
