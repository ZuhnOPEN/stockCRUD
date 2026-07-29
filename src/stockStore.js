// Client-side API-backed store for products
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'

const normalize = (doc) => ({
  id: String(doc._id ?? doc.id),
  name: String(doc.name),
  quantity: Number(doc.quantity),
  price: Number(doc.price),
})

export async function fetchProducts(state) {
  const res = await fetch(`${API_BASE}/products`)
  if (!res.ok) throw new Error('Failed to fetch products')
  const data = await res.json()
  state.splice(0, state.length, ...data.map(normalize))
  return state
}

export async function createProduct(state, product) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

export async function updateProduct(state, id, updates) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
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

export async function deleteProduct(state, id) {
  const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Failed to delete product')
  }
  const idx = state.findIndex((s) => String(s.id) === String(id))
  if (idx !== -1) state.splice(idx, 1)
  return true
}
