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

  if (browser !== 'firefox' && browser !== 'chrome') {
    throw new Error(`Navegador no soportado: ${browser}. Usa 'chrome' o 'firefox'`)
  }

  const builder = new Builder().forBrowser(browser)

  if (browser === 'firefox') {
    const options = new firefox.Options()

    if (config.headless) {
      options.addArguments('-headless')
    }

    options.addArguments('-width=1920')
    options.addArguments('-height=1080')
    options.setPreference('browser.download.dir', '/tmp')
    options.setPreference('browser.download.folderList', 2)
    builder.setFirefoxOptions(options)
    builder.setChromeOptions = undefined
  } else {
    const options = new chrome.Options()

    if (config.headless) {
      options.addArguments('--headless=new')
    }

    options.addArguments('--window-size=1920,1080')
    options.addArguments('--no-sandbox')
    options.addArguments('--disable-dev-shm-usage')
    options.addArguments('--disable-gpu')
    builder.setChromeOptions(options)
  }

  const path = await import('node:path')
  const fs = await import('node:fs')

  if (browser === 'firefox') {
    const candidates = [
      process.env.GECKODRIVER_PATH,
      '/usr/bin/geckodriver',
      '/usr/local/bin/geckodriver',
      path.resolve(process.cwd(), 'node_modules/.bin/geckodriver'),
      path.resolve(process.cwd(), 'node_modules/geckodriver/bin/geckodriver'),
      '/tmp/geckodriver',
    ]

    const resolved = candidates.find((entry) => Boolean(entry) && fs.existsSync(entry))
    if (resolved) {
      process.env.GECKODRIVER_PATH = resolved
      builder.setFirefoxService(new firefox.ServiceBuilder(resolved))
    }
  } else {
    const candidates = [
      process.env.CHROMEDRIVER_PATH,
      '/usr/bin/chromedriver',
      '/usr/local/bin/chromedriver',
      path.resolve(process.cwd(), 'node_modules/.bin/chromedriver'),
      path.resolve(process.cwd(), 'node_modules/chromedriver/lib/chromedriver/chromedriver'),
    ]

    const resolved = candidates.find((entry) => Boolean(entry) && fs.existsSync(entry))
    if (resolved) {
      process.env.CHROMEDRIVER_PATH = resolved
      builder.setChromeService(new chrome.ServiceBuilder(resolved))
    }
  }

  const driver = await builder.build()

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
