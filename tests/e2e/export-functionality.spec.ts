import { test, expect } from '@playwright/test';

test.describe('Export Functionality', () => {
  test('should export a resume to PDF and track its status', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Find the first resume in the list
    const resumeCard = page.locator('.card').first();
    await expect(resumeCard).toBeVisible();
    
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
    
    // Verify the export format is PDF
    await expect(exportItem.getByText(/PDF/i)).toBeVisible();
    
    // Verify the export status eventually changes to "Completed"
    await expect(page.getByText(/Completed/i)).toBeVisible({ timeout: 30000 });
    
    // Verify the download button is available
    const downloadButton = exportItem.getByRole('button', { name: /Download/i });
    await expect(downloadButton).toBeVisible();
  });
  
  test('should export a resume to DOCX format', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Find the first resume in the list
    const resumeCard = page.locator('.card').first();
    await expect(resumeCard).toBeVisible();
    
    // Click on the export button
    const exportButton = resumeCard.getByRole('button', { name: /Export/i });
    await exportButton.click();
    
    // Select DOCX format from the dropdown
    await page.getByRole('menuitem', { name: /DOCX/i }).click();
    
    // Wait for the export process to start
    await expect(page.getByText(/Export started/i)).toBeVisible({ timeout: 5000 });
    
    // Navigate to the exports tab
    await page.getByRole('tab', { name: /Exports/i }).click();
    
    // Verify that the export appears in the list
    const exportItem = page.getByTestId('export-item').first();
    await expect(exportItem).toBeVisible({ timeout: 15000 });
    
    // Verify the export format is DOCX
    await expect(exportItem.getByText(/DOCX/i)).toBeVisible();
  });
  
  test('should delete an export', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Navigate to the exports tab
    await page.getByRole('tab', { name: /Exports/i }).click();
    
    // Check if there are any exports
    const noExportsText = page.getByText('No exports yet');
    if (await noExportsText.isVisible()) {
      // Create an export first
      await page.getByRole('tab', { name: /Resumes/i }).click();
      const resumeCard = page.locator('.card').first();
      await resumeCard.getByRole('button', { name: /Export/i }).click();
      await page.getByRole('menuitem', { name: /PDF/i }).click();
      await expect(page.getByText(/Export started/i)).toBeVisible({ timeout: 5000 });
      await page.getByRole('tab', { name: /Exports/i }).click();
      await expect(page.getByTestId('export-item').first()).toBeVisible({ timeout: 15000 });
    }
    
    // Find the first export in the list
    const exportItem = page.getByTestId('export-item').first();
    await expect(exportItem).toBeVisible();
    
    // Click on the delete button
    const deleteButton = exportItem.getByRole('button', { name: /Delete/i });
    await deleteButton.click();
    
    // Confirm deletion
    await page.getByRole('button', { name: /Confirm/i }).click();
    
    // Verify the export is deleted
    await expect(page.getByText(/Export deleted/i)).toBeVisible({ timeout: 5000 });
  });
}); 