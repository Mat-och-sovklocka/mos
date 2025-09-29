import { test, expect } from '@playwright/test'

test('debug authentication flow', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()))
  
  // Enable network request logging
  page.on('request', request => {
    if (request.url().includes('/api/auth/login')) {
      console.log('LOGIN REQUEST:', request.method(), request.url(), request.postData())
    }
  })
  
  page.on('response', response => {
    if (response.url().includes('/api/auth/login')) {
      console.log('LOGIN RESPONSE:', response.status(), response.url())
      response.text().then(text => console.log('RESPONSE BODY:', text))
    }
  })

  // Navigate to login page
  await page.goto('http://localhost:3000/login')
  
  // Wait for page to load
  await page.waitForLoadState('networkidle')
  
  // Take screenshot before login
  await page.screenshot({ path: 'test-results/debug-before-login.png' })
  
  // Fill in credentials
  await page.fill('input[type="email"]', 'admin@mos.test')
  await page.fill('input[type="password"]', 'password123')
  
  // Take screenshot after filling
  await page.screenshot({ path: 'test-results/debug-after-fill.png' })
  
  // Submit form
  await page.click('button[type="submit"]')
  
  // Wait a bit for the request to complete
  await page.waitForTimeout(3000)
  
  // Take screenshot after submit
  await page.screenshot({ path: 'test-results/debug-after-submit.png' })
  
  // Check current URL
  const currentUrl = page.url()
  console.log('CURRENT URL:', currentUrl)
  
  // Check if there are any error messages
  const errorElements = await page.locator('.error-message').all()
  for (const element of errorElements) {
    const errorText = await element.textContent()
    console.log('ERROR MESSAGE:', errorText)
  }
  
  // Check session storage
  const token = await page.evaluate(() => sessionStorage.getItem('mos_token'))
  const user = await page.evaluate(() => sessionStorage.getItem('mos_user'))
  console.log('SESSION TOKEN:', token ? 'EXISTS' : 'MISSING')
  console.log('SESSION USER:', user ? 'EXISTS' : 'MISSING')
  
  // Final screenshot
  await page.screenshot({ path: 'test-results/debug-final.png' })
})
