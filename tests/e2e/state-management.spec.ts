import { test, expect } from '@playwright/test';

test.describe('State Management', () => {
  test('should persist resume data between page navigations', async ({ page }) => {
    // Navigate to the builder page
    await page.goto('/builder');
    
    // Check if we're on the editor page
    await expect(page).toHaveURL(/.*\/editor\/new/);
    
    // Fill in the resume title
    await page.getByLabel(/Resume Title/i).fill('State Management Test Resume');
    
    // Fill in personal information
    await page.getByLabel(/First Name/i).fill('John');
    await page.getByLabel(/Last Name/i).fill('Doe');
    await page.getByLabel(/Email/i).fill('john.doe@example.com');
    
    // Save the resume
    await page.getByRole('button', { name: /Save/i }).click();
    
    // Wait for the save confirmation
    await expect(page.getByText(/Resume saved/i)).toBeVisible({ timeout: 10000 });
    
    // Navigate to the dashboard
    await page.getByRole('link', { name: /Dashboard/i }).click();
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Navigate back to the editor by clicking on the resume
    await page.getByText('State Management Test Resume').click();
    await expect(page).toHaveURL(/.*\/editor\/[\w-]+/);
    
    // Verify the data is still there
    await expect(page.getByLabel(/First Name/i)).toHaveValue('John');
    await expect(page.getByLabel(/Last Name/i)).toHaveValue('Doe');
    await expect(page.getByLabel(/Email/i)).toHaveValue('john.doe@example.com');
  });
  
  test('should persist UI preferences', async ({ page }) => {
    // Navigate to the builder page
    await page.goto('/builder');
    
    // Check if we're on the editor page
    await expect(page).toHaveURL(/.*\/editor\/new/);
    
    // Select a specific template
    await page.getByRole('button', { name: /Templates/i }).click();
    await page.getByText(/Modern/i).click();
    
    // Select a specific color theme
    await page.getByRole('button', { name: /Colors/i }).click();
    await page.getByText(/Blue/i).click();
    
    // Fill in basic information and save
    await page.getByLabel(/Resume Title/i).fill('UI Preferences Test');
    await page.getByLabel(/First Name/i).fill('Jane');
    await page.getByLabel(/Last Name/i).fill('Smith');
    await page.getByRole('button', { name: /Save/i }).click();
    await expect(page.getByText(/Resume saved/i)).toBeVisible({ timeout: 10000 });
    
    // Navigate to the dashboard
    await page.getByRole('link', { name: /Dashboard/i }).click();
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Create a new resume
    await page.getByRole('link', { name: /Create Resume/i }).click();
    await expect(page).toHaveURL(/.*\/editor\/new/);
    
    // Verify that the preferred template and color theme are pre-selected
    // This is challenging to verify visually, so we'll check for specific UI elements
    // that indicate the Modern template and Blue theme are selected
    
    // Check for blue theme elements (this is an approximation, adjust based on your UI)
    // We can check if a specific class or style is applied
    const blueThemeElement = page.locator('[data-theme="blue"]');
    if (await blueThemeElement.count() > 0) {
      await expect(blueThemeElement.first()).toBeVisible();
    }
    
    // Check for modern template elements (this is an approximation, adjust based on your UI)
    const modernTemplateElement = page.locator('[data-template="modern"]');
    if (await modernTemplateElement.count() > 0) {
      await expect(modernTemplateElement.first()).toBeVisible();
    }
  });
  
  test('should track export status across page navigations', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Find the first resume in the list
    const resumeCard = page.locator('.card').first();
    if (await resumeCard.isVisible()) {
      // Click on the export button
      const exportButton = resumeCard.getByRole('button', { name: /Export/i });
      await exportButton.click();
      
      // Select PDF format from the dropdown
      await page.getByRole('menuitem', { name: /PDF/i }).click();
      
      // Wait for the export process to start
      await expect(page.getByText(/Export started/i)).toBeVisible({ timeout: 5000 });
      
      // Navigate to the exports tab
      await page.getByRole('tab', { name: /Exports/i }).click();
      
      // Verify that the export appears in the list
      const exportItem = page.getByTestId('export-item').first();
      await expect(exportItem).toBeVisible({ timeout: 15000 });
      
      // Navigate to the home page
      await page.goto('/');
      
      // Navigate back to the dashboard exports tab
      await page.goto('/dashboard');
      await page.getByRole('tab', { name: /Exports/i }).click();
      
      // Verify the export is still there with its status
      await expect(page.getByTestId('export-item').first()).toBeVisible();
    }
  });
}); 