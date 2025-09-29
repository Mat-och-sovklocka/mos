import { test, expect } from '@playwright/test'

test('simple login test - check authentication state', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost:3000/login')
  
  // Fill in credentials
  await page.fill('input[type="email"]', 'admin@mos.test')
  await page.fill('input[type="password"]', 'password123')
  
  // Submit form
  await page.click('button[type="submit"]')
  
  // Wait for the login request to complete
  await page.waitForResponse(response => 
    response.url().includes('/api/auth/login') && response.status() === 200
  )
  
  // Wait a bit for the state to update
  await page.waitForTimeout(2000)
  
  // Check if we're still on login page
  const currentUrl = page.url()
  console.log('Current URL after login:', currentUrl)
  
  // If still on login, try navigating to home manually
  if (currentUrl.includes('/login')) {
    console.log('Still on login page, trying manual navigation...')
    await page.goto('http://localhost:3000/')
    await page.waitForTimeout(1000)
    
    const newUrl = page.url()
    console.log('URL after manual navigation:', newUrl)
    
    // Check if we can see the home page content
    const welcomeText = await page.locator('text=Welcome,').isVisible()
    console.log('Welcome text visible:', welcomeText)
    
    if (welcomeText) {
      console.log('✅ Authentication is working - we can access the home page!')
    } else {
      console.log('❌ Still can\'t access home page')
    }
  }
})
