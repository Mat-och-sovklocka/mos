import { test, expect } from '@playwright/test'

test('simple demo - just visit the page', async ({ page }) => {
  // Navigate to the login page
  await page.goto('http://localhost:3000/login')
  
  // Wait for the page to load
  await page.waitForLoadState('networkidle')
  
  // Take a screenshot
  await page.screenshot({ path: 'test-results/login-page.png' })
  
  // Check that we're on the login page
  await expect(page).toHaveURL('http://localhost:3000/login')
  
  // Check that the page title contains MOS
  await expect(page).toHaveTitle(/MOS/)
  
  console.log('✅ Successfully visited the login page!')
})
