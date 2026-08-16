let dotenv

try {
  dotenv = (await import('dotenv')).default
} catch {
  dotenv = (await import('../../server/node_modules/dotenv')).default
}

dotenv.config({ path: '.env.test' })

export const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  apiUrl: process.env.API_URL || 'http://localhost:4000/api',
  headless: process.env.HEADLESS !== 'false',
  timeout: 10000,
  implicitWait: 8000,
browser: process.env.BROWSER || 'firefox',
  testUser: {
    name: 'QA Test User',
    email: process.env.TEST_EMAIL || `qa_test_${Date.now()}@test.com`,
    password: process.env.TEST_PASSWORD || 'TestPassword123!',
  },
}

export default config
