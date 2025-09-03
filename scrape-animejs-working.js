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
    
    console.log('📄 Page loaded successfully');
    
    // Wait a bit for JavaScript to render
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Extract all the documentation content
    const documentationContent = await page.evaluate(() => {
      const result = {
        title: 'Anime.js Documentation',
        sections: [],
        navigation: []
      };
      
      // Get navigation structure from the sidebar
      const navSections = document.querySelectorAll('.documentation-nav-section, nav section, aside section, [class*="nav"] section');
      navSections.forEach(section => {
        const navSection = {
          title: '',
          links: []
        };
        
        // Try different selectors for section titles
        const titleEl = section.querySelector('h2, h3, [class*="title"], strong');
        if (titleEl) {
          navSection.title = titleEl.textContent.trim();
        }
        
        // Get all links in this section
        const links = section.querySelectorAll('a');
        links.forEach(link => {
          const href = link.getAttribute('href') || '';
          const text = link.textContent.trim();
          if (text && !text.includes('Edit')) {
            navSection.links.push({ href, text });
          }
        });
        
        if (navSection.title || navSection.links.length > 0) {
          result.navigation.push(navSection);
        }
      });
      
      // Extract main content - try multiple selectors
      const contentSelectors = [
        'main article',
        'article.documentation',
        'article',
        'main',
        '.documentation-content',
        '.content',
        '[role="main"]'
      ];
      
      let mainContent = null;
      for (const selector of contentSelectors) {
        mainContent = document.querySelector(selector);
        if (mainContent) break;
      }
      
      if (!mainContent) {
        // Fallback: get the body content
        mainContent = document.body;
      }
      
      // Extract all sections with content
      const sections = mainContent.querySelectorAll('section, [class*="section"], article > div');
      sections.forEach(section => {
        const sectionData = {
          id: section.id || '',
          title: '',
          content: []
        };
        
        // Get section title
        const titleEl = section.querySelector('h1, h2, h3');
        if (titleEl) {
          sectionData.title = titleEl.textContent.trim();
        }
        
        // Extract paragraphs
        section.querySelectorAll('p').forEach(p => {
          const text = p.textContent.trim();
          if (text && !text.includes('Edit on CodePen')) {
            sectionData.content.push({
              type: 'paragraph',
              text: text
            });
          }
        });
        
        // Extract code blocks
        section.querySelectorAll('pre').forEach(pre => {
          const code = pre.textContent.trim();
          if (code) {
            sectionData.content.push({
              type: 'code',
              code: code
            });
          }
        });
        
        // Extract tables
        section.querySelectorAll('table').forEach(table => {
          const tableData = {
            type: 'table',
            headers: [],
            rows: []
          };
          
          // Headers
          table.querySelectorAll('thead th, th').forEach(th => {
            tableData.headers.push(th.textContent.trim());
          });
          
          // Rows
          table.querySelectorAll('tbody tr, tr').forEach(tr => {
            const row = [];
            tr.querySelectorAll('td').forEach(td => {
              row.push(td.textContent.trim());
            });
            if (row.length > 0) {
              tableData.rows.push(row);
            }
          });
          
          if (tableData.headers.length > 0 || tableData.rows.length > 0) {
            sectionData.content.push(tableData);
          }
        });
        
        // Extract lists
        section.querySelectorAll('ul, ol').forEach(list => {
          const listData = {
            type: list.tagName === 'UL' ? 'unordered-list' : 'ordered-list',
            items: []
          };
          
          list.querySelectorAll('li').forEach(li => {
            const text = li.textContent.trim();
            if (text) {
              listData.items.push(text);
            }
          });
          
          if (listData.items.length > 0) {
            sectionData.content.push(listData);
          }
        });
        
        if (sectionData.title || sectionData.content.length > 0) {
          result.sections.push(sectionData);
        }
      });
      
      // Also capture any API reference or method documentation
      const apiElements = document.querySelectorAll('[class*="api"], [class*="method"], [class*="property"]');
      apiElements.forEach(elem => {
        const apiData = {
          type: 'api',
          name: '',
          description: '',
          parameters: [],
          returns: '',
          example: ''
        };
        
        // Try to extract API name
        const nameEl = elem.querySelector('h3, h4, [class*="name"], code');
        if (nameEl) {
          apiData.name = nameEl.textContent.trim();
        }
        
        // Try to extract description
        const descEl = elem.querySelector('p, [class*="desc"]');
        if (descEl) {
          apiData.description = descEl.textContent.trim();
        }
        
        // Try to extract example code
        const exampleEl = elem.querySelector('pre code, pre');
        if (exampleEl) {
          apiData.example = exampleEl.textContent.trim();
        }
        
        if (apiData.name) {
          result.sections.push({
            title: apiData.name,
            content: [
              { type: 'paragraph', text: apiData.description },
              { type: 'code', code: apiData.example }
            ].filter(item => item.text || item.code)
          });
        }
      });
      
      return result;
    });
    
    console.log(`📝 Extracted ${documentationContent.sections.length} sections`);
    console.log(`📚 Found ${documentationContent.navigation.length} navigation sections`);
    
    // Convert to markdown
    let markdown = '# Anime.js Documentation\n\n';
    markdown += '> Complete documentation for Anime.js animation library\n\n';
    markdown += 'Source: https://animejs.com/documentation/\n';
    markdown += `Generated: ${new Date().toISOString()}\n\n`;
    markdown += '---\n\n';
    
    // Add table of contents from navigation
    if (documentationContent.navigation.length > 0) {
      markdown += '## Table of Contents\n\n';
      documentationContent.navigation.forEach(navSection => {
        if (navSection.title) {
          markdown += `### ${navSection.title}\n\n`;
        }
        navSection.links.forEach(link => {
          markdown += `- [${link.text}](${link.href})\n`;
        });
        markdown += '\n';
      });
      markdown += '---\n\n';
    }
    
    // Add main content
    documentationContent.sections.forEach(section => {
      if (section.title) {
        markdown += `## ${section.title}\n\n`;
      }
      
      section.content.forEach(item => {
        switch (item.type) {
          case 'paragraph':
            markdown += `${item.text}\n\n`;
            break;
            
          case 'code':
            markdown += '```javascript\n';
            markdown += item.code;
            markdown += '\n```\n\n';
            break;
            
          case 'table':
            if (item.headers.length > 0) {
              markdown += '| ' + item.headers.join(' | ') + ' |\n';
              markdown += '|' + item.headers.map(() => ' --- ').join('|') + '|\n';
            }
            item.rows.forEach(row => {
              markdown += '| ' + row.join(' | ') + ' |\n';
            });
            markdown += '\n';
            break;
            
          case 'unordered-list':
            item.items.forEach(listItem => {
              markdown += `- ${listItem}\n`;
            });
            markdown += '\n';
            break;
            
          case 'ordered-list':
            item.items.forEach((listItem, index) => {
              markdown += `${index + 1}. ${listItem}\n`;
            });
            markdown += '\n';
            break;
        }
      });
      
      if (section.content.length > 0) {
        markdown += '---\n\n';
      }
    });
    
    // Now let's also try to fetch specific documentation pages
    const docPages = [
      'getting-started',
      'timer', 
      'animation',
      'timeline',
      'animatable',
      'draggable',
      'scroll',
      'scope',
      'stagger',
      'svg',
      'text',
      'utilities',
      'web-animation-api',
      'engine'
    ];
    
    console.log('\n📚 Fetching individual documentation pages...');
    
    for (const pageName of docPages) {
      try {
        const url = `https://animejs.com/documentation/${pageName}`;
        console.log(`  Fetching: ${pageName}`);
        
        await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: 15000
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const pageContent = await page.evaluate(() => {
          const content = {
            title: '',
            sections: []
          };
          
          // Try to find the main content area
          const mainContent = document.querySelector('main, article, .content, [role="main"]') || document.body;
          
          // Extract title
          const titleEl = mainContent.querySelector('h1, h2');
          if (titleEl) {
            content.title = titleEl.textContent.trim();
          }
          
          // Extract all content
          const elements = mainContent.querySelectorAll('h2, h3, h4, p, pre, code, table, ul, ol');
          
          let currentSection = null;
          
          elements.forEach(elem => {
            const tagName = elem.tagName.toLowerCase();
            
            if (tagName === 'h2' || tagName === 'h3' || tagName === 'h4') {
              currentSection = {
                title: elem.textContent.trim(),
                content: []
              };
              content.sections.push(currentSection);
            } else if (currentSection) {
              if (tagName === 'p') {
                const text = elem.textContent.trim();
                if (text && !text.includes('Edit on CodePen')) {
                  currentSection.content.push({
                    type: 'text',
                    value: text
                  });
                }
              } else if (tagName === 'pre' || (tagName === 'code' && elem.parentElement.tagName !== 'PRE')) {
                currentSection.content.push({
                  type: 'code',
                  value: elem.textContent.trim()
                });
              } else if (tagName === 'ul' || tagName === 'ol') {
                const items = [];
                elem.querySelectorAll('li').forEach(li => {
                  items.push(li.textContent.trim());
                });
                if (items.length > 0) {
                  currentSection.content.push({
                    type: tagName === 'ul' ? 'list' : 'numbered-list',
                    value: items
                  });
                }
              }
            }
          });
          
          return content;
        });
        
        if (pageContent.title || pageContent.sections.length > 0) {
          markdown += `\n## ${pageContent.title || pageName.charAt(0).toUpperCase() + pageName.slice(1)}\n\n`;
          
          pageContent.sections.forEach(section => {
            if (section.title) {
              markdown += `### ${section.title}\n\n`;
            }
            
            section.content.forEach(item => {
              if (item.type === 'text') {
                markdown += `${item.value}\n\n`;
              } else if (item.type === 'code') {
                markdown += '```javascript\n' + item.value + '\n```\n\n';
              } else if (item.type === 'list') {
                item.value.forEach(listItem => {
                  markdown += `- ${listItem}\n`;
                });
                markdown += '\n';
              } else if (item.type === 'numbered-list') {
                item.value.forEach((listItem, index) => {
                  markdown += `${index + 1}. ${listItem}\n`;
                });
                markdown += '\n';
              }
            });
          });
          
          markdown += '---\n\n';
        }
        
      } catch (error) {
        console.log(`  ⚠️  Could not fetch ${pageName}: ${error.message}`);
      }
    }
    
    console.log('\n✅ Documentation scraping complete!');
    return markdown;
    
  } finally {
    await browser.close();
  }
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