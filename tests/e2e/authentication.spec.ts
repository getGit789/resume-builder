import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the authentication page
    await page.goto('/auth/login');
  });

  test('should show login form', async ({ page }) => {
    // Check form elements are visible
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /create account/i })).toBeVisible();
  });

  test('should display validation errors on invalid input', async ({ page }) => {
    // Click the sign in button without entering credentials
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
    
    // Enter invalid email
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for email validation error
    await expect(page.getByText(/invalid email address/i)).toBeVisible();
  });

  test('should show Google OAuth button', async ({ page }) => {
    // Check for Google sign-in button
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
  });

  test('should redirect to dashboard after successful login', async ({ page }) => {
    // Mock successful authentication response
    await page.route('**/api/auth/callback/credentials', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          ok: true, 
          url: '/dashboard' 
        }),
      });
    });

    // Fill in credentials
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    
    // Submit the form
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Check for redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('should redirect guest users away from dashboard', async ({ page }) => {
    // Set guest mode cookie
    await page.context().addCookies([
      {
        name: 'guestMode',
        value: 'true',
        domain: 'localhost',
        path: '/',
      }
    ]);

    // Try to navigate to dashboard
    await page.goto('/dashboard');
    
    // Verify redirect to auth page
    await expect(page).toHaveURL(/.*\/auth/);
  });

  test('should allow guest users to create resumes', async ({ page }) => {
    // Set guest mode cookie
    await page.context().addCookies([
      {
        name: 'guestMode',
        value: 'true',
        domain: 'localhost',
        path: '/',
      }
    ]);

    // Navigate to builder page
    await page.goto('/builder');
    
    // Verify we can access builder
    await expect(page).toHaveURL(/.*\/builder/);
    await expect(page.getByRole('heading', { name: /create your resume/i })).toBeVisible();
  });
}); 