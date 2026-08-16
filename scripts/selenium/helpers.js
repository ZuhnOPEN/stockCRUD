import { By, until, Key } from 'selenium-webdriver'

/**
 * Espera hasta que un elemento esté presente en el DOM
 */
export async function waitForElement(driver, locator, timeout = 10000) {
  return driver.wait(until.elementLocated(locator), timeout)
}

/**
 * Espera hasta que un elemento sea visible
 */
export async function waitForElementVisible(driver, locator, timeout = 10000) {
  const element = await waitForElement(driver, locator, timeout)
  return driver.wait(until.elementIsVisible(element), timeout)
}

/**
 * Encuentra un elemento por selector CSS
 */
export function byCSS(selector) {
  return By.css(selector)
}

/**
 * Encuentra un elemento por XPath
 */
export function byXPath(xpath) {
  return By.xpath(xpath)
}

/**
 * Encuentra un elemento por texto (sensible a mayúsculas)
 */
export function byText(text) {
  return By.xpath(`//*[contains(text(), '${text}')]`)
}

/**
 * Obtiene el texto de un elemento
 */
export async function getText(driver, locator) {
  const element = await waitForElement(driver, locator)
  return element.getText()
}

/**
 * Rellena un campo de input
 */
export async function fillInput(driver, locator, value) {
  const element = await waitForElementVisible(driver, locator)
  await element.clear()
  await element.sendKeys(value)
}

/**
 * Hace clic en un elemento
 */
export async function click(driver, locator) {
  const element = await waitForElementVisible(driver, locator)
  await driver.executeScript('arguments[0].scrollIntoView(true);', element)
  return element.click()
}

/**
 * Envía un formulario
 */
export async function submitForm(driver, locator) {
  const element = await waitForElement(driver, locator)
  return element.submit()
}

/**
 * Espera a que un elemento desaparezca del DOM
 */
export async function waitForElementStale(driver, locator, timeout = 10000) {
  return driver.wait(until.stalenessOf(await driver.findElement(locator)), timeout)
}

/**
 * Espera a que un elemento esté habilitado
 */
export async function waitForElementEnabled(driver, locator, timeout = 10000) {
  const element = await waitForElement(driver, locator, timeout)
  return driver.wait(until.elementIsEnabled(element), timeout)
}

/**
 * Obtiene el atributo de un elemento
 */
export async function getAttribute(driver, locator, attributeName) {
  const element = await waitForElement(driver, locator)
  return element.getAttribute(attributeName)
}

/**
 * Espera a que la página esté completamente cargada
 */
export async function waitPageLoad(driver, timeout = 10000) {
  return driver.wait(() => {
    return driver.executeScript('return document.readyState === "complete"')
  }, timeout)
}

/**
 * Toma una screenshot
 */
export async function takeScreenshot(driver, filename) {
  const screenshot = await driver.takeScreenshot()
  const fs = await import('fs').then((m) => m.default)
  fs.writeFileSync(`./screenshots/${filename}.png`, screenshot, 'base64')
  console.log(`Screenshot guardado: screenshots/${filename}.png`)
}

/**
 * Limpia el localStorage
 */
export async function clearLocalStorage(driver) {
  return driver.executeScript('window.localStorage.clear();')
}

/**
 * Limpia cookies
 */
export async function clearCookies(driver) {
  return driver.manage().deleteAllCookies()
}

/**
 * Pausa ejecución (útil para debugging)
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Verifica si un elemento existe
 */
export async function elementExists(driver, locator) {
  try {
    await driver.findElement(locator)
    return true
  } catch {
    return false
  }
}

/**
 * Obtiene el número de elementos que coinciden con el locator
 */
export async function countElements(driver, locator) {
  const elements = await driver.findElements(locator)
  return elements.length
}

export default {
  waitForElement,
  waitForElementVisible,
  byCSS,
  byXPath,
  byText,
  getText,
  fillInput,
  click,
  submitForm,
  waitForElementStale,
  waitForElementEnabled,
  getAttribute,
  waitPageLoad,
  takeScreenshot,
  clearLocalStorage,
  clearCookies,
  sleep,
  elementExists,
  countElements,
}
