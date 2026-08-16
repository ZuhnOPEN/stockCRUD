# ✅ Firefox + Selenium - Guía Completa

## ¿Por qué Firefox para Selenium?

| Ventaja                             | Descripción                                          |
| ----------------------------------- | ---------------------------------------------------- |
| 🎯 **Sin dependencias del sistema** | No requiere `--no-sandbox` ni privilegios especiales |
| 🚀 **Más ligero**                   | Menos recursos que Chrome, mejor para CI/CD          |
| 💾 **geckodriver simple**           | Una única herramienta, fácil de instalar y mantener  |
| 🔄 **Mejor para Linux**             | Instalación nativa sin capas adicionales             |
| ✅ **Estable**                      | Mozilla mantiene geckodriver activamente             |
| 📦 **Fewer dependencies**           | Menos código, menos problemas                        |

---

## Instalación Rápida

### 1. Instalar geckodriver

```bash
# Con npm/pnpm (recomendado)
npm install --save-dev geckodriver

# O manualmente en Linux
wget https://github.com/mozilla/geckodriver/releases/download/v0.35.0/geckodriver-v0.35.0-linux64.tar.gz
tar -xzf geckodriver-*.tar.gz -C ~/.local/bin/
chmod +x ~/.local/bin/geckodriver
```

### 2. Verificar instalación

```bash
# Debe retornar la versión
geckodriver --version

# O
./node_modules/.bin/geckodriver --version
```

### 3. Verificar Firefox

```bash
firefox --version
```

---

## Usar Firefox en Selenium

### Opción 1: Variable de Entorno (Recomendado)

```bash
# En .env.test
BROWSER=firefox
```

Luego ejecutar:

```bash
npm run test:selenium
```

### Opción 2: Variable de Entorno en Línea de Comandos

```bash
BROWSER=firefox npm run test:selenium

# O con headless desactivado
BROWSER=firefox HEADLESS=false npm run test:selenium:ui
```

### Opción 3: Código JavaScript Directo

```javascript
import { createDriver } from './driver.js'
import config from './config.js'

// Cambiar navegador
process.env.BROWSER = 'firefox'

const driver = await createDriver()
```

---

## Configuración de Firefox

El archivo `driver.js` ya incluye la configuración óptima para Firefox:

```javascript
const options = new firefox.Options()

// Headless mode
if (config.headless) {
  options.addArguments('-headless')
}

// Tamaño de ventana
options.addArguments('-width=1920')
options.addArguments('-height=1080')
```

### Opciones Avanzadas

Si necesitas más configuración, puedes agregar:

```javascript
// Desabilitar notificaciones
options.addArguments('-no-remote')

// Usar perfil específico
options.setProfile('/path/to/firefox/profile')

// Variables de preferencia
options.setPreference('dom.webdriver.enabled', true)
```

---

## Ejecutar Tests Específicos

### Login Flow

```bash
BROWSER=firefox npm run test:selenium -- loginFlow.test.js
```

### CRUD Flow

```bash
BROWSER=firefox npm run test:selenium -- crudFlow.test.js
```

### Con visor gráfico

```bash
BROWSER=firefox HEADLESS=false npm run test:selenium
```

---

## Comparativa: Firefox vs Chrome

### Instalación

**Firefox:**

```bash
# Solo geckodriver
npm install --save-dev geckodriver
```

**Chrome:**

```bash
# Necesita chromedriver + varias dependencias
npm install --save-dev chromedriver
# Además: --no-sandbox, --disable-dev-shm-usage, etc.
```

### Performance

| Métrica             | Firefox | Chrome |
| ------------------- | ------- | ------ |
| Tiempo de inicio    | 2-3s    | 3-5s   |
| Memoria en headless | ~150MB  | ~200MB |
| Estabilidad         | ✅ Alta | Alta   |

### Casos de Uso

**Usa Firefox cuando:**

- Estás en Linux/Docker
- Quieres minimizar dependencias
- Necesitas bajo consumo de recursos
- Ejecutas en CI/CD

**Usa Chrome cuando:**

- Necesitas máxima compatibilidad
- Tu equipo ya lo usa
- Quieres debugging avanzado

---

## Troubleshooting

### "geckodriver: command not found"

```bash
# Solución 1: Reinstalar
npm install --save-dev geckodriver@latest

# Solución 2: Usar ruta completa
/home/aire/Desktop/stockCRUD/node_modules/.bin/geckodriver --version

# Solución 3: Agregar al PATH
export PATH="$PATH:$HOME/Desktop/stockCRUD/node_modules/.bin"
geckodriver --version
```

### "Firefox binary not found"

```bash
# Instalar Firefox
sudo apt-get install firefox

# O indicar ruta
export MOZ_HEADLESS_WIDTH=1920
export MOZ_HEADLESS_HEIGHT=1080
```

### Tests fallan con Firefox

**Problema:** Elementos no se encuentran  
**Solución:** Aumentar timeouts en `.env.test`

```bash
IMPLICIT_WAIT=15000
TIMEOUT=15000
```

**Problema:** Driver se cierra inesperadamente  
**Solución:** Firefox a veces necesita más tiempo

```bash
# Usar HEADLESS=false para debugging
HEADLESS=false npm run test:selenium -- loginFlow.test.js
```

---

## Integración con CI/CD (GitHub Actions)

```yaml
# .github/workflows/selenium-tests.yml
name: Selenium Tests (Firefox)

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '22'

      - name: Install dependencies
        run: npm install

      - name: Start backend
        run: npm run dev:backend &

      - name: Start frontend
        run: npm run dev:frontend &

      - name: Wait for servers
        run: sleep 5

      - name: Run Selenium tests (Firefox)
        run: BROWSER=firefox HEADLESS=true npm run test:selenium
```

---

## Tips y Trucos

### 1. Acelerar ejecución en CI/CD

```bash
# Sin headless es más rápido a veces
HEADLESS=false npm run test:selenium
```

### 2. Debugging paso a paso

```bash
# Ver exactamente qué pasa
HEADLESS=false npm run test:selenium -- loginFlow.test.js

# Con logs detallados
DEBUG=* npm run test:selenium
```

### 3. Ejecutar solo un test

```bash
# Usar -t en Jest
npm run test:selenium -- -t "Registro exitoso"
```

### 4. Generar reporte

```bash
# Jest genera reporte automáticamente
npm run test:selenium -- --json > report.json
```

---

## Archivos Relacionados

- `scripts/selenium/driver.js` - Configuración de Firefox
- `scripts/selenium/config.js` - Variables globales
- `.env.test` - Configuración de entorno
- `SELENIUM_QUICKSTART.md` - Guía rápida

---

## Referencias

- [Geckodriver GitHub](https://github.com/mozilla/geckodriver)
- [Selenium WebDriver (Python)](https://www.selenium.dev/documentation/webdriver/getting_started/)
- [Firefox Options](https://firefox-source-docs.mozilla.org/testing/geckodriver/)

---

**Conclusión:** Firefox + Selenium es la opción más ligera y estable para automatización de tests en Linux/Docker. ¡Úsalo sin dudas! 🚀
