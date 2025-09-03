import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

async function scrapeAnimeJSDocumentation() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    console.log('🚀 Launching browser and navigating to AnimeJS documentation...');
    const page = await browser.newPage();
    
    // Set viewport to ensure consistent rendering
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to the documentation page
    await page.goto('https://animejs.com/documentation/', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log('📄 Page loaded, extracting content...');
    
    // Wait for the main content to load
    await page.waitForSelector('.documentation-nav', { timeout: 10000 });
    
    // Extract all navigation links first to understand the structure
    const navStructure = await page.evaluate(() => {
      const sections = [];
      const navElements = document.querySelectorAll('.documentation-nav .nav-section');
      
      navElements.forEach(section => {
        const sectionTitle = section.querySelector('.nav-section-title')?.textContent?.trim() || '';
        const links = [];
        
        section.querySelectorAll('a').forEach(link => {
          const href = link.getAttribute('href') || '';
          const text = link.textContent?.trim() || '';
          if (href && text) {
            links.push({ href, text });
          }
        });
        
        if (sectionTitle || links.length > 0) {
          sections.push({ title: sectionTitle, links });
        }
      });
      
      return sections;
    });
    
    console.log(`📊 Found ${navStructure.length} main sections`);
    
    // Extract the main documentation content
    const documentationContent = await page.evaluate(() => {
      const content = {};
      
      // Get all section elements
      const sections = document.querySelectorAll('section[id]');
      
      sections.forEach(section => {
        const sectionId = section.id;
        const sectionData = {
          id: sectionId,
          title: '',
          content: [],
          subsections: []
        };
        
        // Get section title
        const titleElement = section.querySelector('h2, h3');
        if (titleElement) {
          sectionData.title = titleElement.textContent?.trim() || '';
        }
        
        // Process all elements in the section
        const elements = section.querySelectorAll('*');
        let currentSubsection = null;
        
        elements.forEach(elem => {
          const tagName = elem.tagName.toLowerCase();
          
          // Skip if element is already processed as part of parent
          if (elem.closest('pre') && elem.tagName !== 'PRE') return;
          if (elem.closest('code') && elem.tagName !== 'CODE') return;
          if (elem.closest('table') && elem.tagName !== 'TABLE') return;
          
          if (tagName === 'h3' || tagName === 'h4') {
            // Start a new subsection
            currentSubsection = {
              title: elem.textContent?.trim() || '',
              content: []
            };
            sectionData.subsections.push(currentSubsection);
          } else if (tagName === 'p') {
            const text = elem.textContent?.trim() || '';
            if (text && !text.includes('Edit on CodePen')) {
              const target = currentSubsection ? currentSubsection.content : sectionData.content;
              target.push({
                type: 'paragraph',
                text: text
              });
            }
          } else if (tagName === 'pre') {
            const codeElement = elem.querySelector('code');
            if (codeElement) {
              const code = codeElement.textContent || '';
              const target = currentSubsection ? currentSubsection.content : sectionData.content;
              target.push({
                type: 'code',
                language: 'javascript',
                code: code.trim()
              });
            }
          } else if (tagName === 'table') {
            const table = {
              type: 'table',
              headers: [],
              rows: []
            };
            
            // Extract headers
            elem.querySelectorAll('thead th').forEach(th => {
              table.headers.push(th.textContent?.trim() || '');
            });
            
            // Extract rows
            elem.querySelectorAll('tbody tr').forEach(tr => {
              const row = [];
              tr.querySelectorAll('td').forEach(td => {
                row.push(td.textContent?.trim() || '');
              });
              if (row.length > 0) {
                table.rows.push(row);
              }
            });
            
            if (table.headers.length > 0 || table.rows.length > 0) {
              const target = currentSubsection ? currentSubsection.content : sectionData.content;
              target.push(table);
            }
          } else if (tagName === 'ul' || tagName === 'ol') {
            const listItems = [];
            elem.querySelectorAll('li').forEach(li => {
              const text = li.textContent?.trim() || '';
              if (text) {
                listItems.push(text);
              }
            });
            
            if (listItems.length > 0) {
              const target = currentSubsection ? currentSubsection.content : sectionData.content;
              target.push({
                type: tagName === 'ul' ? 'unordered-list' : 'ordered-list',
                items: listItems
              });
            }
          }
        });
        
        if (sectionData.title || sectionData.content.length > 0 || sectionData.subsections.length > 0) {
          content[sectionId] = sectionData;
        }
      });
      
      return content;
    });
    
    console.log(`📝 Extracted ${Object.keys(documentationContent).length} documentation sections`);
    
    // Convert to markdown
    let markdown = '# Anime.js Documentation\n\n';
    markdown += '> Complete documentation for Anime.js animation library\n\n';
    markdown += 'Source: https://animejs.com/documentation/\n';
    markdown += `Generated: ${new Date().toISOString()}\n\n`;
    markdown += '---\n\n';
    
    // Add table of contents
    markdown += '## Table of Contents\n\n';
    navStructure.forEach(section => {
      if (section.title) {
        markdown += `### ${section.title}\n\n`;
      }
      section.links.forEach(link => {
        const anchorId = link.href.replace('#', '');
        markdown += `- [${link.text}](#${anchorId})\n`;
      });
      markdown += '\n';
    });
    
    markdown += '---\n\n';
    
    // Add main content
    for (const [sectionId, sectionData] of Object.entries(documentationContent)) {
      if (sectionData.title) {
        markdown += `## ${sectionData.title}\n\n`;
      }
      
      // Add section content
      sectionData.content.forEach(item => {
        markdown += formatContentItem(item);
      });
      
      // Add subsections
      sectionData.subsections.forEach(subsection => {
        if (subsection.title) {
          markdown += `### ${subsection.title}\n\n`;
        }
        subsection.content.forEach(item => {
          markdown += formatContentItem(item);
        });
      });
      
      markdown += '---\n\n';
    }
    
    // Also try to extract any code examples from interactive demos
    const codeExamples = await page.evaluate(() => {
      const examples = [];
      const demoElements = document.querySelectorAll('.demo-content');
      
      demoElements.forEach(demo => {
        const title = demo.closest('.demo-section')?.querySelector('h3')?.textContent?.trim();
        const codeElement = demo.querySelector('pre code');
        if (title && codeElement) {
          examples.push({
            title,
            code: codeElement.textContent?.trim() || ''
          });
        }
      });
      
      return examples;
    });
    
    if (codeExamples.length > 0) {
      markdown += '## Code Examples\n\n';
      codeExamples.forEach(example => {
        markdown += `### ${example.title}\n\n`;
        markdown += '```javascript\n';
        markdown += example.code;
        markdown += '\n```\n\n';
      });
    }
    
    console.log('✅ Documentation extraction complete!');
    return markdown;
    
  } finally {
    await browser.close();
  }
}

