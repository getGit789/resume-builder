import { test, expect } from '@playwright/test';

test.describe('Resume Share Functionality', () => {
  test('should share a resume and access it via share link', async ({ page, context }) => {
    // Step 1: Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Step 2: Create a new resume if none exists
    const noResumesText = page.getByText('No resumes yet');
    if (await noResumesText.isVisible()) {
      await page.getByRole('button', { name: /Create New Resume/i }).click();
      
      // Fill in basic resume details
      await expect(page).toHaveURL(/.*\/editor\/new/);
      await page.getByLabel(/Resume Title/i).fill('Test Resume for Sharing');
      await page.getByLabel(/Full Name/i).fill('John Doe');
      await page.getByLabel(/Email/i).fill('john.doe@example.com');
      
      // Save the resume
      await page.getByRole('button', { name: /Save/i }).click();
      await expect(page.getByText(/Resume saved/i)).toBeVisible({ timeout: 10000 });
      
      // Go back to dashboard
      await page.getByRole('link', { name: /Dashboard/i }).click();
    }
    
    // Step 3: Find the first resume in the list
    const resumeCard = page.locator('.card').first();
    await expect(resumeCard).toBeVisible();
    
    // Step 4: Click on the share button
    // Note: We need to add a share button to the resume card in the UI
    const shareButton = resumeCard.getByRole('button', { name: /Share/i });
    await shareButton.click();
    
    // Step 5: Toggle sharing on
    const shareToggle = page.getByRole('switch', { name: /Share resume/i });
    await shareToggle.click();
    
    // Step 6: Wait for the share URL to appear
    const shareUrlField = page.getByTestId('share-url');
    await expect(shareUrlField).toBeVisible({ timeout: 10000 });
    
    // Step 7: Get the share URL
    const shareUrl = await shareUrlField.inputValue();
    expect(shareUrl).toContain('/share/');
    
    // Step 8: Close the share dialog
    await page.getByRole('button', { name: /Close/i }).click();
    
    // Step 9: Open the shared resume in a new browser context
    const newPage = await context.newPage();
    await newPage.goto(shareUrl);
    
    // Step 10: Verify the shared resume is visible
    await expect(newPage.getByTestId('resume-preview')).toBeVisible({ timeout: 10000 });
    
    // Step 11: Verify the resume contains the expected content
    await expect(newPage.getByText('John Doe')).toBeVisible();
    
    // Step 12: Test the download functionality on the shared page
    const downloadButton = newPage.getByRole('button', { name: /Download/i });
    await expect(downloadButton).toBeVisible();
    
    // Close the new page
    await newPage.close();
  });
  
  test('should be able to disable sharing', async ({ page }) => {
    // Step 1: Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Step 2: Find the first resume in the list
    const resumeCard = page.locator('.card').first();
    await expect(resumeCard).toBeVisible();
    
    // Step 3: Click on the share button
    const shareButton = resumeCard.getByRole('button', { name: /Share/i });
    await shareButton.click();
    
    // Step 4: Check if sharing is already enabled
    const shareToggle = page.getByRole('switch', { name: /Share resume/i });
    const isEnabled = await shareToggle.isChecked();
    
    // Step 5: If sharing is enabled, disable it
    if (isEnabled) {
      await shareToggle.click();
      
      // Wait for the share URL to disappear
      await expect(page.getByText(/Resume is no longer shared/i)).toBeVisible({ timeout: 10000 });
    } else {
      // If sharing is not enabled, enable it first
      await shareToggle.click();
      await expect(page.getByTestId('share-url')).toBeVisible({ timeout: 10000 });
      
      // Then disable it
      await shareToggle.click();
      await expect(page.getByText(/Resume is no longer shared/i)).toBeVisible({ timeout: 10000 });
    }
    
    // Step 6: Close the share dialog
    await page.getByRole('button', { name: /Close/i }).click();
  });
}); 