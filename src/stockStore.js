let nextId = 1

export const createProduct = (state, product) => {
  const newProduct = {
    id: nextId++,
    name: product.name,
    quantity: Number(product.quantity),
    price: Number(product.price),
  }

  state.push(newProduct)
  return newProduct
}

export const updateProduct = (state, id, updates) => {
  const product = state.find((item) => item.id === id)

  if (!product) {
    return null
  }

  Object.assign(product, {
    ...product,
    ...updates,
    quantity: Number(updates.quantity ?? product.quantity),
    price: Number(updates.price ?? product.price),
  })

  return product
}

export const deleteProduct = (state, id) => {
  const index = state.findIndex((item) => item.id === id)

  if (index === -1) {
    return false
  }

  state.splice(index, 1)
  return true
}
