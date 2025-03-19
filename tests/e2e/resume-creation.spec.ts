import { test, expect } from '@playwright/test';

test.describe('Resume Creation', () => {
  test('should create a new resume', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Click on the "Create Resume" button
    await page.getByRole('link', { name: /Create Resume/i }).click();
    
    // Check if we've navigated to the resume editor
    await expect(page).toHaveURL(/.*\/editor\/new/);
    
    // Fill in the resume details
    // Personal Information
    await page.getByLabel(/Full Name/i).fill('John Doe');
    await page.getByLabel(/Email/i).fill('john.doe@example.com');
    await page.getByLabel(/Phone/i).fill('123-456-7890');
    
    // Select a template
    await page.getByText(/Modern/i).click();
    
    // Save the resume
    await page.getByRole('button', { name: /Save/i }).click();
    
    // Wait for the save confirmation
    await expect(page.getByText(/Resume saved/i)).toBeVisible({ timeout: 10000 });
    
    // Verify we're redirected to the dashboard or resume view
    await expect(page).toHaveURL(/.*\/dashboard|.*\/editor\/[\w-]+/);
  });

  test('should edit an existing resume', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Click on the first resume in the list
    await page.getByTestId('resume-item').first().click();
    
    // Check if we've navigated to the resume editor
    await expect(page).toHaveURL(/.*\/editor\/[\w-]+/);
    
    // Edit the resume title
    const titleInput = page.getByLabel(/Resume Title/i);
    await titleInput.clear();
    await titleInput.fill('Updated Resume Title');
    
    // Save the changes
    await page.getByRole('button', { name: /Save/i }).click();
    
    // Wait for the save confirmation
    await expect(page.getByText(/Resume saved/i)).toBeVisible({ timeout: 10000 });
    
    // Navigate back to dashboard
    await page.getByRole('link', { name: /Dashboard/i }).click();
    
    // Verify the updated resume title is visible
    await expect(page.getByText('Updated Resume Title')).toBeVisible();
  });
}); 