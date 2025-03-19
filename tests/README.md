# End-to-End Testing with Playwright

This directory contains end-to-end tests for the Resume Builder application using Playwright.

## Test Structure

- `e2e/` - Contains end-to-end test files
- `helpers.ts` - Contains helper functions and custom fixtures

## Test Files

- `home.spec.ts` - Tests for the home page and basic navigation
- `resume-creation.spec.ts` - Tests for creating and editing resumes
- `resume-export.spec.ts` - Tests for exporting and sharing resumes
- `shared-resume.spec.ts` - Tests for viewing shared resumes
- `end-to-end.spec.ts` - Comprehensive end-to-end test covering the entire user flow
- `fixtures.spec.ts` - Example of using custom fixtures
- `resume-editor.spec.ts` - Tests for the resume editor functionality
- `export-functionality.spec.ts` - Tests for the export functionality
- `share-functionality.spec.ts` - Tests for the share functionality
- `mobile-responsiveness.spec.ts` - Tests for mobile responsiveness
- `state-management.spec.ts` - Tests for state management with Zustand stores
- `error-handling.spec.ts` - Tests for error handling and validation

## Running Tests

You can run the tests using the following npm scripts:

```bash
# Run all tests
npm test

# Run tests with UI mode (for debugging and development)
npm run test:ui

# Run tests in debug mode
npm run test:debug

# Run tests in headed mode (visible browser)
npm run test:headed

# Run a specific test file
npm test -- tests/e2e/home.spec.ts

# Run tests with a specific tag
npm test -- --grep "@smoke"
```

## Configuration

The Playwright configuration is in `playwright.config.ts` at the root of the project. It includes:

- Test timeouts and retry settings
- Browser configurations (Chromium and Mobile Chrome)
- Automatic starting of the development server

## Writing New Tests

When writing new tests:

1. Use the helper functions in `helpers.ts` for common operations
2. Follow the existing patterns for page navigation and assertions
3. Use test fixtures for setup and teardown
4. Add appropriate comments to explain test steps

## Test Tags

You can use tags to categorize tests:

```typescript
test('should load the home page @smoke', async ({ page }) => {
  // Test code
});
```

Then run only smoke tests with:

```bash
npm test -- --grep "@smoke"
```

## CI Integration

These tests can be integrated into a CI pipeline by running:

```bash
npx playwright test
```

For CI environments, make sure to install the required dependencies:

```bash
npx playwright install --with-deps
``` 