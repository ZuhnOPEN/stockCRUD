const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'

const normalizeProduct = (doc) => ({
  id: String(doc._id ?? doc.id),
  name: doc.name,
  quantity: Number(doc.quantity),
  price: Number(doc.price),
})

export async function fetchProducts(state) {
  const response = await fetch(`${API_BASE}/products`)
  if (!response.ok) {
    throw new Error('No se pudieron cargar los productos.')
  }

  const products = await response.json()
  state.splice(0, state.length, ...products.map(normalizeProduct))
  return state
}

export async function createProduct(state, product) {
  const response = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: product.name,
      quantity: Number(product.quantity),
      price: Number(product.price),
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'No se pudo crear el producto.')
  }

  const created = normalizeProduct(await response.json())
  state.push(created)
  return created
}

export async function updateProduct(state, id, updates) {
  const response = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: updates.name,
      quantity: Number(updates.quantity),
      price: Number(updates.price),
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'No se pudo actualizar el producto.')
  }

  const updated = normalizeProduct(await response.json())
  const index = state.findIndex((item) => String(item.id) === String(id))
  if (index !== -1) {
    state.splice(index, 1, updated)
  }
  return updated
}

export async function deleteProduct(state, id) {
  const response = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || 'No se pudo eliminar el producto.')
  }

  const index = state.findIndex((item) => String(item.id) === String(id))
  if (index !== -1) {
    state.splice(index, 1)
  }
  return true
}
