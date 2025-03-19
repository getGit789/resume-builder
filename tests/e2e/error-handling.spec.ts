import { test, expect } from '@playwright/test';

test.describe('Error Handling', () => {
  test('should show validation errors when submitting incomplete resume', async ({ page }) => {
    // Navigate to the builder page
    await page.goto('/builder');
    
    // Check if we're on the editor page
    await expect(page).toHaveURL(/.*\/editor\/new/);
    
    // Try to save without filling required fields
    await page.getByRole('button', { name: /Save/i }).click();
    
    // Check for validation error messages
    await expect(page.getByText(/required field/i)).toBeVisible();
  });
  
  test('should handle network errors gracefully', async ({ page, context }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Intercept API requests and make them fail
    await context.route('**/api/resumes**', route => {
      return route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    // Try to create a new resume
    await page.getByRole('link', { name: /Create Resume/i }).click();
    
    // Fill in some data
    await page.getByLabel(/Resume Title/i).fill('Error Test Resume');
    
    // Try to save
    await page.getByRole('button', { name: /Save/i }).click();
    
    // Check for error message
    await expect(page.getByText(/failed to save/i, { exact: false })).toBeVisible({ timeout: 10000 });
    
    // Remove the route interception
    await context.unroute('**/api/resumes**');
  });
  
  test('should handle invalid URLs gracefully', async ({ page }) => {
    // Navigate to a non-existent page
    await page.goto('/non-existent-page');
    
    // Check if we get a 404 page
    await expect(page.getByText(/page not found/i, { exact: false })).toBeVisible();
    
    // Check if there's a way to navigate back to the home page
    const homeLink = page.getByRole('link', { name: /home/i });
    await expect(homeLink).toBeVisible();
    
    // Navigate back to the home page
    await homeLink.click();
    await expect(page).toHaveURL('/');
  });
  
  test('should handle invalid resume ID gracefully', async ({ page }) => {
    // Navigate to a non-existent resume
    await page.goto('/editor/non-existent-id');
    
    // Check if we get an appropriate error message
    await expect(page.getByText(/resume not found/i, { exact: false })).toBeVisible();
    
    // Check if there's a way to navigate back to the dashboard
    const dashboardLink = page.getByRole('link', { name: /dashboard/i });
    await expect(dashboardLink).toBeVisible();
    
    // Navigate back to the dashboard
    await dashboardLink.click();
    await expect(page).toHaveURL('/dashboard');
  });
  
  test('should handle invalid share token gracefully', async ({ page }) => {
    // Navigate to a non-existent shared resume
    await page.goto('/share/invalid-token');
    
    // Check if we get an appropriate error message
    await expect(page.getByText(/resume not found/i, { exact: false })).toBeVisible();
    
    // Check if there's a way to navigate back to the home page
    const homeLink = page.getByRole('link', { name: /home/i });
    await expect(homeLink).toBeVisible();
  });
}); 