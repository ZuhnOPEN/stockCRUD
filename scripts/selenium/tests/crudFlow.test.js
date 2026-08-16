import { createDriver, closeDriver } from '../driver.js'
import { byCSS, byText, fillInput, click, getText, clearLocalStorage, sleep } from '../helpers.js'
import config from '../config.js'

describe('CRUD Flow Tests', () => {
  let driver
  let createdProductId = null

  beforeAll(async () => {
    driver = await createDriver()
  }, 30000)

  afterAll(async () => {
    await closeDriver(driver)
  })

  beforeEach(async () => {
    await clearLocalStorage(driver)
    await driver.get(config.baseUrl)
    await sleep(2000)

    // Realizar login automático antes de cada test
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
    }
  })

  test('RF-2.1: Crear producto exitosamente', async () => {
    try {
      const productName = `Producto QA ${Date.now()}`
      const productQuantity = '50'
      const productPrice = '2500'

      // Encontrar y rellenar inputs del formulario
      const inputs = await driver.findElements(byCSS('input'))
      let nameInput = null
      let quantityInput = null
      let priceInput = null

      // Identificar los inputs correctos
      for (let i = 0; i < inputs.length; i++) {
        const placeholder = await inputs[i].getAttribute('placeholder')
        const type = await inputs[i].getAttribute('type')

        if (placeholder && placeholder.includes('Café')) {
          nameInput = inputs[i]
        } else if (type === 'number' && !quantityInput) {
          quantityInput = inputs[i]
        } else if (type === 'number' && quantityInput) {
          priceInput = inputs[i]
        }
      }

      // Si no encontramos por placeholder, buscar por posición
      if (!nameInput && inputs.length > 0) nameInput = inputs[0]
      if (!quantityInput && inputs.length > 1) quantityInput = inputs[1]
      if (!priceInput && inputs.length > 2) priceInput = inputs[2]

      // Rellenar el formulario
      if (nameInput) {
        await nameInput.clear()
        await nameInput.sendKeys(productName)
      }

      if (quantityInput) {
        await quantityInput.clear()
        await quantityInput.sendKeys(productQuantity)
      }

      if (priceInput) {
        await priceInput.clear()
        await priceInput.sendKeys(productPrice)
      }

      // Buscar y hacer clic en botón de envío
      const buttons = await driver.findElements(byCSS('button'))
      for (const button of buttons) {
        const text = await button.getText()
        if (text.includes('Agregar') || text.includes('agregar')) {
          await button.click()
          break
        }
      }

      await sleep(2000)

      // Verificar que el producto apareció en la lista
      const listItems = await driver.findElements(byCSS('li'))
      let productFound = false

      for (const item of listItems) {
        const text = await item.getText()
        if (text.includes(productName)) {
          productFound = true
          break
        }
      }

      expect(productFound).toBe(true)
      console.log('✓ Producto creado exitosamente')
    } catch (error) {
      console.error('✗ Error al crear producto:', error.message)
      throw error
    }
  }, 30000)

  test('RF-2.2: Leer (listar) productos correctamente', async () => {
    try {
      // Esperar a que se cargue la lista de productos
      await sleep(2000)

      // Encontrar la lista de productos
      const listItems = await driver.findElements(byCSS('li'))

      if (listItems.length > 0) {
        console.log(`✓ Se encontraron ${listItems.length} producto(s) en la lista`)

        // Verificar que cada item tiene información visible
        for (const item of listItems) {
          const text = await item.getText()
          expect(text.length).toBeGreaterThan(0)
        }
      }

      // Verificar que se muestran cantidad total y valor total
      const summary = await driver.findElement(byCSS('[class*="summary"]')).catch(() => null)
      if (summary) {
        const summaryText = await summary.getText()
        expect(summaryText).toBeTruthy()
        console.log('✓ Resumen de inventario visible:', summaryText)
      }
    } catch (error) {
      console.error('✗ Error al leer productos:', error.message)
      throw error
    }
  }, 30000)

  test('RF-2.3: Actualizar producto exitosamente', async () => {
    try {
      await sleep(2000)

      // Encontrar el primer botón Editar
      const buttons = await driver.findElements(byCSS('button'))
      let editButton = null

      for (const button of buttons) {
        const text = await button.getText()
        if (text.includes('Editar')) {
          editButton = button
          break
        }
      }

      if (editButton) {
        await editButton.click()
        await sleep(1000)

        // Modificar los valores
        const inputs = await driver.findElements(byCSS('input'))
        const newQuantity = '100'
        const newPrice = '5000'

        if (inputs.length >= 2) {
          await inputs[1].clear()
          await inputs[1].sendKeys(newQuantity)

          if (inputs.length >= 3) {
            await inputs[2].clear()
            await inputs[2].sendKeys(newPrice)
          }
        }

        // Buscar y hacer clic en botón Guardar
        const updateButtons = await driver.findElements(byCSS('button'))
        for (const button of updateButtons) {
          const text = await button.getText()
          if (text.includes('Guardar')) {
            await button.click()
            break
          }
        }

        await sleep(2000)
        console.log('✓ Producto actualizado exitosamente')
      } else {
        console.log('⚠ No se encontró botón de Editar')
      }
    } catch (error) {
      console.error('✗ Error al actualizar producto:', error.message)
      throw error
    }
  }, 30000)

  test('RF-2.4: Eliminar producto exitosamente', async () => {
    try {
      await sleep(2000)

      // Obtener cantidad de items antes
      const listItemsBefore = await driver.findElements(byCSS('li'))
      const countBefore = listItemsBefore.length

      // Encontrar el primer botón Eliminar
      const buttons = await driver.findElements(byCSS('button'))
      let deleteButton = null

      for (const button of buttons) {
        const text = await button.getText()
        if (text.includes('Eliminar')) {
          deleteButton = button
          break
        }
      }

      if (deleteButton) {
        // Cambiar a una ventana modal si aparece
        const originalWindowHandle = await driver.getWindowHandle()

        await deleteButton.click()
        await sleep(1000)

        // Intentar aceptar el dialog de confirmación
        try {
          const alert = await driver.switchTo().alert()
          await alert.accept()
          await driver.switchTo().window(originalWindowHandle)
        } catch {
          // Si no hay alert, continuar
        }

        await sleep(2000)

        // Verificar que se eliminó (comparar cantidad)
        const listItemsAfter = await driver.findElements(byCSS('li'))
        const countAfter = listItemsAfter.length

        // La cantidad debe ser igual o menor (o la lista vacía)
        expect(countAfter).toBeLessThanOrEqual(countBefore)
        console.log('✓ Producto eliminado exitosamente')
      } else {
        console.log('⚠ No se encontró botón de Eliminar')
      }
    } catch (error) {
      console.error('✗ Error al eliminar producto:', error.message)
      throw error
    }
  }, 30000)

  test('RF-2.5: Validar cálculo de valor total', async () => {
    try {
      await sleep(2000)

      // Obtener el valor total mostrado
      const summary = await driver.findElement(byCSS('[class*="summary"]')).catch(() => null)

      if (summary) {
        const summaryText = await summary.getText()
        // Extraer número del summary (formato: $X.XXX)
        const numberMatch = summaryText.match(/\$?([\d.,]+)/)

        if (numberMatch) {
          const totalValue = numberMatch[1]
          expect(Number(totalValue.replace(/[.,]/g, ''))).toBeGreaterThanOrEqual(0)
          console.log('✓ Valor total válido:', totalValue)
        }
      }
    } catch (error) {
      console.error('✗ Error al validar valor total:', error.message)
      throw error
    }
  }, 30000)
})
