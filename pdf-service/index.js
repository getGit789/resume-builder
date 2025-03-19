const express = require('express');
const puppeteer = require('puppeteer');
const { join } = require('path');
const fs = require('fs/promises');
const os = require('os');
const { createLogger, format, transports } = require('winston');

// Configuration from environment variables
const PORT = process.env.PORT || 3001;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const MAX_CONCURRENT_JOBS = parseInt(process.env.MAX_CONCURRENT_JOBS || '5', 10);
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT || '60000', 10); // 60 seconds
const TEMP_DIR = process.env.TEMP_DIR || join(__dirname, 'data', 'temp');

// Configure logger
const logger = createLogger({
  level: LOG_LEVEL,
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console()
  ]
});

// The application
const app = express();
app.use(express.json({ limit: '50mb' }));

// Browser pool management
let browserPromise = null;
const pagePool = [];
let activeJobs = 0;

// Initialize browser and page pool
async function initializeBrowser() {
  if (!browserPromise) {
    logger.info('Launching browser...');
    browserPromise = puppeteer.launch({
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--font-render-hinting=none'
      ]
    });
    
    const browser = await browserPromise;
    logger.info('Browser launched successfully');
    
    // Create initial page pool
    for (let i = 0; i < MAX_CONCURRENT_JOBS; i++) {
      try {
        const page = await browser.newPage();
        pagePool.push(page);
        logger.debug(`Created page ${i+1}/${MAX_CONCURRENT_JOBS} for pool`);
      } catch (error) {
        logger.error('Error creating page for pool', { error });
      }
    }
    
    logger.info(`Page pool initialized with ${pagePool.length} pages`);
  }
  
  return browserPromise;
}

// Get a page from the pool or create a new one if needed
async function getPage() {
  // Initialize browser if needed
  await initializeBrowser();
  
  if (pagePool.length > 0) {
    return pagePool.pop();
  }
  
  // If no pages in pool but we're under the limit, create a new one
  if (activeJobs < MAX_CONCURRENT_JOBS) {
    logger.debug('Creating new page outside of pool');
    const browser = await browserPromise;
    return browser.newPage();
  }
  
  // No pages available, we need to wait
  logger.warn('No pages available, waiting...');
  return new Promise((resolve) => {
    const checkInterval = setInterval(async () => {
      if (pagePool.length > 0) {
        clearInterval(checkInterval);
        resolve(pagePool.pop());
      } else if (activeJobs < MAX_CONCURRENT_JOBS) {
        clearInterval(checkInterval);
        const browser = await browserPromise;
        resolve(browser.newPage());
      }
    }, 500);
  });
}

// Return a page to the pool
function releasePage(page) {
  try {
    // Reset page state
    page.removeAllListeners();
    
    // Clear cookies and cache
    page.deleteCookie();
    
    // Return to pool
    pagePool.push(page);
    logger.debug('Page returned to pool');
  } catch (error) {
    logger.error('Error releasing page back to pool', { error });
  }
}

// Ensure temp directory exists
async function ensureTempDir() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (error) {
    logger.error('Error creating temp directory', { error });
    throw error;
  }
}

// Main conversion route
app.post('/api/convert', async (req, res) => {
  const startTime = Date.now();
  let page = null;
  
  try {
    const { html, options = {} } = req.body;
    
    if (!html) {
      return res.status(400).json({ error: 'HTML content is required' });
    }
    
    // Get a page and increment job counter
    activeJobs++;
    page = await getPage();
    
    // Setup page settings with higher DPI
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 2,
    });
    
    // Setup timeout
    const timeout = setTimeout(() => {
      logger.error('Request timeout exceeded');
      if (page) {
        page.evaluate(() => document.body.innerHTML = '<h1>Request timeout exceeded</h1>');
      }
    }, REQUEST_TIMEOUT);
    
    // Load the HTML content and wait for everything to be ready
    logger.debug('Loading HTML content into page');
    await page.setContent(html, {
      waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
      timeout: REQUEST_TIMEOUT,
    });
    
    // Wait for fonts and images to load
    await page.evaluate(async () => {
      // Wait for fonts
      await document.fonts.ready;
      
      // Wait for all images
      const images = Array.from(document.images);
      await Promise.all(images.map(img => {
        if (img.complete) return;
        return new Promise((resolve, reject) => {
          img.addEventListener('load', resolve);
          img.addEventListener('error', resolve); // Don't fail on image error
        });
      }));
      
      // Force a repaint
      document.body.style.display = 'none';
      document.body.offsetHeight;
      document.body.style.display = '';
    });
    
    // Ensure temp directory exists
    await ensureTempDir();
    
    // Generate a unique filename
    const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 10);
    const pdfPath = join(TEMP_DIR, `${uniqueId}.pdf`);
    
    // Set PDF options with better quality settings
    const pdfOptions = {
      path: pdfPath,
      format: options.format || 'A4',
      printBackground: true,
      margin: options.margin || { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      preferCSSPageSize: true,
      scale: options.scale || 1,
      landscape: options.orientation === 'landscape',
      displayHeaderFooter: false,
      omitBackground: false,
      timeout: REQUEST_TIMEOUT,
    };
    
    // Generate PDF
    logger.debug('Generating PDF', { options: pdfOptions });
    await page.pdf(pdfOptions);
    
    // Clear timeout
    clearTimeout(timeout);
    
    // Read the file and send it as the response
    const pdfBuffer = await fs.readFile(pdfPath);
    
    // Cleanup
    await fs.unlink(pdfPath).catch(err => logger.warn('Error deleting temp file', { error: err }));
    
    // Send the PDF
    res.contentType('application/pdf');
    res.send(pdfBuffer);
    
    logger.info('PDF generation successful', {
      processingTime: Date.now() - startTime,
      fileSize: pdfBuffer.length,
    });
  } catch (error) {
    logger.error('PDF generation failed', { error });
    
    if (!res.headersSent) {
      res.status(500).json({
        error: 'PDF generation failed',
        message: error.message,
      });
    }
  } finally {
    // Decrement job counter and release page back to pool
    activeJobs--;
    if (page) {
      releasePage(page);
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpus: os.cpus().length,
    pool: {
      available: pagePool.length,
      active: activeJobs,
      max: MAX_CONCURRENT_JOBS,
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err });
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// Start the server
app.listen(PORT, async () => {
  logger.info(`PDF conversion service started on port ${PORT}`);
  
  // Initialize browser and page pool
  try {
    await initializeBrowser();
    logger.info('Browser and page pool initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize browser and page pool', { error });
    process.exit(1);
  }
}); 