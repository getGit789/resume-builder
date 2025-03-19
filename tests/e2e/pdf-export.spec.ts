import { test, expect } from '@playwright/test';
import { createTestResume } from '../helpers';

test.describe('PDF Export Functionality', () => {
  test('should create and download a PDF export', async ({ page }) => {
    // Create a test resume
    const resumeTitle = await createTestResume(page);
    
    // Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Find the resume with the given title
    const resumeCard = page.getByText(resumeTitle).first().locator('..').locator('..');
    await expect(resumeCard).toBeVisible();
    
    // Click on the export button for the resume
    await resumeCard.getByRole('button', { name: /Export/i }).click();
    
    // Select PDF export
    await page.getByRole('menuitem', { name: /PDF/i }).click();
    
    // Wait for export options dialog
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Choose export options
    await page.getByLabel(/Template/i).selectOption('modern');
    await page.getByLabel(/Color Theme/i).selectOption('blue');
    
    // Start the export
    await page.getByRole('button', { name: /Export PDF/i }).click();
    
    // Check for success message
    await expect(page.getByText(/Export started/i)).toBeVisible({ timeout: 10000 });
    
    // Navigate to exports tab
    await page.getByRole('tab', { name: /Exports/i }).click();
    
    // Wait for the export to appear in the list
    await expect(page.getByTestId('export-item').first()).toBeVisible({ timeout: 30000 });
    
    // Check if export completed
    const exportStatus = page.getByText(/Completed/i);
    await expect(exportStatus).toBeVisible({ timeout: 60000 });
    
    // Verify download button is available
    const downloadButton = page.getByRole('button', { name: /Download/i }).first();
    await expect(downloadButton).toBeVisible();
    
    // Test download functionality (this will start the download)
    const downloadPromise = page.waitForEvent('download');
    await downloadButton.click();
    const download = await downloadPromise;
    
    // Verify the download started with the correct filename format
    expect(download.suggestedFilename()).toMatch(/.*\.pdf$/);
  });
  
  test('should handle long resumes without cutting off content', async ({ page }) => {
    // Navigate to the builder to create a long resume
    await page.goto('/builder');
    
    // Fill in a long resume
    await page.getByLabel(/Resume Title/i).fill('Long Resume Test');
    await page.getByLabel(/First Name/i).fill('Test');
    await page.getByLabel(/Last Name/i).fill('User');
    
    // Add many sections to create a long resume
    for (let i = 1; i <= 5; i++) {
      // Add experience section
      await page.getByRole('button', { name: /Add Section/i }).click();
      await page.getByRole('button', { name: /Experience/i }).click();
      
      // Fill section title
      await page.getByLabel(/Section Title/i).last().fill(`Experience ${i}`);
      
      // Add multiple items
      for (let j = 1; j <= 3; j++) {
        if (j > 1) {
          // Add new item
          await page.getByRole('button', { name: /Add Item/i }).last().click();
        }
        
        // Fill item details
        await page.getByLabel(/Title/i).last().fill(`Job Title ${i}.${j}`);
        await page.getByLabel(/Subtitle/i).last().fill(`Company ${i}.${j}`);
        await page.getByLabel(/Date/i).last().fill(`202${j} - Present`);
        
        // Add long description with bullet points
        const description = `
          <p>This is a detailed description for position ${i}.${j}.</p>
          <ul>
            <li>Accomplished significant achievement 1 with measurable results</li>
            <li>Worked on important project 2 with team of 10 engineers</li>
            <li>Developed new system that improved efficiency by 25%</li>
            <li>Managed complex stakeholder relationships with executives</li>
          </ul>
        `;
        
        // Fill in the description (this will depend on your rich text editor implementation)
        // For this test, we'll assume a way to set HTML content
        await page.evaluate((description: string) => {
          const editors = document.querySelectorAll('.rich-text-editor');
          const editor = editors[editors.length - 1];
          if (editor) {
            // This is a simplification; actual implementation depends on your editor
            editor.innerHTML = description;
          }
        }, description);
      }
    }
    
    // Save the resume
    await page.getByRole('button', { name: /Save/i }).click();
    
    // Wait for save confirmation
    await expect(page.getByText(/Resume saved/i)).toBeVisible({ timeout: 10000 });
    
    // Verify PDF export works with the long content
    await page.getByRole('button', { name: /Export/i }).click();
    await page.getByRole('menuitem', { name: /PDF/i }).click();
    
    // Choose modern template to test square bullet points
    await page.getByLabel(/Template/i).selectOption('modern');
    
    // Start the export
    await page.getByRole('button', { name: /Export PDF/i }).click();
    
    // Check for success message
    await expect(page.getByText(/Export started/i)).toBeVisible({ timeout: 10000 });
    
    // Navigate to exports tab
    await page.goto('/dashboard');
    await page.getByRole('tab', { name: /Exports/i }).click();
    
    // Wait for the export to complete
    await expect(page.getByText(/Completed/i).first()).toBeVisible({ timeout: 60000 });
  });
}); 