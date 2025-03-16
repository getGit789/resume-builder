import { test, expect } from '../helpers';

test.describe('Using Custom Fixtures', () => {
  test('should use the loggedInPage fixture', async ({ loggedInPage }) => {
    // The page is already navigated to the home page by the fixture
    
    // Navigate to the dashboard
    await loggedInPage.goto('/dashboard');
    
    // Check if the dashboard heading is visible
    const dashboardHeading = loggedInPage.getByRole('heading', { name: /Dashboard/i });
    await expect(dashboardHeading).toBeVisible();
    
    // Check if the "Create Resume" button is visible
    const createButton = loggedInPage.getByRole('link', { name: /Create Resume/i });
    await expect(createButton).toBeVisible();
    
    // Click on the "Create Resume" button
    await createButton.click();
    
    // Check if we've navigated to the resume editor
    await expect(loggedInPage).toHaveURL(/.*\/editor\/new/);
  });
}); 