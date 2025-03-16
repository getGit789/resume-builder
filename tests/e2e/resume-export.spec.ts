import { test, expect } from '@playwright/test';

test.describe('Resume Export', () => {
  test('should export a resume to PDF', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Find the first resume in the list
    const resumeItem = page.getByTestId('resume-item').first();
    
    // Click on the export button for the resume
    await resumeItem.getByRole('button', { name: /Export/i }).click();
    
    // Select PDF format from the dropdown (if there's a dropdown)
    await page.getByRole('menuitem', { name: /PDF/i }).click();
    
    // Wait for the export process to start
    await expect(page.getByText(/Export started/i)).toBeVisible({ timeout: 5000 });
    
    // Navigate to the exports page
    await page.getByRole('link', { name: /Exports/i }).click();
    
    // Verify that the export appears in the list
    await expect(page.getByTestId('export-item').first()).toBeVisible({ timeout: 15000 });
    
    // Verify the export status eventually changes to "Completed"
    await expect(page.getByText(/Completed/i)).toBeVisible({ timeout: 30000 });
  });

  test('should share a resume', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Find the first resume in the list
    const resumeItem = page.getByTestId('resume-item').first();
    
    // Click on the share button for the resume
    await resumeItem.getByRole('button', { name: /Share/i }).click();
    
    // Toggle sharing on
    await page.getByRole('switch', { name: /Share resume/i }).click();
    
    // Wait for the share URL to appear
    const shareUrlField = page.getByTestId('share-url');
    await expect(shareUrlField).toBeVisible({ timeout: 10000 });
    
    // Get the share URL
    const shareUrl = await shareUrlField.inputValue();
    
    // Verify the share URL is valid
    expect(shareUrl).toContain('/share/');
    
    // Copy the URL and verify the copy action
    await page.getByRole('button', { name: /Copy/i }).click();
    await expect(page.getByText(/Copied to clipboard/i)).toBeVisible({ timeout: 5000 });
    
    // Close the share dialog
    await page.getByRole('button', { name: /Close/i }).click();
  });
}); 