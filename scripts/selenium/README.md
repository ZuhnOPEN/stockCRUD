# Tests Automatizados con Selenium - Stock CRUD

Este directorio contiene tests de QA automatizados para validar los flujos principales de la aplicación Stock CRUD.

## 📋 Estructura

```
scripts/selenium/
├── config.js              # Configuración centralizada
├── driver.js              # Setup del driver de Selenium
├── helpers.js             # Utilidades y funciones comunes
├── tests/
│   ├── loginFlow.test.js  # Tests del flujo de autenticación
│   └── crudFlow.test.js   # Tests del CRUD de productos
└── README.md
```

## 🔧 Instalación

### 1. Instalar dependencias

```bash
npm install --save-dev selenium-webdriver chromedriver
# o con pnpm
pnpm add -D selenium-webdriver chromedriver
```

### 2. Verificar Chrome/Chromium

Selenium requiere Chrome o Chromium instalado:

```bash
# En Linux
which google-chrome
# o
which chromium-browser

# En macOS
which /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome

# En Windows
where chrome.exe
```

Si no está instalado:

```bash
# Ubuntu/Debian
sudo apt-get install google-chrome-stable

# macOS
brew install google-chrome

# Windows
# Descargar desde https://www.google.com/chrome/
```

## ⚙️ Configuración

### Variables de entorno (.env.test)

```bash
# URL de la aplicación
BASE_URL=http://localhost:5173

# URL de la API
API_URL=http://localhost:4000/api

# Modo headless (sin interfaz gráfica)
HEADLESS=true

# Timeouts en ms
IMPLICIT_WAIT=8000
TIMEOUT=10000
```

## 🚀 Ejecutar Tests

### Ejecutar todos los tests

```bash
npm run test:selenium
```

### Ejecutar solo tests de login

```bash
npm run test:selenium -- loginFlow.test.js
```

### Ejecutar solo tests de CRUD

```bash
npm run test:selenium -- crudFlow.test.js
```

### Ejecutar tests sin headless (ver navegador)

```bash
HEADLESS=false npm run test:selenium
```

### Ejecutar tests en modo debug

```bash
node --inspect-brk ./node_modules/.bin/jest --config jest.config.selenium.js
```

## 📝 Scripts en package.json

Agregar estos scripts a tu `package.json`:

```json
{
  "scripts": {
    "test:selenium": "jest --config jest.config.selenium.js",
    "test:selenium:watch": "jest --config jest.config.selenium.js --watch",
    "test:selenium:headless": "HEADLESS=true jest --config jest.config.selenium.js",
    "test:selenium:ui": "HEADLESS=false jest --config jest.config.selenium.js"
  }
}
```

## 📊 Tests Disponibles

### 1. Login Flow Tests (`loginFlow.test.js`)

#### RF-1.1: Registro exitoso de usuario

- ✓ Navega a la página
- ✓ Rellena formulario de registro (nombre, email, contraseña)
- ✓ Envía formulario
- ✓ Verifica que el usuario está autenticado

#### RF-1.2: Login exitoso

- ✓ Ingresa email y contraseña
- ✓ Hace clic en "Entrar"
- ✓ Verifica acceso al dashboard (formulario de productos visible)

#### RF-1.4: Logout exitoso

- ✓ Autentica usuario
- ✓ Hace clic en "Cerrar sesión"
- ✓ Verifica retorno a pantalla de login

### 2. CRUD Flow Tests (`crudFlow.test.js`)

#### RF-2.1: Crear producto

- ✓ Rellena nombre, cantidad y precio
- ✓ Hace clic en "Agregar producto"
- ✓ Verifica que producto aparece en la lista

#### RF-2.2: Leer (listar) productos

- ✓ Obtiene lista de productos
- ✓ Verifica información de cada producto
- ✓ Valida resumen de inventario

#### RF-2.3: Actualizar producto

- ✓ Encuentra producto en lista
- ✓ Hace clic en "Editar"
- ✓ Modifica cantidad y precio
- ✓ Guarda cambios
- ✓ Verifica actualización en lista

#### RF-2.4: Eliminar producto

- ✓ Encuentra producto en lista
- ✓ Hace clic en "Eliminar"
- ✓ Confirma eliminación
- ✓ Verifica que producto desapareció de la lista

#### RF-2.5: Validar cálculo de valor total

- ✓ Obtiene valor total del inventario
- ✓ Verifica que es un número válido
- ✓ Comprueba formato de moneda

## 🛠️ Funciones Helper Disponibles

En `helpers.js` se encuentran funciones reutilizables:

```javascript
// Esperar elementos
waitForElement(driver, locator)
waitForElementVisible(driver, locator)
waitForElementEnabled(driver, locator)

// Localizadores
byCSS(selector)
byXPath(xpath)
byText(text)

// Interacciones
click(driver, locator)
fillInput(driver, locator, value)
submitForm(driver, locator)
getText(driver, locator)

// Utilidades
clearLocalStorage(driver)
clearCookies(driver)
elementExists(driver, locator)
countElements(driver, locator)
takeScreenshot(driver, filename)
sleep(ms)
```

## 🐛 Debugging

### Ver el navegador durante la ejecución

```bash
HEADLESS=false npm run test:selenium
```

### Tomar screenshots en caso de error

```javascript
// En tus tests
import { takeScreenshot } from '../helpers.js'

test('Mi test', async () => {
  try {
    // código del test
  } catch (error) {
    await takeScreenshot(driver, 'error-screenshot')
    throw error
  }
})
```

Los screenshots se guardan en `./screenshots/`

### Ver logs en consola

```javascript
console.log('Debug info:', variable)
// Los logs aparecerán en la salida de Jest
```

## ⚡ Performance Tips

1. **Usar timeouts apropiados**: Aumentar si la red es lenta
2. **Esperar explícitamente**: No confiar en `sleep()` para sincronización
3. **Ejecutar tests secuencialmente**: `maxWorkers: 1` en jest.config.js
4. **Limpiar datos entre tests**: `beforeEach()` con logout/login

## 🔐 Seguridad

- **No hardcodear credenciales**: Usar `.env.test`
- **Generar email único**: `qa_test_${Date.now()}@test.com`
- **No compartir datos sensibles**: Tests con usuarios de prueba

## 📈 Próximas Mejoras

- [ ] Integración con CI/CD (GitHub Actions)
- [ ] Reportes HTML detallados
- [ ] Tests en paralelo (con aislamiento)
- [ ] Captura de video de fallos
- [ ] Performance benchmarks
- [ ] Tests de accesibilidad (axe-core)
- [ ] Cross-browser testing (Firefox, Safari)

## 🤝 Contribuir

Nuevos tests deben:

1. Usar las funciones helper de `helpers.js`
2. Incluir comentarios descriptivos
3. Tener timeouts apropiados
4. Limpiar datos en `afterEach()`
5. Documentarse en este README

## 📖 Recursos

- [Selenium WebDriver Docs](https://www.selenium.dev/documentation/)
- [Jest Testing](https://jestjs.io/)
- [ChromeDriver Descargas](https://googlechromelabs.github.io/chrome-for-testing/)

## 📞 Soporte

Para problemas comunes:

**Problema**: ChromeDriver version mismatch
**Solución**: `npm install --save-dev chromedriver@latest`

**Problema**: Elementos no encontrados
**Solución**: Aumentar `IMPLICIT_WAIT` en `.env.test`

**Problema**: Tests fallo por timeout
**Solución**: Usar `HEADLESS=false` para ver qué sucede

---

¡Happy Testing! 🚀
