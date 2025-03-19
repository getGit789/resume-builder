import { test, expect } from '@playwright/test';

// This test will run only on the Mobile Chrome project
test.describe('Mobile Responsiveness', () => {
  test('should display the home page correctly on mobile', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Check if the page title is correct
    await expect(page).toHaveTitle(/ResumeForge/);
    
    // Check if the main heading is visible and properly sized for mobile
    const heading = page.getByText('Create professional resumes in minutes');
    await expect(heading).toBeVisible();
    
    // Check if the "Create Resume" button is visible
    const createButton = page.getByRole('link', { name: /Create Resume/i });
    await expect(createButton).toBeVisible();
    
    // Check if the features section is visible
    const featuresHeading = page.getByRole('heading', { name: /Features/i });
    await expect(featuresHeading).toBeVisible();
    
    // Verify the footer is visible
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
  
  test('should display the dashboard correctly on mobile', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Check if the dashboard heading is visible
    const dashboardHeading = page.getByRole('heading', { name: /Dashboard/i });
    await expect(dashboardHeading).toBeVisible();
    
    // Check if the tabs are visible and properly sized
    const tabsList = page.getByRole('tablist');
    await expect(tabsList).toBeVisible();
    
    // Check if the "Create Resume" button is visible
    const createButton = page.getByRole('button', { name: /Create New Resume/i });
    if (await createButton.isVisible()) {
      // If there are no resumes, the create button should be visible
      await expect(createButton).toBeVisible();
    } else {
      // If there are resumes, check if they're displayed properly
      const resumeCards = page.locator('.card');
      await expect(resumeCards.first()).toBeVisible();
    }
  });
  
  test('should have proper navigation on mobile', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Check if the header is visible
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Navigate to the dashboard
    await page.getByRole('link', { name: /Dashboard/i }).click();
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Check if the dashboard content is visible
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
    
    // Navigate to the builder page
    await page.getByRole('link', { name: /Create Resume/i }).click();
    await expect(page).toHaveURL(/.*\/editor\/new|.*\/builder/);
    
    // Navigate back to the dashboard
    await page.getByRole('link', { name: /Dashboard/i }).click();
    await expect(page).toHaveURL(/.*\/dashboard/);
  });
  
  test('should display the resume editor correctly on mobile', async ({ page }) => {
    // Navigate to the builder page
    await page.goto('/builder');
    
    // Check if we're on the editor page
    await expect(page).toHaveURL(/.*\/editor\/new/);
    
    // Check if the form elements are properly sized for mobile
    const formElements = page.locator('input, textarea, [contenteditable="true"]');
    
    // Get the viewport width
    const viewportSize = page.viewportSize();
    const viewportWidth = viewportSize?.width || 0;
    
    // Check at least the first few form elements
    for (let i = 0; i < Math.min(5, await formElements.count()); i++) {
      const element = formElements.nth(i);
      await expect(element).toBeVisible();
      
      // Check that the element width is appropriate for the viewport
      const boundingBox = await element.boundingBox();
      if (boundingBox) {
        expect(boundingBox.width).toBeLessThanOrEqual(viewportWidth);
      }
    }
    
    // Check if the save button is visible and properly positioned
    const saveButton = page.getByRole('button', { name: /Save/i });
    await expect(saveButton).toBeVisible();
  });
}); 