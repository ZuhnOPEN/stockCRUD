// Client-side API-backed store for products and auth
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'

const normalize = (doc) => ({
  id: String(doc._id ?? doc.id),
  name: String(doc.name),
  quantity: Number(doc.quantity),
  price: Number(doc.price),
})

const buildHeaders = (token, contentType = true) => {
  const headers = {}
  if (contentType) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

export async function fetchProducts(state, token) {
  const res = await fetch(`${API_BASE}/products`, {
    headers: buildHeaders(token, false),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to fetch products')
  }
  const data = await res.json()
  state.splice(0, state.length, ...data.map(normalize))
  return state
}

export async function createProduct(state, product, token) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify({
      name: product.name,
      quantity: Number(product.quantity),
      price: Number(product.price),
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to create product')
  }

  const data = await res.json()
  const p = normalize(data)
  state.push(p)
  return p
}

export async function updateProduct(state, id, updates, token) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: buildHeaders(token),
    body: JSON.stringify(updates),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to update product')
  }

  const data = await res.json()
  const p = normalize(data)
  const idx = state.findIndex((s) => String(s.id) === String(id))
  if (idx !== -1) state.splice(idx, 1, p)
  return p
}

export async function deleteProduct(state, id, token) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(token, false),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to delete product')
  }
  const idx = state.findIndex((s) => String(s.id) === String(id))
  if (idx !== -1) state.splice(idx, 1)
  return true
}

export async function registerUser(credentials) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: buildHeaders(null),
    body: JSON.stringify(credentials),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to register')
  }

  return res.json()
}

export async function loginUser(credentials) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: buildHeaders(null),
    body: JSON.stringify(credentials),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to login')
  }

  return res.json()
}
