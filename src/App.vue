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

const getUserStorageKey = () => {
  const currentUser = user.value || JSON.parse(localStorage.getItem('user') || 'null')
  return currentUser?.id ? `stockcrud_products_${currentUser.id}` : 'stockcrud_products_guest'
}

const saveProductsToLocalStorage = () => {
  if (!user.value?.id) return
  const payload = JSON.parse(localStorage.getItem('stockcrud_products') || '{}')
  payload[user.value.id] = products.value
  localStorage.setItem('stockcrud_products', JSON.stringify(payload))
}

const loadProductsFromLocalStorage = () => {
  if (!user.value?.id) return []

  try {
    const payload = JSON.parse(localStorage.getItem('stockcrud_products') || '{}')
    const savedProducts = payload[user.value.id] || []
    products.value = savedProducts.map((product) => ({
      id: String(product.id ?? product._id),
      name: String(product.name),
      quantity: Number(product.quantity),
      price: Number(product.price),
    }))
    return products.value
  } catch (error) {
    console.error('No se pudieron leer los productos guardados:', error)
    return []
  }
}

const saveSession = (session) => {
  token.value = session.token
  user.value = session.user
  localStorage.setItem('jwt_token', session.token)
  localStorage.setItem('user', JSON.stringify(session.user))
  loadProductsFromLocalStorage()
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

  const cachedProducts = loadProductsFromLocalStorage()
  if (cachedProducts.length) {
    products.value = cachedProducts
  }

  loading.value = true
  try {
    await fetchProducts(products, token.value)
    saveProductsToLocalStorage()
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
    saveProductsToLocalStorage()
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
    saveProductsToLocalStorage()
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

<script>
const scrollToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}
</script>

<template>
  <main class="page">
    <section class="landing-hero">
      <div class="landing-copy">
        <p class="eyebrow">Stock CRUD</p>
        <h1>Gestiona tu inventario con claridad y velocidad.</h1>
        <p class="subtitle">Controla productos, precios y stock en una sola plataforma.</p>
        <p class="support-text">
          Organiza tu negocio con un sistema simple, seguro y pensado para mantener cada
          actualización al día.
        </p>
        <div class="cta-row">
          <button type="button" @click="scrollToSection('login')" class="primary-cta">Comenzar</button>
          <button type="button" class="secondary-cta">Ver demo</button>
        </div>
      </div>

      <div class="hero-shot" aria-label="Vista previa del panel de inventario">
        <div class="hero-panel">
          <div class="hero-topbar">
            <span class="chip active">Inventario</span>
          </div>

          <div class="hero-metrics">
            <div class="metric-box">
              <span>Productos</span>
              <strong>128</strong>
            </div>
            <div class="metric-box highlighted">
              <span>Valor total</span>
              <strong>$1.4M</strong>
            </div>
          </div>

          <div class="hero-list">
            <div class="hero-item">
              <div>
                <strong>Café Premium</strong>
                <small>Stock: 24</small>
              </div>
              <span>$18.000</span>
            </div>
            <div class="hero-item">
              <div>
                <strong>Galletas Artesanales</strong>
                <small>Stock: 16</small>
              </div>
              <span>$9.500</span>
            </div>
            <div class="hero-item">
              <div>
                <strong>Jabón Herbal</strong>
                <small>Stock: 32</small>
              </div>
              <span>$7.200</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <header class="header">
        <div>
          <section id="login">
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
          </section>
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
        <div v-if="loading && !products.length" class="products-loading" aria-live="polite">
          <div class="spinner" aria-hidden="true"></div>
          <div>
            <strong>Cargando tus productos...</strong>
            <p>Estamos trayendo tu inventario personal.</p>
          </div>
        </div>

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
  gap: 2rem;
}

.landing-hero {
  width: min(1200px, 100%);
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  align-items: center;
  gap: 2rem;
  padding: 1rem 0;
}

.landing-copy {
  display: grid;
  gap: 1rem;
}

.landing-copy h1 {
  margin: 0;
  font-size: clamp(2.5rem, 5vw, 4.4rem);
  line-height: 1.04;
  letter-spacing: -0.06em;
  color: var(--text);
}

.subtitle {
  margin: 0;
  font-size: clamp(1.05rem, 1.5vw, 1.35rem);
  color: var(--muted);
  max-width: 38rem;
}

.support-text {
  margin: 0;
  max-width: 36rem;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.7;
}

.cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.primary-cta,
.secondary-cta {
  padding: 0.9rem 1.2rem;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  cursor: pointer;
}

.primary-cta {
  background: linear-gradient(135deg, var(--primary), var(--eyebrow));
  color: rgb(0, 0, 0);
}

.secondary-cta {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
}

.hero-shot {
  display: flex;
  justify-content: center;
}

.hero-panel {
  width: min(100%, 480px);
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 1.25rem;
  box-shadow: var(--shadow);
  backdrop-filter: blur(8px);
}

:global(.dark) .hero-panel {
  background: rgba(15, 23, 36, 0.8);
}

.hero-topbar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.chip {
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.12);
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 700;
}

.chip.active {
  background: rgba(37, 99, 235, 0.12);
  color: var(--primary);
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.metric-box {
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 0.9rem;
  display: grid;
  gap: 0.25rem;
}

.metric-box span {
  color: var(--muted);
  font-size: 0.76rem;
}

.metric-box strong {
  color: var(--text);
  font-size: 1.2rem;
}

.metric-box.highlighted {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(124, 58, 237, 0.12));
}

.hero-list {
  display: grid;
  gap: 0.75rem;
}

.hero-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: rgba(148, 163, 184, 0.06);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.8rem 0.9rem;
}

.hero-item strong {
  display: block;
  color: var(--text);
  margin-bottom: 0.15rem;
}

.hero-item small {
  color: var(--muted);
}

.hero-item span {
  color: var(--primary);
  font-weight: 700;
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

.products-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem 1rem;
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid var(--border);
  border-radius: 16px;
  color: var(--text);
}

.products-loading strong {
  display: block;
  margin-bottom: 0.2rem;
}

.products-loading p {
  margin: 0;
  color: var(--muted);
}

.spinner {
  width: 2.25rem;
  height: 2.25rem;
  border: 3px solid rgba(148, 163, 184, 0.3);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
