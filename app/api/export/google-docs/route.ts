import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

/**
 * Google Docs Export API Route
 * 
 * This route prepares resume content for Google Docs by extracting and formatting
 * text content from HTML, then provides a URL and instructions to the user.
 * No authentication required - this allows guest users to export their resumes.
 */

export async function POST(req: Request) {
  try {
    const { html, options } = await req.json();
    
    if (!html) {
      return NextResponse.json(
        { error: "HTML content is required" }, 
        { status: 400 }
      );
    }
    
    // Extract and format the content from HTML using Cheerio
    const $ = cheerio.load(html);
    
    // Format the text in a more structured way
    let formattedContent = '';
    
    try {
      // Get the resume name/title
      const title = $('.resume-name, .header-name, h1').first().text().trim() || 'Resume';
      formattedContent += `${title}\n\n`;
      
      // Get contact information
      $('.contact-info, .header-contact, .personal-info').each((_, el) => {
        formattedContent += `${$(el).text().trim().replace(/\s+/g, ' ')}\n`;
      });
      formattedContent += '\n';
      
      // Get summary if present
      $('.summary, .professional-summary').each((_, el) => {
        formattedContent += `PROFESSIONAL SUMMARY\n${$(el).text().trim()}\n\n`;
      });
      
      // Get each section
      $('.section, .resume-section').each((_, sectionEl) => {
        const sectionTitle = $(sectionEl).find('.section-title, h2, h3').first().text().trim();
        if (sectionTitle) {
          formattedContent += `${sectionTitle.toUpperCase()}\n`;
          
          // Get items in the section
          $(sectionEl).find('.section-item, .resume-item').each((_, itemEl) => {
            const itemTitle = $(itemEl).find('.item-title, .title, h4').first().text().trim();
            const itemSubtitle = $(itemEl).find('.item-subtitle, .subtitle').first().text().trim();
            const itemDate = $(itemEl).find('.item-date, .date').first().text().trim();
            const itemDesc = $(itemEl).find('.item-description, .description, p').text().trim();
            
            if (itemTitle) formattedContent += `${itemTitle}\n`;
            if (itemSubtitle) formattedContent += `${itemSubtitle}\n`;
            if (itemDate) formattedContent += `${itemDate}\n`;
            if (itemDesc) formattedContent += `${itemDesc}\n`;
            formattedContent += '\n';
          });
          
          formattedContent += '\n';
        }
      });
    } catch (parseError) {
      console.error("Error parsing HTML content:", parseError);
      // Fallback to simple text extraction if structured parsing fails
      formattedContent = $.text().trim();
    }
    
    // If we couldn't extract any content, return an error
    if (!formattedContent.trim()) {
      return NextResponse.json(
        { error: "Could not extract content from HTML" }, 
        { status: 400 }
      );
    }
    
    // Get title for the doc, or use fallback
    const title = $('.resume-name, .header-name, h1').first().text().trim() || 'Resume';
    const encodedTitle = encodeURIComponent(title || 'Resume');
    
    // Create Google Docs URL with minimal content
    const googleDocsUrl = `https://docs.new?title=${encodedTitle}`;
    
    // Return both the URL and the formatted content
    return NextResponse.json({
      success: true,
      url: googleDocsUrl,
      content: formattedContent,
      instructions: "1. Click the link to open a new Google Doc. 2. Paste the copied content into the document."
    });
  } catch (error) {
    console.error("Google Docs export error:", error);
    return NextResponse.json(
      { error: "Failed to generate Google Docs export", details: error instanceof Error ? error.message : "Unknown error" }, 
      { status: 500 }
    );
  }
} 