import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should login and access protected routes', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/login')
    
    // Check login form is visible
    await expect(page.getByRole('heading', { name: 'MOS' })).toBeVisible()
    await expect(page.getByText('Mat och sovklocka')).toBeVisible()
    
    // Fill in credentials
    await page.fill('input[type="email"]', 'admin@mos.test')
    await page.fill('input[type="password"]', 'password123')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should redirect to home page
    await expect(page).toHaveURL('http://localhost:3000/', { timeout: 10000 })
    await expect(page.getByText('Welcome,')).toBeVisible({ timeout: 10000 })
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login')
    
    // Fill in wrong credentials
    await page.fill('input[type="email"]', 'wrong@email.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should show error message
    await expect(page.getByText(/login failed/i)).toBeVisible()
  })

  test('should logout and redirect to login', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/login')
    await page.fill('input[type="email"]', 'admin@mos.test')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Wait for home page
    await expect(page).toHaveURL('http://localhost:3000/', { timeout: 10000 })
    
    // Click logout
    await page.click('button:has-text("Logout")')
    
    // Should redirect to login
    await expect(page).toHaveURL('http://localhost:3000/login')
  })
})

