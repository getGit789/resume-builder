# HTML to PDF Conversion Service

A scalable and efficient service for converting HTML content to PDF using Puppeteer and Node.js.

## Features

- **Concurrent Processing**: Handles multiple requests simultaneously with controlled resource usage.
- **Browser Pooling**: Reuses browser instances and pages for optimal performance.
- **REST API**: Simple API endpoint for HTML to PDF conversion.
- **Dockerized**: Easy deployment with Docker.
- **Monitoring and Logging**: Integrated logging and metrics for observability.

## API

### Convert HTML to PDF

`POST /api/convert`

Request Body:

```json
{
  "html": "<html>...</html>",
  "options": {
    "format": "A4",
    "orientation": "portrait",
    "margin": {
      "top": "20mm",
      "right": "20mm",
      "bottom": "20mm",
      "left": "20mm"
    },
    "scale": 1,
    "preferCssPageSize": true,
    "printBackground": true,
    "displayHeaderFooter": false,
    "headerTemplate": "",
    "footerTemplate": "",
    "timeout": 30000
  }
}
```

Response:
- PDF file with `Content-Type: application/pdf`

### Health Check

`GET /health`

Response:

```json
{
  "status": "ok",
  "uptime": 12345.67,
  "memory": {
    "rss": 12345678,
    "heapTotal": 12345678,
    "heapUsed": 12345678,
    "external": 12345678,
    "arrayBuffers": 12345678
  },
  "cpus": 4,
  "pool": {
    "available": 3,
    "active": 2,
    "max": 5
  }
}
```

## Deployment

### Docker

```bash
# Build the image
docker build -t html-to-pdf-service .

# Run the container
docker run -p 3001:3001 -d html-to-pdf-service
```

### Docker Compose

```bash
# Start the service
docker-compose up -d

# Check logs
docker-compose logs -f
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Port the service listens on | 3001 |
| LOG_LEVEL | Logging level (debug, info, warn, error) | info |
| MAX_CONCURRENT_JOBS | Maximum number of concurrent conversion jobs | 5 |
| REQUEST_TIMEOUT | Timeout for conversion requests in ms | 60000 |
| TEMP_DIR | Directory for temporary files | ./data/temp |

## Integration with Resume Builder

This service is used by the Resume Builder application to generate high-quality PDF exports of resumes.

### Usage

1. The client sends the HTML content of a resume to the Resume Builder API
2. The server forwards the request to this service
3. This service converts the HTML to PDF using Puppeteer
4. The PDF is returned to the client for download

## License

MIT 