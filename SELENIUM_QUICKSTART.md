# 🚀 Guía Rápida - Tests Selenium (Chrome & Firefox)

## 📋 Checklist de Instalación

- [ ] Node.js v22.18.0+ instalado
- [ ] Chrome O Firefox instalado (o ambos)
- [ ] Proyecto Stock CRUD clonado

## 1️⃣ Instalar Dependencias

```bash
# Opción A: con npm
npm install --save-dev selenium-webdriver chromedriver geckodriver jest

# Opción B: con pnpm
pnpm add -D selenium-webdriver chromedriver geckodriver jest
```

### Verificar que los navegadores están instalados

**Firefox:**

```bash
which firefox
# o en macOS
which /Applications/Firefox.app/Contents/MacOS/firefox
```

**Chrome (opcional, si también quieres usarlo):**

```bash
which google-chrome
# o en macOS
which /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
```

## 2️⃣ Configurar Navegador en `.env.test`

Por defecto está configurado **Firefox**. Puedes cambiar en `.env.test`:

```bash
# Usar Firefox (recomendado)
BROWSER=firefox

# O usar Chrome
BROWSER=chrome
```

## 3️⃣ Iniciar Servidores

En **terminal 1** - Backend:

```bash
npm run dev:backend
```

En **terminal 2** - Frontend:

```bash
npm run dev:frontend
```

Espera a que ambos servidores estén listos.

## 4️⃣ Ejecutar Tests

### Opción 1: Ejecutar todos los tests

```bash
npm run test:selenium
```

### Opción 2: Ver el navegador mientras corre (no headless)

```bash
npm run test:selenium:ui
```

### Opción 3: Solo tests de login

```bash
npm run test:selenium -- loginFlow.test.js
```

### Opción 4: Solo tests de CRUD

```bash
npm run test:selenium -- crudFlow.test.js
```

### Opción 5: En modo watch (re-ejecutar al cambiar archivos)

```bash
npm run test:selenium:watch
```

## 📊 Estructura de Archivos Creados

```
scripts/selenium/
├── config.js                    # Configuración centralizada
├── driver.js                    # Setup de Selenium WebDriver
├── helpers.js                   # Funciones utilitarias
├── tests/
│   ├── loginFlow.test.js        # Tests de autenticación
│   └── crudFlow.test.js         # Tests de productos
└── README.md                    # Documentación completa

.env.test                       # Variables de entorno para tests
jest.config.selenium.js         # Configuración de Jest
```

## 🧪 Tests Disponibles

### Login Flow (3 tests)

✓ Registro exitoso de usuario  
✓ Login exitoso con credenciales válidas  
✓ Logout exitoso

### CRUD Flow (5 tests)

✓ Crear producto  
✓ Leer (listar) productos  
✓ Actualizar producto  
✓ Eliminar producto  
✓ Validar cálculo de valor total

**Total: 8 tests** ⭐

## ⚙️ Configuración Personalizada

En `.env.test`, puedes cambiar:

```bash
# URL de tu app (si no es localhost:5173)
BASE_URL=http://localhost:5173

# URL de API (si no es localhost:4000)
API_URL=http://localhost:4000/api

# Mostrar navegador en pantalla
HEADLESS=false

# Tiempos de espera en ms (aumentar si es lento)
IMPLICIT_WAIT=8000
TIMEOUT=10000
```

## ⚙️ Opciones de Configuración en `.env.test`

```bash
# Navegador: 'firefox' (default) o 'chrome'
BROWSER=firefox

# Modo headless: true (sin interfaz) o false (ver navegador)
HEADLESS=true

# URL de la app
BASE_URL=http://localhost:5173

# URL de API
API_URL=http://localhost:4000/api

# Tiempos de espera en ms
IMPLICIT_WAIT=8000
TIMEOUT=10000
```

## 🎯 Flujo de Uso Recomendado

### Con Firefox (por defecto)

```
1. Iniciar backend: npm run dev:backend
2. Iniciar frontend: npm run dev:frontend
3. En terminal 3: npm run test:selenium
```

### Con Chrome

```
1. Cambiar en .env.test: BROWSER=chrome
2. Iniciar backend y frontend (igual que arriba)
3. En terminal 3: npm run test:selenium
```

### Ver navegador en acción

```
1. npm run test:selenium:ui   (usa Firefox)
   o
   BROWSER=chrome npm run test:selenium:ui  (usa Chrome)
```

## 📈 Resultado Esperado

```
 PASS  scripts/selenium/tests/loginFlow.test.js
 PASS  scripts/selenium/tests/crudFlow.test.js

Test Suites: 2 passed, 2 total
Tests:       8 passed, 8 total
```

## 🐛 Troubleshooting

### Error: "ChromeDriver version mismatch"

```bash
npm install --save-dev chromedriver@latest
```

### Error: "Element not found"

- Aumentar `IMPLICIT_WAIT` en `.env.test` a `15000`
- Usar `HEADLESS=false` para ver qué sucede

### Error: "Cannot connect to server"

- Verificar que backend está en `http://localhost:4000`
- Verificar que frontend está en `http://localhost:5173`
- Esperar 3-5 segundos después de iniciar servidores

### Error: "chrome not found"

- Instalar Chrome: `sudo apt-get install google-chrome-stable` (Linux)
- O indicar ruta: `CHROME_BIN=/usr/bin/chromium-browser npm run test:selenium`

## 📚 Archivos de Referencia

- **helpers.js** - Todas las funciones disponibles
- **config.js** - Configuración centralizada
- **scripts/selenium/README.md** - Documentación completa

## 💡 Tips Útiles

1. **Firefox es más ligero**: Mejor para CI/CD y ejecución continua
2. **Ver navegador en acción**: `HEADLESS=false npm run test:selenium:ui`
3. **Cambiar navegador sin editar**: `BROWSER=chrome npm run test:selenium`
4. **Logs en consola**: Jest muestra todos los logs automáticamente
5. **Screenshots en errores**: Las funciones helper lo hacen automáticamente

## 🚀 Siguiente Paso

Una vez que todos los tests pasen:

1. Elegir navegador preferido (Firefox ✅ o Chrome)
2. Agregar más tests específicos
3. Integrar con CI/CD (GitHub Actions con Firefox)
4. Crear reportes HTML

---

**¿Preguntas?** Revisa:

- `scripts/selenium/README.md` - Documentación completa
- `scripts/selenium/tests/` - Ejemplos de tests
- `scripts/selenium/helpers.js` - Todas las funciones disponibles

¡Listo para empezar! 🎉
