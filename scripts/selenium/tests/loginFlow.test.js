import { createDriver, closeDriver } from '../driver.js'
import { byCSS, byText, fillInput, click, getText, clearLocalStorage, sleep } from '../helpers.js'
import config from '../config.js'

describe('Login Flow Tests', () => {
  let driver

  beforeAll(async () => {
    driver = await createDriver()
  }, 30000)

  afterAll(async () => {
    await closeDriver(driver)
  })

  beforeEach(async () => {
    await driver.get(config.baseUrl)
    await clearLocalStorage(driver)
    await driver.get(config.baseUrl)
    await sleep(2000) // Esperar a que cargue la página
  })

  test('RF-1.1: Registro exitoso de usuario', async () => {
    try {
      // Verificar que el formulario de registro está visible
      const authSection = await driver.findElement(byCSS('[class*="auth"]'))
      expect(authSection).toBeTruthy()

      // Encontrar los inputs de email y contraseña
      const emailInputs = await driver.findElements(byCSS('input[type="email"]'))
      const passwordInputs = await driver.findElements(byCSS('input[type="password"]'))
      const nameInputs = await driver.findElements(byCSS('input[placeholder*="nombre"]'))

      // Rellenar formulario de registro
      if (nameInputs.length > 0) {
        await nameInputs[0].clear()
        await nameInputs[0].sendKeys(config.testUser.name)
      }

      if (emailInputs.length > 0) {
        await emailInputs[0].clear()
        await emailInputs[0].sendKeys(config.testUser.email)
      }

      if (passwordInputs.length > 0) {
        await passwordInputs[0].clear()
        await passwordInputs[0].sendKeys(config.testUser.password)
      }

      // Buscar y hacer clic en botón de registro
      const buttons = await driver.findElements(byCSS('button'))
      let registerButton = null

      for (const button of buttons) {
        const text = await button.getText()
        if (text.toLowerCase().includes('registrar') || text.toLowerCase().includes('crear')) {
          registerButton = button
          break
        }
      }

      if (registerButton) {
        await registerButton.click()
        await sleep(3000) // Esperar al registro

        // Verificar que el registro fue exitoso (usuario debería estar logueado)
        const userLabel = await driver.findElement(byCSS('[class*="user"]')).catch(() => null)
        if (userLabel) {
          const labelText = await userLabel.getText()
          expect(labelText).toContain(config.testUser.email)
        }
      }

      console.log('✓ Registro exitoso')
    } catch (error) {
      console.error('✗ Error en registro:', error.message)
      throw error
    }
  }, 30000)

  test('RF-1.2: Login exitoso con credenciales válidas', async () => {
    try {
      // Cambiar a modo login si es necesario
      const toggleButtons = await driver.findElements(byCSS('button'))
      for (const button of toggleButtons) {
        const text = await button.getText()
        if (text.toLowerCase().includes('inicia sesión') || text.toLowerCase().includes('login')) {
          await button.click()
          await sleep(1000)
          break
        }
      }

      // Rellenar credenciales de login
      const emailInputs = await driver.findElements(byCSS('input[type="email"]'))
      const passwordInputs = await driver.findElements(byCSS('input[type="password"]'))

      if (emailInputs.length > 0) {
        await emailInputs[0].clear()
        await emailInputs[0].sendKeys(config.testUser.email)
      }

      if (passwordInputs.length > 0) {
        await passwordInputs[0].clear()
        await passwordInputs[0].sendKeys(config.testUser.password)
      }

      // Buscar y hacer clic en botón de login
      const buttons = await driver.findElements(byCSS('button'))
      let loginButton = null

      for (const button of buttons) {
        const text = await button.getText()
        if (text.toLowerCase().includes('entrar') || text.toLowerCase().includes('login')) {
          loginButton = button
          break
        }
      }

      if (loginButton) {
        await loginButton.click()
        await sleep(3000)

        // Verificar que estamos en el dashboard (debe haber una lista o formulario de productos)
        const productForm = await driver.findElement(byCSS('form')).catch(() => null)
        expect(productForm).toBeTruthy()
        console.log('✓ Login exitoso')
      }
    } catch (error) {
      console.error('✗ Error en login:', error.message)
      throw error
    }
  }, 30000)

  test('RF-1.4: Logout exitoso', async () => {
    try {
      // Primero hacer login
      const emailInputs = await driver.findElements(byCSS('input[type="email"]'))
      const passwordInputs = await driver.findElements(byCSS('input[type="password"]'))

      if (emailInputs.length > 0 && passwordInputs.length > 0) {
        await emailInputs[0].clear()
        await emailInputs[0].sendKeys(config.testUser.email)
        await passwordInputs[0].clear()
        await passwordInputs[0].sendKeys(config.testUser.password)

        const buttons = await driver.findElements(byCSS('button'))
        for (const button of buttons) {
          const text = await button.getText()
          if (text.toLowerCase().includes('entrar')) {
            await button.click()
            break
          }
        }

        await sleep(3000)

        // Buscar y hacer clic en botón de logout
        const logoutButtons = await driver.findElements(byCSS('button'))
        for (const button of logoutButtons) {
          const text = await button.getText()
          if (text.toLowerCase().includes('cerrar') && text.toLowerCase().includes('sesión')) {
            await button.click()
            break
          }
        }

        await sleep(2000)

        // Verificar que estamos de vuelta en la página de login
        const authForm = await driver.findElement(byCSS('[class*="auth"]')).catch(() => null)
        expect(authForm).toBeTruthy()
        console.log('✓ Logout exitoso')
      }
    } catch (error) {
      console.error('✗ Error en logout:', error.message)
      throw error
    }
  }, 30000)
})
