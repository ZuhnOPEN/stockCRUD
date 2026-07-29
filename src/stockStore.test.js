import test from 'node:test'
import assert from 'node:assert/strict'
import { createProduct, updateProduct, deleteProduct } from './stockStore.js'

test('createProduct agrega un producto con id y datos válidos', () => {
  const state = []
  const product = createProduct(state, { name: 'Café', quantity: 10, price: 2500 })

  assert.equal(product.name, 'Café')
  assert.equal(product.quantity, 10)
  assert.equal(product.price, 2500)
  assert.equal(state.length, 1)
  assert.equal(state[0].id, product.id)
})

test('updateProduct modifica un producto existente', () => {
  const state = [{ id: 1, name: 'Azúcar', quantity: 5, price: 1800 }]
  const updated = updateProduct(state, 1, { quantity: 12, price: 2000 })

  assert.equal(updated.quantity, 12)
  assert.equal(updated.price, 2000)
  assert.equal(state[0].quantity, 12)
})

test('deleteProduct elimina el elemento indicado', () => {
  const state = [{ id: 1, name: 'Pan', quantity: 4, price: 1200 }]
  const removed = deleteProduct(state, 1)

  assert.equal(removed, true)
  assert.equal(state.length, 0)
})
