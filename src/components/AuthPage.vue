<script setup>
import { computed } from 'vue'

const props = defineProps({
  authMode: {
    type: String,
    default: 'login',
  },
  authForm: {
    type: Object,
    required: true,
  },
  authError: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  productsCount: {
    type: Number,
    default: 0,
  },
  totalValue: {
    type: Number,
    default: 0,
  },
  theme: {
    type: String,
    default: 'light',
  },
})

const emit = defineEmits(['submit-auth', 'toggle-mode', 'toggle-theme'])

const isDark = computed(() => props.theme === 'dark')
const formatCurrency = (value) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(value || 0)
</script>

<template>
  <section class="auth-shell">
    <div class="auth-layout">
      <aside class="brand-panel">
        <span class="eyebrow">Stock CRUD</span>
        <h1>{{ authMode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta' }}</h1>
        <p class="intro">
          {{
            authMode === 'login'
              ? 'Accede a tu inventario, revisa stock y gestiona tus productos en un solo lugar.'
              : 'Regístrate para empezar a controlar precios, cantidades y ventas con mayor claridad.'
          }}
        </p>

        <div class="stats-grid">
          <div class="stat-box">
            <span>Productos</span>
            <strong>{{ productsCount }}</strong>
          </div>
          <div class="stat-box">
            <span>Inventario</span>
            <strong>{{ formatCurrency(totalValue) }}</strong>
          </div>
        </div>
      </aside>

      <div class="auth-card">
        <div class="auth-header">
          <div class="mini-brand">
            <span class="dot"></span>
            <span>Stock CRUD</span>
          </div>

        <!--  <button
            class="theme-toggle"
            type="button"
            :aria-pressed="isDark"
            @click="$emit('toggle-theme')"
          >
            <span>{{ isDark ? '☀️' : '🌙' }}</span>
          </button>
          -->
        </div>

        <div class="auth-switch" role="tablist" aria-label="Modo de autenticación">
          <button
            type="button"
            :class="{ active: authMode === 'login' }"
            @click="$emit('toggle-mode', 'login')"
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            :class="{ active: authMode === 'register' }"
            @click="$emit('toggle-mode', 'register')"
          >
            Registrarse
          </button>
        </div>

        <form class="auth-form" @submit.prevent="$emit('submit-auth')">
          <label v-if="authMode === 'register'">
            Nombre
            <input v-model="authForm.name" placeholder="Tu nombre" />
          </label>

          <label>
            Correo
            <input v-model="authForm.email" type="email" placeholder="correo@ejemplo.com" />
          </label>

          <label>
            Contraseña
            <input v-model="authForm.password" type="password" placeholder="********" />
          </label>

          <p v-if="authError" class="auth-error">{{ authError }}</p>

          <button type="submit" class="primary-button" :disabled="loading">
            {{
              loading
                ? 'Procesando...'
                : authMode === 'register'
                  ? 'Crear cuenta'
                  : 'Iniciar sesión'
            }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
:global(:root) {
  --bg: #f3f4f6;
  --card-bg: #ffffff;
  --panel-bg: #eef3ff;
  --text: #0f172a;
  --muted: #64748b;
  --primary: #2563eb;
  --primary-soft: rgba(37, 99, 235, 0.12);
  --secondary: #64748b;
  --border: #e2e8f0;
  --eyebrow: #4f46e5;
  --shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

:global(.dark) {
  --bg: #0b1220;
  --card-bg: #0f1724;
  --panel-bg: rgba(59, 130, 246, 0.12);
  --text: #e6eef8;
  --muted: #9aa6b2;
  --primary: #60a5fa;
  --primary-soft: rgba(96, 165, 250, 0.14);
  --secondary: #94a3b8;
  --border: #1f2937;
  --eyebrow: #7c3aed;
  --shadow: 0 10px 30px rgba(2, 6, 23, 0.7);
}

.auth-shell {
  width: min(1024px, 100%);
  padding: 1rem;
}

.auth-layout {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: var(--shadow);
}

.brand-panel {
  background: linear-gradient(135deg, var(--panel-bg), rgba(255, 255, 255, 0.05));
  padding: 2.5rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.eyebrow {
  margin: 0 0 0.75rem;
  color: var(--eyebrow);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.brand-panel h1 {
  margin: 0;
  font-size: clamp(2rem, 3vw, 3rem);
  line-height: 1.1;
  color: var(--text);
}

.intro {
  margin: 1rem 0 1.5rem;
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.7;
  max-width: 34rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.stat-box {
  background: rgba(255, 255, 255, 0.28);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1rem;
  display: grid;
  gap: 0.35rem;
}

.stat-box span {
  color: var(--muted);
  font-size: 0.8rem;
}

.stat-box strong {
  font-size: 1.1rem;
  color: var(--text);
}

.auth-card {
  background: var(--card-bg);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.auth-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.mini-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--muted);
}

.dot {
  width: 0.7rem;
  height: 0.7rem;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--eyebrow));
  display: inline-block;
}

.theme-toggle {
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  border-radius: 10px;
  width: 2.5rem;
  height: 2.5rem;
  display: inline-grid;
  place-items: center;
  cursor: pointer;
}

.auth-switch {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  background: rgba(148, 163, 184, 0.12);
  border-radius: 12px;
  padding: 0.3rem;
  margin-bottom: 1.25rem;
}

.auth-switch button {
  border: none;
  background: transparent;
  color: var(--muted);
  border-radius: 10px;
  padding: 0.8rem 1rem;
  font-weight: 700;
  cursor: pointer;
}

.auth-switch .active {
  background: var(--card-bg);
  color: var(--text);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
}

.auth-form {
  display: grid;
  gap: 1rem;
}

label {
  display: grid;
  gap: 0.45rem;
  font-weight: 600;
  color: var(--text);
}

input {
  width: 100%;
  padding: 0.82rem 0.9rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  box-sizing: border-box;
}

.primary-button {
  background: var(--primary);
  border: none;
  color: white;
  border-radius: 12px;
  padding: 0.85rem 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.primary-button:disabled {
  opacity: 0.7;
  cursor: wait;
}

.auth-error {
  margin: 0;
  color: #dc2626;
  font-size: 0.88rem;
  font-weight: 600;
}

@media (max-width: 840px) {
  .auth-layout {
    grid-template-columns: 1fr;
  }

  .brand-panel {
    padding-bottom: 1.5rem;
  }
}
</style>
