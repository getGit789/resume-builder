import { test, expect } from '@playwright/test';

test.describe('Resume Editor', () => {
  test('should create a new resume with all sections', async ({ page }) => {
    // Navigate to the editor
    await page.goto('/builder');
    
    // Check if we're on the editor page
    await expect(page).toHaveURL(/.*\/editor\/new/);
    
    // Fill in the resume title
    await page.getByLabel(/Resume Title/i).fill('Comprehensive Test Resume');
    
    // Fill in personal information
    await page.getByLabel(/First Name/i).fill('John');
    await page.getByLabel(/Last Name/i).fill('Doe');
    await page.getByLabel(/Title/i).fill('Senior Software Engineer');
    await page.getByLabel(/Email/i).fill('john.doe@example.com');
    await page.getByLabel(/Phone/i).fill('(123) 456-7890');
    await page.getByLabel(/Location/i).fill('San Francisco, CA');
    
    // Fill in summary using the rich text editor
    const summaryEditor = page.locator('[data-testid="summary-editor"]');
    await summaryEditor.click();
    await page.keyboard.type('Experienced software engineer with a passion for building scalable web applications.');
    
    // Add a link
    await page.getByRole('button', { name: /Add Link/i }).click();
    await page.getByLabel(/Link Title/i).fill('GitHub');
    await page.getByLabel(/URL/i).fill('https://github.com/johndoe');
    await page.getByRole('button', { name: /Save Link/i }).click();
    
    // Add experience
    const experienceSection = page.locator('[data-testid="section-experience"]');
    await experienceSection.getByRole('button', { name: /Add Item/i }).click();
    
    // Fill in experience details
    await page.getByLabel(/Title/i).nth(1).fill('Senior Developer');
    await page.getByLabel(/Subtitle/i).nth(0).fill('Tech Company Inc.');
    await page.getByLabel(/Date/i).nth(0).fill('Jan 2020 - Present');
    
    // Fill in description
    const descriptionEditor = page.locator('[data-testid="description-editor"]').first();
    await descriptionEditor.click();
    await page.keyboard.type('Led development of key features for the company\'s flagship product.');
    
    // Add education
    const educationSection = page.locator('[data-testid="section-education"]');
    await educationSection.getByRole('button', { name: /Add Item/i }).click();
    
    // Fill in education details
    await page.getByLabel(/Title/i).nth(2).fill('Bachelor of Science in Computer Science');
    await page.getByLabel(/Subtitle/i).nth(1).fill('University of Technology');
    await page.getByLabel(/Date/i).nth(1).fill('2012 - 2016');
    
    // Add skills
    const skillsSection = page.locator('[data-testid="section-skills"]');
    await skillsSection.getByRole('button', { name: /Add Item/i }).click();
    
    // Fill in skills details
    await page.getByLabel(/Title/i).nth(3).fill('Programming Languages');
    await page.getByLabel(/Subtitle/i).nth(2).fill('JavaScript, TypeScript, Python, Java');
    
    // Add a new section
    await page.getByRole('button', { name: /Add Section/i }).click();
    await page.getByLabel(/Section Title/i).fill('Projects');
    await page.getByRole('button', { name: /Add Section/i }).nth(1).click();
    
    // Fill in the new section
    const projectsSection = page.locator('[data-testid="section-projects"]');
    await projectsSection.getByRole('button', { name: /Add Item/i }).click();
    
    // Fill in project details
    await page.getByLabel(/Title/i).nth(4).fill('Personal Website');
    await page.getByLabel(/Subtitle/i).nth(3).fill('Next.js, React, TypeScript');
    await page.getByLabel(/Date/i).nth(2).fill('2023');
    
    // Select a template
    await page.getByRole('button', { name: /Templates/i }).click();
    await page.getByText(/Modern/i).click();
    
    // Select a color theme
    await page.getByRole('button', { name: /Colors/i }).click();
    await page.getByText(/Blue/i).click();
    
    // Save the resume
    await page.getByRole('button', { name: /Save/i }).click();
    
    // Wait for the save confirmation
    await expect(page.getByText(/Resume saved/i)).toBeVisible({ timeout: 10000 });
    
    // Verify we're redirected to the dashboard or stay on the editor
    await expect(page).toHaveURL(/.*\/dashboard|.*\/editor\/[\w-]+/);
  });
  
  test('should edit an existing resume', async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('/dashboard');
    
    // Click on the first resume in the list
    const resumeCard = page.locator('.card').first();
    await resumeCard.getByRole('button', { name: /Edit/i }).click();
    
    // Check if we've navigated to the resume editor
    await expect(page).toHaveURL(/.*\/editor\/[\w-]+/);
    
    // Edit the resume title
    const titleInput = page.getByLabel(/Resume Title/i);
    await titleInput.clear();
    await titleInput.fill('Updated Resume Title');
    
    // Edit the job title
    const jobTitleInput = page.getByLabel(/Title/i).first();
    await jobTitleInput.clear();
    await jobTitleInput.fill('Lead Software Engineer');
    
    // Change the template
    await page.getByRole('button', { name: /Templates/i }).click();
    await page.getByText(/Minimalist/i).click();
    
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