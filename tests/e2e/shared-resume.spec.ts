import { test, expect } from '@playwright/test';

test.describe('Shared Resume View', () => {
  // This test depends on having a valid share token
  // In a real scenario, we would create a resume, share it, and get the token
  // For this test, we'll use a mock token that should be replaced with a real one
  const mockShareToken = 'mock-token';

  test('should display a shared resume correctly', async ({ page }) => {
    // Navigate to the shared resume page
    await page.goto(`/share/${mockShareToken}`);
    
    // Check if the resume content is visible
    await expect(page.getByTestId('resume-preview')).toBeVisible({ timeout: 10000 });
    
    // Verify that the resume contains expected sections
    await expect(page.getByText(/Personal Information/i)).toBeVisible();
    
    // Check if the download button is available
    const downloadButton = page.getByRole('button', { name: /Download/i });
    await expect(downloadButton).toBeVisible();
  });

  test('should show not found page for invalid share token', async ({ page }) => {
    // Navigate to a shared resume page with an invalid token
    await page.goto('/share/invalid-token-that-does-not-exist');
    
    // Check if the not found message is displayed
    await expect(page.getByText(/Resume not found/i)).toBeVisible();
    
    // Verify that there's a link to go back to the home page
    const homeLink = page.getByRole('link', { name: /Go Home/i });
    await expect(homeLink).toBeVisible();
    
    // Click on the home link and verify navigation
    await homeLink.click();
    await expect(page).toHaveURL('/');
  });
}); 