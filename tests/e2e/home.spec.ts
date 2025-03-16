import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page successfully', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Check if the page title is correct
    await expect(page).toHaveTitle(/ResumeForge/);
    
    // Check if the main heading is visible
    const heading = page.getByText('Create professional resumes in minutes');
    await expect(heading).toBeVisible();
    
    // Check if the "Create Resume" button is visible in the main section
    // Use a more specific selector to avoid ambiguity
    const createButton = page.locator('section').getByRole('link', { name: /Create Resume/i });
    await expect(createButton).toBeVisible();
  });

  test('should navigate to the dashboard when clicking on dashboard link', async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
    
    // Click on the dashboard link in the footer
    // Use a more specific selector to target the footer link
    const dashboardLink = page.locator('footer').getByRole('link', { name: 'Dashboard' });
    await expect(dashboardLink).toBeVisible();
    await dashboardLink.click();
    
    // Check if we've navigated to the dashboard page
    await expect(page).toHaveURL(/.*\/dashboard/);
    
    // Verify dashboard content is visible
    const dashboardHeading = page.getByRole('heading', { name: /Dashboard/i });
    await expect(dashboardHeading).toBeVisible();
  });
}); 