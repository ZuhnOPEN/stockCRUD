import { Builder } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'
import firefox from 'selenium-webdriver/firefox.js'
import config from './config.js'
import fs from 'fs'
import path from 'path'

/**
 * Crea el directorio de screenshots si no existe
 */
function ensureScreenshotsDir() {
  const dir = './screenshots'
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

/**
 * Crea una instancia del driver de Selenium
 * Soporta Chrome y Firefox
 */
export async function createDriver() {
  ensureScreenshotsDir()

  const browser = config.browser.toLowerCase()
  let driver

  if (browser === 'firefox') {
    const options = new firefox.Options()

    if (config.headless) {
      options.addArguments('-headless')
    }

    options.addArguments('-width=1920')
    options.addArguments('-height=1080')

    driver = await new Builder().forBrowser('firefox').setFirefoxOptions(options).build()
  } else if (browser === 'chrome') {
    const options = new chrome.Options()

    if (config.headless) {
      options.addArguments('--headless=new')
    }

    options.addArguments('--start-maximized')
    options.addArguments('--no-sandbox')
    options.addArguments('--disable-dev-shm-usage')
    options.addArguments('--disable-gpu')
    options.excludeSwitch('enable-logging')

    driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build()
  } else {
    throw new Error(`Navegador no soportado: ${browser}. Usa 'chrome' o 'firefox'`)
  }

  await driver.manage().setTimeouts({
    implicit: config.implicitWait,
    script: config.timeout,
  })

  return driver
}

/**
 * Cierra el driver
 */
export async function closeDriver(driver) {
  if (driver) {
    await driver.quit()
  }
}

export default {
  createDriver,
  closeDriver,
}
