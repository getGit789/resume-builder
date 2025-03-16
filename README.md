# ResumeForge

A modern resume builder application built with Next.js, React, TypeScript, and Tailwind CSS.

## Features

- **Interactive Resume Builder**: Create and edit resumes with a user-friendly interface
- **Real-time Preview**: See changes to your resume in real-time
- **Multiple Templates**: Choose from various professional templates
- **Export Options**: Export your resume as PDF or DOCX
- **Resume Sharing**: Share your resume with a unique link
- **Dashboard**: Manage all your resumes in one place

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS, Shadcn UI
- **State Management**: Zustand
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (with mock implementation for development)
- **Queue**: Bull (with mock implementation for development)
- **Testing**: Playwright for end-to-end testing

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/resume-builder.git
   cd resume-builder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

We use Playwright for end-to-end testing to ensure the application works correctly across different browsers and devices.

### Setting Up Tests

1. Install Playwright browsers:
   ```bash
   npx playwright install --with-deps
   ```

2. Run the tests:
   ```bash
   npm test
   ```

### Test Categories

Our test suite includes:

- **Basic Navigation**: Tests for home page and navigation
- **Resume Creation**: Tests for creating and editing resumes
- **Export Functionality**: Tests for exporting resumes to PDF and DOCX
- **Share Functionality**: Tests for sharing resumes via unique links
- **Mobile Responsiveness**: Tests for proper display on mobile devices
- **State Management**: Tests for Zustand store integration
- **Error Handling**: Tests for validation and error states

### Running Specific Tests

```bash
# Run tests with UI mode for debugging
npm run test:ui

# Run tests in headed mode (visible browser)
npm run test:headed

# Run a specific test file
npm test -- tests/e2e/home.spec.ts

# Run tests with a specific tag
npm test -- --grep "@smoke"
```

### CI/CD Integration

The project includes a GitHub Actions workflow for continuous integration. The workflow runs all tests on each push to the main branch and on pull requests.

## Project Structure

```
├── app/                  # Next.js App Router
│   ├── api/              # API routes
│   ├── dashboard/        # Dashboard page
│   ├── editor/           # Resume editor
│   ├── share/            # Shared resume view
│   └── page.tsx          # Home page
├── components/           # React components
├── lib/                  # Utility functions and shared code
├── prisma/               # Prisma schema and migrations
├── public/               # Static assets
├── store/                # Zustand stores
├── styles/               # Global styles
└── tests/                # Playwright tests
    ├── e2e/              # End-to-end test files
    └── helpers.ts        # Test helpers and fixtures
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 