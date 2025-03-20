import { NextResponse } from 'next/server';
import { 
  Document, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  Table, 
  TableRow, 
  TableCell, 
  BorderStyle, 
  WidthType, 
  ExternalHyperlink,
  PageOrientation as DocxPageOrientation,
  Packer
} from 'docx';
import { parse } from 'node-html-parser';

/**
 * DOCX Export API Route
 * 
 * This route handles DOCX export requests using the docx library.
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

    try {
      // Parse the HTML
      const root = parse(html);
      
      // Create a new document
      const doc = new Document({
        title: options?.title || 'Resume',
        description: 'Resume generated using Resume Builder',
        creator: 'Resume Builder',
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1440, // 1 inch (in twips)
                  right: 1440,
                  bottom: 1440,
                  left: 1440,
                },
                size: {
                  width: 12240, // 8.5 inches (in twips)
                  height: 15840, // 11 inches (in twips)
                }
              },
            },
            children: convertHtmlToDocxElements(root),
          },
        ],
      });

      console.log("Document created successfully");

      // Generate the document as a Buffer
      const buffer = await Packer.toBuffer(doc);
      console.log("Buffer generated successfully", buffer.length);
      
      // Return the DOCX file
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="${options?.fileName || 'resume'}.docx"`
        }
      });
    } catch (docxError: unknown) {
      console.error("Specific DOCX generation error:", docxError);
      return NextResponse.json(
        { 
          error: "Failed to generate DOCX document", 
          details: docxError instanceof Error ? docxError.message : String(docxError),
          stack: docxError instanceof Error ? docxError.stack : undefined
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("DOCX generation error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate DOCX",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * Converts HTML elements to DOCX elements
 */
function convertHtmlToDocxElements(root: any) {
  const elements: any[] = [];
  
  // Process all elements
  root.childNodes.forEach((node: any) => {
    if (node.nodeType === 1) { // Element node
      const element = processElement(node);
      if (element) {
        if (Array.isArray(element)) {
          elements.push(...element);
        } else {
          elements.push(element);
        }
      }
    } else if (node.nodeType === 3) { // Text node
      const text = node.text.trim();
      if (text) {
        elements.push(new Paragraph({
          children: [new TextRun(text)],
        }));
      }
    }
  });
  
  return elements;
}

/**
 * Process a single HTML element and convert it to a DOCX element
 */
function processElement(node: any) {
  const tagName = node.tagName?.toLowerCase();
  
  switch (tagName) {
    case 'h1':
      return createHeading(node, HeadingLevel.HEADING_1);
    case 'h2':
      return createHeading(node, HeadingLevel.HEADING_2);
    case 'h3':
      return createHeading(node, HeadingLevel.HEADING_3);
    case 'h4':
      return createHeading(node, HeadingLevel.HEADING_4);
    case 'h5':
      return createHeading(node, HeadingLevel.HEADING_5);
    case 'h6':
      return createHeading(node, HeadingLevel.HEADING_6);
    case 'p':
      return createParagraph(node);
    case 'ul':
      return createList(node, false);
    case 'ol':
      return createList(node, true);
    case 'table':
      return createTable(node);
    case 'div':
      return convertHtmlToDocxElements(node);
    case 'a':
      return createLink(node);
    case 'br':
      return new Paragraph({});
    case 'hr':
      return new Paragraph({
        thematicBreak: true,
      });
    default:
      // For other elements, just process their children
      return node.childNodes.length > 0 ? convertHtmlToDocxElements(node) : null;
  }
}

/**
 * Create a heading paragraph
 */
function createHeading(node: any, level: typeof HeadingLevel[keyof typeof HeadingLevel]) {
  const text = extractTextContent(node);
  
  return new Paragraph({
    heading: level,
    children: [new TextRun(text)],
  });
}

/**
 * Create a regular paragraph
 */
function createParagraph(node: any) {
  const children: any[] = [];
  
  // Process all child nodes
  node.childNodes.forEach((childNode: any) => {
    if (childNode.nodeType === 1) { // Element node
      const style = childNode.getAttribute('style') || '';
      
      if (childNode.tagName.toLowerCase() === 'strong' || childNode.tagName.toLowerCase() === 'b') {
        children.push(new TextRun({
          text: extractTextContent(childNode),
          bold: true,
        }));
      } else if (childNode.tagName.toLowerCase() === 'em' || childNode.tagName.toLowerCase() === 'i') {
        children.push(new TextRun({
          text: extractTextContent(childNode),
          italics: true,
        }));
      } else if (childNode.tagName.toLowerCase() === 'u') {
        children.push(new TextRun({
          text: extractTextContent(childNode),
          underline: {},
        }));
      } else if (childNode.tagName.toLowerCase() === 'a') {
        const href = childNode.getAttribute('href');
        children.push(new ExternalHyperlink({
          children: [
            new TextRun({
              text: extractTextContent(childNode),
              style: "Hyperlink",
            }),
          ],
          link: href || '#',
        }));
      } else {
        children.push(new TextRun(extractTextContent(childNode)));
      }
    } else if (childNode.nodeType === 3) { // Text node
      const text = childNode.text.trim();
      if (text) {
        children.push(new TextRun(text));
      }
    }
  });
  
  return new Paragraph({
    children,
  });
}

/**
 * Create a list (ordered or unordered)
 */
function createList(node: any, ordered: boolean) {
  const items: Paragraph[] = [];
  
  node.querySelectorAll('li').forEach((li: any, index: number) => {
    items.push(
      new Paragraph({
        bullet: { level: 0 },
        children: [new TextRun(extractTextContent(li))],
      })
    );
  });
  
  return items;
}

/**
 * Create a table
 */
function createTable(node: any) {
  const rows: TableRow[] = [];
  
  // Process each row
  node.querySelectorAll('tr').forEach((tr: any) => {
    const cells: TableCell[] = [];
    
    // Process each cell in the row
    tr.querySelectorAll('td, th').forEach((cell: any) => {
      cells.push(
        new TableCell({
          borders: {
            top: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
            left: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
            right: { style: BorderStyle.SINGLE, size: 1, color: "auto" },
          },
          children: [createParagraph(cell)],
        })
      );
    });
    
    rows.push(new TableRow({ children: cells }));
  });
  
  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

/**
 * Create a hyperlink
 */
function createLink(node: any) {
  const href = node.getAttribute('href');
  const text = extractTextContent(node);
  
  return new Paragraph({
    children: [
      new ExternalHyperlink({
        children: [
          new TextRun({
            text: text,
            style: "Hyperlink",
          }),
        ],
        link: href || '#',
      }),
    ],
  });
}

/**
 * Extract text content from an element and its children
 */
function extractTextContent(node: any): string {
  if (node.nodeType === 3) { // Text node
    return node.text;
  }
  
  let text = '';
  
  node.childNodes.forEach((childNode: any) => {
    text += extractTextContent(childNode);
  });
  
  return text;
} 