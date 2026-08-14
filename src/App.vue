<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import AuthPage from './components/AuthPage.vue'
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  loginUser,
  registerUser,
} from './stockStore.js'

// Product CRUD state
const products = ref([])
const form = ref({ name: '', quantity: '', price: '' })
const editingId = ref(null)
const loading = ref(false)

// Auth state
const authForm = ref({ name: '', email: '', password: '' })
const authMode = ref('login')
const authError = ref('')
const token = ref(localStorage.getItem('jwt_token') || '')
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

const isAuthenticated = computed(() => Boolean(token.value && user.value))
const isEditing = computed(() => editingId.value !== null)

const resetForm = () => {
  form.value = { name: '', quantity: '', price: '' }
  editingId.value = null
}

const resetAuthForm = () => {
  authForm.value = { name: '', email: '', password: '' }
  authError.value = ''
}

const saveSession = (session) => {
  token.value = session.token
  user.value = session.user
  localStorage.setItem('jwt_token', session.token)
  localStorage.setItem('user', JSON.stringify(session.user))
}

const clearSession = () => {
  token.value = ''
  user.value = null
  localStorage.removeItem('jwt_token')
  localStorage.removeItem('user')
  products.value = []
  resetForm()
}

const loadProducts = async () => {
  if (!token.value) return
  loading.value = true
  try {
    await fetchProducts(products, token.value)
  } catch (err) {
    console.error('Carga inicial de productos falló:', err)
    if (err.message.includes('Unauthorized') || err.message.includes('token')) {
      clearSession()
    }
  } finally {
    loading.value = false
  }
}

const submitProduct = async () => {
  const name = form.value.name.trim()
  const quantity = Number(form.value.quantity)
  const price = Number(form.value.price)

  if (!name || Number.isNaN(quantity) || quantity < 1 || Number.isNaN(price) || price < 0) {
    return
  }

  loading.value = true
  try {
    if (editingId.value !== null) {
      await updateProduct(products.value, editingId.value, { name, quantity, price }, token.value)
    } else {
      await createProduct(products.value, { name, quantity, price }, token.value)
    }
    resetForm()
  } catch (err) {
    console.error(err)
    alert(err.message || 'Error al guardar')
  } finally {
    loading.value = false
  }
}

const editProduct = (product) => {
  form.value = {
    name: product.name,
    quantity: String(product.quantity),
    price: String(product.price),
  }
  editingId.value = product.id
}

const removeProduct = async (id) => {
  if (!confirm('¿Eliminar este producto?')) return
  loading.value = true
  try {
    await deleteProduct(products.value, id, token.value)
    if (editingId.value === id) resetForm()
  } catch (err) {
    console.error(err)
    alert(err.message || 'Error al eliminar')
  } finally {
    loading.value = false
  }
}

const submitAuth = async () => {
  authError.value = ''
  const { name, email, password } = authForm.value

  if (!email.trim() || !password.trim() || (authMode.value === 'register' && !name.trim())) {
    authError.value = 'Completa los datos requeridos'
    return
  }

  loading.value = true
  try {
    if (authMode.value === 'register') {
      await registerUser({ name: name.trim(), email: email.trim(), password: password.trim() })
      const session = await loginUser({ email: email.trim(), password: password.trim() })
      saveSession(session)
    } else {
      const session = await loginUser({ email: email.trim(), password: password.trim() })
      saveSession(session)
    }
    resetAuthForm()
    await loadProducts()
  } catch (err) {
    authError.value = err.message || 'Error de autenticación'
  } finally {
    loading.value = false
  }
}

const logout = () => {
  clearSession()
}

const totalValue = computed(() =>
  products.value.reduce((sum, product) => sum + product.quantity * product.price, 0),
)

// Theme handling: 'light' or 'dark'
const theme = ref(
  localStorage.getItem('theme') ||
    (typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'),
)

onMounted(async () => {
  document.documentElement.classList.toggle('dark', theme.value === 'dark')
  await loadProducts()
})

watch(theme, (val) => {
  document.documentElement.classList.toggle('dark', val === 'dark')
  try {
    localStorage.setItem('theme', val)
  } catch (e) {
    // ignore storage errors
  }
})

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}

