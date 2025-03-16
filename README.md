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
- **CI/CD**: GitHub Actions for continuous integration and deployment

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- Docker and Docker Compose (optional, for local database)

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

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. (Optional) Start the database and Redis using Docker:
   ```bash
   docker-compose up -d
   ```

5. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

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

## Deployment

The application is set up with a complete CI/CD pipeline using GitHub Actions for automated testing and deployment.

### CI/CD Pipeline

- **Testing**: All code changes are automatically tested using Playwright
- **Staging**: Changes pushed to the `Testing_pre_Production` branch are automatically deployed to the staging environment
- **Production**: Changes merged to the `main` branch are automatically deployed to production

### Deployment Environments

- **Staging**: For testing new features before they go to production
- **Production**: The live environment for end users

For detailed deployment instructions, see the [DEPLOYMENT.md](DEPLOYMENT.md) file.

## Performance Optimizations

The application includes several performance optimizations:

- **Code Splitting**: Using Next.js dynamic imports and React.lazy for component-level code splitting
- **Memoization**: Custom hooks for memoizing expensive computations
- **State Management**: Efficient state management with Zustand
- **Server-Side Rendering**: Leveraging Next.js SSR for improved initial load times
- **Image Optimization**: Using Next.js Image component for optimized image loading

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
├── tests/                # Playwright tests
│   ├── e2e/              # End-to-end test files
│   └── helpers.ts        # Test helpers and fixtures
└── .github/              # GitHub Actions workflows
    └── workflows/        # CI/CD workflow definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 