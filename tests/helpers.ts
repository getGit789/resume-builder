import { test as base, expect, Page } from '@playwright/test';

// Define the type for our custom fixtures
type CustomFixtures = {
  loggedInPage: Page;
};

// Extend the base test with custom fixtures
export const test = base.extend<CustomFixtures>({
  // Add a logged-in state fixture
  loggedInPage: async ({ page }, use) => {
    // In a real app with authentication, we would log in here
    // For now, we'll just navigate to the home page
    await page.goto('/');
    
    // Use the page in the logged-in state
    await use(page);
  },
});

// Re-export expect
export { expect };

// Helper functions
export async function createTestResume(page: Page): Promise<string> {
  // Navigate to the dashboard
  await page.goto('/dashboard');
  
  // Click on the "Create Resume" button
  await page.getByRole('link', { name: /Create Resume/i }).click();
  
  // Check if we've navigated to the resume editor
  await expect(page).toHaveURL(/.*\/editor\/new/);
  
  // Fill in the resume details with test data
  const resumeTitle = `Test Resume ${Date.now()}`;
  
  // Fill the resume title
  await page.getByLabel(/Resume Title/i).fill(resumeTitle);
  
  // Fill personal information
  await page.getByLabel(/Full Name/i).fill('Test User');
  await page.getByLabel(/Email/i).fill('test@example.com');
  await page.getByLabel(/Phone/i).fill('123-456-7890');
  
  // Select a template
  await page.getByText(/Modern/i).click();
  
  // Save the resume
  await page.getByRole('button', { name: /Save/i }).click();
  
  // Wait for the save confirmation
  await expect(page.getByText(/Resume saved/i)).toBeVisible({ timeout: 10000 });
  
  // Return the resume title for later identification
  return resumeTitle;
}

export async function shareResume(page: Page, resumeTitle: string): Promise<string> {
  // Navigate to the dashboard
  await page.goto('/dashboard');
  
  // Find the resume with the given title
  const resumeItem = page.getByText(resumeTitle).first();
  await expect(resumeItem).toBeVisible();
  
  // Find the parent resume item container
  const container = resumeItem.locator('..').locator('..');
  
  // Click on the share button for the resume
  await container.getByRole('button', { name: /Share/i }).click();
  
  // Toggle sharing on
  await page.getByRole('switch', { name: /Share resume/i }).click();
  
  // Wait for the share URL to appear
  const shareUrlField = page.getByTestId('share-url');
  await expect(shareUrlField).toBeVisible({ timeout: 10000 });
  
  // Get the share URL
  const shareUrl = await shareUrlField.inputValue();
  
  // Close the share dialog
  await page.getByRole('button', { name: /Close/i }).click();
  
  // Extract and return the token from the URL
  const token = shareUrl.split('/').pop() || '';
  return token;
} 