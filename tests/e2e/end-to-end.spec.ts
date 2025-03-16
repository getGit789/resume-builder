import { test, expect, createTestResume, shareResume } from '../helpers';

test.describe('End-to-End Resume Flow', () => {
  test('should create, edit, share, and view a resume', async ({ page }) => {
    // Step 1: Create a new resume
    const resumeTitle = await createTestResume(page);
    
    // Verify we're redirected to the dashboard or resume view
    await expect(page).toHaveURL(/.*\/dashboard|.*\/editor\/[\w-]+/);
    
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Verify the resume appears in the list
    await expect(page.getByText(resumeTitle)).toBeVisible();
    
    // Step 2: Edit the resume
    // Click on the resume to edit it
    await page.getByText(resumeTitle).click();
    
    // Check if we've navigated to the resume editor
    await expect(page).toHaveURL(/.*\/editor\/[\w-]+/);
    
    // Edit the resume title
    const updatedTitle = `${resumeTitle} (Updated)`;
    const titleInput = page.getByLabel(/Resume Title/i);
    await titleInput.clear();
    await titleInput.fill(updatedTitle);
    
    // Save the changes
    await page.getByRole('button', { name: /Save/i }).click();
    
    // Wait for the save confirmation
    await expect(page.getByText(/Resume saved/i)).toBeVisible({ timeout: 10000 });
    
    // Navigate back to dashboard
    await page.getByRole('link', { name: /Dashboard/i }).click();
    
    // Verify the updated resume title is visible
    await expect(page.getByText(updatedTitle)).toBeVisible();
    
    // Step 3: Share the resume
    const shareToken = await shareResume(page, updatedTitle);
    
    // Verify we got a valid share token
    expect(shareToken).toBeTruthy();
    expect(shareToken.length).toBeGreaterThan(5);
    
    // Step 4: View the shared resume
    await page.goto(`/share/${shareToken}`);
    
    // Check if the resume content is visible
    await expect(page.getByTestId('resume-preview')).toBeVisible({ timeout: 10000 });
    
    // Verify that the resume contains the test user's name
    await expect(page.getByText('Test User')).toBeVisible();
    
    // Step 5: Export the resume
    // Go back to dashboard
    await page.goto('/dashboard');
    
    // Find the resume with the updated title
    const resumeItem = page.getByText(updatedTitle).first();
    await expect(resumeItem).toBeVisible();
    
    // Find the parent resume item container
    const container = resumeItem.locator('..').locator('..');
    
    // Click on the export button for the resume
    await container.getByRole('button', { name: /Export/i }).click();
    
    // Select PDF format from the dropdown (if there's a dropdown)
    await page.getByRole('menuitem', { name: /PDF/i }).click();
    
    // Wait for the export process to start
    await expect(page.getByText(/Export started/i)).toBeVisible({ timeout: 5000 });
    
    // Navigate to the exports page
    await page.getByRole('link', { name: /Exports/i }).click();
    
    // Verify that the export appears in the list
    await expect(page.getByTestId('export-item').first()).toBeVisible({ timeout: 15000 });
  });
}); 