import fs from 'fs/promises';
import path from 'path';

async function scrapeAnimeJSDocs() {
  console.log('Fetching anime.js documentation...');
  
  const response = await fetch('https://animejs.com/documentation/');
  const html = await response.text();
  
  // Extract the main content between specific markers
  const contentStart = html.indexOf('<article class="documentation">');
  const contentEnd = html.indexOf('</article>', contentStart);
  const content = html.substring(contentStart, contentEnd + '</article>'.length);
  
  // Initialize markdown content
  let markdown = '# Anime.js Documentation\n\n';
  markdown += 'Source: https://animejs.com/documentation/\n\n';
  markdown += '---\n\n';
  
  // Parse sections
  const sections = content.split('<section class="');
  
  for (const section of sections) {
    if (!section.trim()) continue;
    
    // Extract section ID and title
    const idMatch = section.match(/id="([^"]+)"/);
    const titleMatch = section.match(/<h2[^>]*>([^<]+)<\/h2>/);
    
    if (titleMatch) {
      const sectionTitle = titleMatch[1].trim();
      markdown += `## ${sectionTitle}\n\n`;
    }
    
    // Extract subsections
    const subsections = section.split('<h3');
    
    for (const subsection of subsections) {
      if (!subsection.includes('>')) continue;
      
      // Extract subsection title
      const subsectionTitleMatch = subsection.match(/>([^<]+)<\/h3>/);
      if (subsectionTitleMatch) {
        const subsectionTitle = subsectionTitleMatch[1].trim();
        markdown += `### ${subsectionTitle}\n\n`;
      }
      
      // Extract description paragraphs
      const paragraphs = subsection.match(/<p[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>)?[^<]*)<\/p>/g);
      if (paragraphs) {
        for (const p of paragraphs) {
          const text = p.replace(/<[^>]+>/g, '').trim();
          if (text && !text.includes('Edit on CodePen')) {
            markdown += `${text}\n\n`;
          }
        }
      }
      
      // Extract code examples
      const codeBlocks = subsection.match(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/g);
      if (codeBlocks) {
        for (const codeBlock of codeBlocks) {
          const code = codeBlock
            .replace(/<pre[^>]*><code[^>]*>/, '')
            .replace(/<\/code><\/pre>/, '')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .trim();
          
          markdown += '```javascript\n' + code + '\n```\n\n';
        }
      }
      
      // Extract tables
      const tables = subsection.match(/<table[^>]*>([\s\S]*?)<\/table>/g);
      if (tables) {
        for (const table of tables) {
          // Extract headers
          const headers = table.match(/<th[^>]*>([^<]+)<\/th>/g);
          if (headers) {
            markdown += '| ' + headers.map(h => h.replace(/<[^>]+>/g, '')).join(' | ') + ' |\n';
            markdown += '|' + headers.map(() => ' --- ').join('|') + '|\n';
          }
          
          // Extract rows
          const rows = table.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g);
          if (rows) {
            for (const row of rows) {
              if (row.includes('<td')) {
                const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g);
                if (cells) {
                  const cellContent = cells.map(cell => {
                    return cell.replace(/<[^>]+>/g, '').trim();
                  });
                  markdown += '| ' + cellContent.join(' | ') + ' |\n';
                }
              }
            }
          }
          markdown += '\n';
        }
      }
      
      // Extract lists
      const lists = subsection.match(/<ul[^>]*>([\s\S]*?)<\/ul>/g);
      if (lists) {
        for (const list of lists) {
          const items = list.match(/<li[^>]*>([\s\S]*?)<\/li>/g);
          if (items) {
            for (const item of items) {
              const text = item.replace(/<[^>]+>/g, '').trim();
              if (text) {
                markdown += `- ${text}\n`;
              }
            }
            markdown += '\n';
          }
        }
      }
    }
    
    markdown += '---\n\n';
  }
  
  // Clean up markdown
  markdown = markdown
    .replace(/\n{3,}/g, '\n\n')
    .replace(/---\n\n---/g, '---')
    .trim();
  
  return markdown;
}

// Run the scraper
scrapeAnimeJSDocs()
  .then(async (markdown) => {
    const outputPath = path.join(process.cwd(), 'animejs-documentation.md');
    await fs.writeFile(outputPath, markdown, 'utf-8');
    console.log(`✅ Documentation saved to ${outputPath}`);
    console.log(`📄 File size: ${(markdown.length / 1024).toFixed(2)} KB`);
  })
  .catch(error => {
    console.error('❌ Error scraping documentation:', error);
    process.exit(1);
  });