function formatContentItem(item) {
  let result = '';
  
  switch (item.type) {
    case 'paragraph':
      result += `${item.text}\n\n`;
      break;
      
    case 'code':
      result += '```' + (item.language || 'javascript') + '\n';
      result += item.code + '\n';
      result += '```\n\n';
      break;
      
    case 'table':
      if (item.headers.length > 0) {
        result += '| ' + item.headers.join(' | ') + ' |\n';
        result += '|' + item.headers.map(() => ' --- ').join('|') + '|\n';
      }
      item.rows.forEach(row => {
        result += '| ' + row.join(' | ') + ' |\n';
      });
      result += '\n';
      break;
      
    case 'unordered-list':
      item.items.forEach(listItem => {
        result += `- ${listItem}\n`;
      });
      result += '\n';
      break;
      
    case 'ordered-list':
      item.items.forEach((listItem, index) => {
        result += `${index + 1}. ${listItem}\n`;
      });
      result += '\n';
      break;
  }
  
  return result;
}

// Run the scraper
console.log('🎬 Starting AnimeJS documentation scraper...\n');

scrapeAnimeJSDocumentation()
  .then(async (markdown) => {
    const outputPath = path.join(process.cwd(), 'animejs-documentation.md');
    await fs.writeFile(outputPath, markdown, 'utf-8');
    console.log(`\n✅ Documentation saved to: ${outputPath}`);
    console.log(`📄 File size: ${(markdown.length / 1024).toFixed(2)} KB`);
    console.log(`📝 Lines: ${markdown.split('\n').length}`);
  })
  .catch(error => {
    console.error('\n❌ Error scraping documentation:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  });