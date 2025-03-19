# Deployment Guide for Resume Builder

This document outlines the steps required to deploy the Resume Builder application to production and staging environments.

## Prerequisites

- Node.js 18 or later
- PostgreSQL database
- Redis instance
- Vercel account (or alternative hosting platform)
- GitHub repository with CI/CD workflows

## Environment Variables

The following environment variables need to be set in your deployment environment:

```
# Database
DATABASE_URL=postgresql://username:password@hostname:port/database

# Redis
REDIS_URL=redis://hostname:port
REDIS_HOST=hostname
REDIS_PORT=6379

# Application
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
```

## CI/CD Setup

### GitHub Secrets

Add the following secrets to your GitHub repository:

1. `DATABASE_URL`: Production database connection string
2. `REDIS_URL`: Production Redis connection string
3. `REDIS_HOST`: Production Redis hostname
4. `REDIS_PORT`: Production Redis port
5. `NEXT_PUBLIC_APP_URL`: Production application URL
6. `VERCEL_TOKEN`: Vercel API token
7. `VERCEL_ORG_ID`: Vercel organization ID
8. `VERCEL_PROJECT_ID`: Vercel project ID
9. `SLACK_WEBHOOK`: Slack webhook URL for notifications

For staging environment, add these additional secrets:
1. `STAGING_DATABASE_URL`: Staging database connection string
2. `STAGING_REDIS_URL`: Staging Redis connection string
3. `STAGING_REDIS_HOST`: Staging Redis hostname
4. `STAGING_REDIS_PORT`: Staging Redis port
5. `STAGING_APP_URL`: Staging application URL

## Deployment Workflow

### Staging Deployment

1. Push changes to the `Testing_pre_Production` branch or create a pull request to the `main` branch
2. GitHub Actions will automatically:
   - Run tests
   - Build the application
   - Deploy to the staging environment
   - Send a notification upon completion

### Production Deployment

1. Merge changes to the `main` branch
2. GitHub Actions will automatically:
   - Run tests
   - Build the application
   - Deploy to the production environment
   - Send a notification upon completion

Alternatively, you can manually trigger the production deployment workflow from the GitHub Actions tab.

## Manual Deployment

If you need to deploy manually:

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

4. Build the application:
   ```bash
   npm run build
   ```

5. Start the production server:
   ```bash
   npm start
   ```

## Database Migrations

When deploying database changes:

1. Create a migration:
   ```bash
   npm run db:migrate
   ```

2. Apply the migration in production:
   ```bash
   DATABASE_URL=your_production_db_url npx prisma migrate deploy
   ```

## Monitoring and Logging

- Set up application monitoring using a service like New Relic, Datadog, or Sentry
- Configure logging to capture errors and performance metrics
- Set up alerts for critical errors or performance degradation

## Rollback Procedure

If you need to rollback a deployment:

1. Identify the last stable version
2. Revert to that commit in the repository
3. Trigger a manual deployment from the GitHub Actions tab
4. If database changes need to be reverted, run the appropriate migration rollback

## Troubleshooting

Common issues and their solutions:

1. **Database connection errors**: Check the DATABASE_URL environment variable and ensure the database is accessible from the deployment environment.

2. **Redis connection errors**: Verify the Redis connection details and ensure Redis is running.

3. **Build failures**: Check the build logs for specific errors. Common issues include missing dependencies or TypeScript errors.

4. **Deployment timeouts**: This could be due to large build sizes or slow network connections. Consider optimizing the build process.

## Security Considerations

- Ensure all environment variables are securely stored
- Regularly update dependencies to patch security vulnerabilities
- Implement rate limiting for API endpoints
- Use HTTPS for all connections
- Consider implementing a Web Application Firewall (WAF) 