<script setup>
import { computed, ref } from 'vue'
import { createProduct, updateProduct, deleteProduct } from './stockStore.js'

const products = ref([])
const form = ref({ name: '', quantity: '', price: '' })
const editingId = ref(null)

const resetForm = () => {
  form.value = { name: '', quantity: '', price: '' }
  editingId.value = null
}

const submitProduct = () => {
  const name = form.value.name.trim()
  const quantity = Number(form.value.quantity)
  const price = Number(form.value.price)

  if (!name || Number.isNaN(quantity) || quantity < 1 || Number.isNaN(price) || price < 0) {
    return
  }

  if (editingId.value !== null) {
    updateProduct(products.value, editingId.value, { name, quantity, price })
  } else {
    createProduct(products.value, { name, quantity, price })
  }

  resetForm()
}

const editProduct = (product) => {
  form.value = {
    name: product.name,
    quantity: String(product.quantity),
    price: String(product.price),
  }
  editingId.value = product.id
}

const removeProduct = (id) => {
  deleteProduct(products.value, id)

  if (editingId.value === id) {
    resetForm()
  }
}

const totalValue = computed(() =>
  products.value.reduce((sum, product) => sum + product.quantity * product.price, 0),
)

const isEditing = computed(() => editingId.value !== null)
</script>

<template>
  <main class="page">
    <section class="card">
      <header class="header">
        <div>
          <p class="eyebrow">Stock CRUD</p>
          <h1>Gestión de inventario</h1>
        </div>
        <div class="summary">
          <span>{{ products.length }} productos</span>
          <strong>${{ totalValue.toLocaleString('es-CL') }}</strong>
        </div>
      </header>

      <form class="form" @submit.prevent="submitProduct">
        <label>
          Nombre
          <input v-model="form.name" placeholder="Ej. Café" />
        </label>

        <label>
          Cantidad
          <input v-model="form.quantity" type="number" min="1" placeholder="10" />
        </label>

        <label>
          Precio
          <input v-model="form.price" type="number" min="0" step="100" placeholder="2500" />
        </label>

        <div class="actions-row">
          <button type="submit">
            {{ isEditing ? 'Guardar producto' : 'Agregar producto' }}
          </button>
          <button v-if="isEditing" type="button" class="secondary" @click="resetForm">
            Cancelar
          </button>
        </div>
      </form>

      <ul v-if="products.length" class="list">
        <li v-for="product in products" :key="product.id" class="item">
          <div>
            <strong>{{ product.name }}</strong>
            <div class="meta">Cantidad: {{ product.quantity }}</div>
            <div class="meta">Precio: ${{ product.price.toLocaleString('es-CL') }}</div>
          </div>

          <div class="row-actions">
            <button type="button" @click="editProduct(product)">Editar</button>
            <button type="button" class="danger" @click="removeProduct(product.id)">
              Eliminar
            </button>
          </div>
        </li>
      </ul>

      <p v-else class="empty">Aún no hay productos registrados.</p>
    </section>
  </main>
</template>

<style scoped>
:global(body) {
  margin: 0;
  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  background: #f3f4f6;
}

.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
}

.card {
  width: min(720px, 100%);
  background: #ffffff;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.eyebrow {
  margin: 0 0 0.25rem;
  color: #4f46e5;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
}

.summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
  color: #475569;
}

.form {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

label {
  display: grid;
  gap: 0.35rem;
  font-weight: 600;
  color: #0f172a;
}

input {
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.actions-row,
.row-actions {
  display: flex;
  gap: 0.5rem;
}

button {
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #2563eb;
  color: white;
}

.secondary {
  background: #64748b;
}

.danger {
  background: #dc2626;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.75rem;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.9rem 1rem;
  gap: 1rem;
}

.meta {
  color: #64748b;
  margin-top: 0.25rem;
}

.empty {
  color: #64748b;
  margin: 0;
}
</style>