const themeEmoji = computed(() => (theme.value === 'dark' ? '🌚' : '☀️'))
const themeLabel = computed(() => (theme.value === 'dark' ? 'Oscuro' : 'Claro'))
</script>

<template>
  <main class="page">
    <section class="card">
      <header class="header">
        <div>
          <p class="eyebrow">Stock CRUD</p>
          <h1>Gestión de inventario</h1>
          <p class="subhead">
            <template v-if="isAuthenticated">
              Hola, {{ user.name }} — tus productos son persistentes y solo visibles para ti.
            </template>
            <template v-else>
              Inicia sesión o regístrate para comenzar a guardar tus productos.
            </template>
          </p>
        </div>

        <div class="header-controls">
          <div class="summary">
            <span>{{ products.length }} productos</span>
            <strong>${{ totalValue.toLocaleString('es-CL') }}</strong>
          </div>

          <button
            class="theme-toggle"
            type="button"
            @click="toggleTheme"
            :aria-pressed="theme === 'dark'"
            :title="`Tema: ${themeLabel}`"
          >
            <span class="emoji">{{ themeEmoji }}</span>
            <span class="visually-hidden">Cambiar tema</span>
          </button>
        </div>
      </header>

      <template v-if="!isAuthenticated">
        <AuthPage
          :auth-mode="authMode"
          :auth-form="authForm"
          :auth-error="authError"
          :loading="loading"
          :products-count="products.length"
          :total-value="totalValue"
          :theme="theme"
          @toggle-mode="(mode) => (authMode = mode)"
          @toggle-theme="toggleTheme"
          @submit-auth="submitAuth"
        />
      </template>

      <template v-else>
        <div class="user-actions">
          <span class="user-label">Usuario: {{ user.email }}</span>
          <button type="button" class="secondary" @click="logout">Cerrar sesión</button>
        </div>

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
            <input v-model="form.price" type="number" min="0" step="0" placeholder="2500" />
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
      </template>
    </section>
  </main>
</template>

<style scoped>
:global(:root) {
  --bg: #f3f4f6;
  --card-bg: #ffffff;
  --text: #0f172a;
  --muted: #64748b;
  --primary: #2563eb;
  --secondary: #64748b;
  --danger: #dc2626;
  --border: #e2e8f0;
  --eyebrow: #4f46e5;
  --shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

:global(.dark) {
  --bg: #0b1220;
  --card-bg: #0f1724;
  --text: #e6eef8;
  --muted: #9aa6b2;
  --primary: #60a5fa;
  --secondary: #94a3b8;
  --danger: #fb7185;
  --border: #1f2937;
  --eyebrow: #7c3aed;
  --shadow: 0 10px 30px rgba(2, 6, 23, 0.7);
}

:global(body) {
  margin: 0;
  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  background: var(--bg);
  color: var(--text);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

body::before {
  content: 'Aire';
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: clamp(4rem, 12vw, 8rem);
  font-weight: 800;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: rgba(148, 163, 184, 0.16);
  pointer-events: none;
  user-select: none;
  z-index: 0;
  filter: blur(1px);
}

.page {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
}

.card {
  width: min(1024px, 100%);
  background: transparent;
  border-radius: 24px;
  padding: 0;
  box-shadow: none;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.eyebrow {
  margin: 0 0 0.25rem;
  color: var(--eyebrow);
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
  color: var(--muted);
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
  color: var(--text);
}

input {
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text);
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
  background: var(--primary);
  color: white;
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 8px;
}

.theme-toggle .emoji {
  font-size: 1.05rem;
}

.secondary {
  background: var(--secondary);
  color: white;
}

.danger {
  background: var(--danger);
  color: white;
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
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.9rem 1rem;
  gap: 1rem;
}

.meta {
  color: var(--muted);
  margin-top: 0.25rem;
}

.empty {
  color: var(--muted);
  margin: 0;
}

.visually-hidden {
  position: absolute !important;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap;
}
</style>
