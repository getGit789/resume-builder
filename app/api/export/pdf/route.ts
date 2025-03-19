import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import puppeteer from "puppeteer"

/**
 * PDF Export API Route
 * 
 * This route acts as a proxy between the client-side and our HTML to PDF conversion service
 * It helps to:
 * 1. Prevent direct access to the PDF service
 * 2. Add authentication when needed
 * 3. Handle errors consistently
 */

// Configuration
const PDF_SERVICE_URL = process.env.PDF_SERVICE_URL || 'http://localhost:3001/api/convert';
const REQUEST_TIMEOUT = 60000; // 1 minute timeout

export async function POST(req: Request) {
  try {
    const { html, options } = await req.json()

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    })

    // Create a new page
    const page = await browser.newPage()

    // Set content and wait for network idle
    await page.setContent(html, {
      waitUntil: "networkidle0"
    })

    // Set viewport and format
    await page.setViewport({
      width: 794, // A4 width in pixels at 96 DPI
      height: 1123, // A4 height in pixels at 96 DPI
      deviceScaleFactor: 2
    })

    // Generate PDF
    const pdf = await page.pdf({
      format: options.format || "A4",
      margin: options.margin || {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm"
      },
      printBackground: true,
      preferCSSPageSize: true
    })

    // Close browser
    await browser.close()

    // Return PDF
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=resume.pdf"
      }
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return new NextResponse(
      JSON.stringify({ error: "Failed to generate PDF" }), 
      { status: 500 }
    )
  }
}

// Also support HEAD requests to check if the service is available
export async function HEAD() {
  try {
    const response = await fetch(PDF_SERVICE_URL, {
      method: 'HEAD',
    });
    
    return new NextResponse(null, {
      status: response.ok ? 200 : 503,
    });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
} 