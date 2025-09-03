import fs from 'fs/promises';
import path from 'path';

// List of all documentation pages from the anime.js site
const docPages = [
  // Getting Started
  { path: 'getting-started', title: 'Getting Started' },
  { path: 'getting-started/installation', title: 'Installation' },
  { path: 'getting-started/imports', title: 'Imports' },
  { path: 'getting-started/using-with-vanilla-js', title: 'Using with Vanilla JS' },
  { path: 'getting-started/using-with-react', title: 'Using with React' },
  
  // Timer
  { path: 'timer', title: 'Timer' },
  { path: 'timer/timer-playback-settings', title: 'Timer Playback Settings' },
  { path: 'timer/timer-callbacks', title: 'Timer Callbacks' },
  { path: 'timer/timer-methods', title: 'Timer Methods' },
  { path: 'timer/timer-properties', title: 'Timer Properties' },
  
  // Animation
  { path: 'animation', title: 'Animation' },
  { path: 'animation/targets', title: 'Targets' },
  { path: 'animation/animatable-properties', title: 'Animatable Properties' },
  { path: 'animation/tween-value-types', title: 'Tween Value Types' },
  { path: 'animation/tween-parameters', title: 'Tween Parameters' },
  { path: 'animation/keyframes', title: 'Keyframes' },
  { path: 'animation/animation-playback-settings', title: 'Animation Playback Settings' },
  { path: 'animation/animation-callbacks', title: 'Animation Callbacks' },
  { path: 'animation/animation-methods', title: 'Animation Methods' },
  { path: 'animation/animation-properties', title: 'Animation Properties' },
  
  // Timeline
  { path: 'timeline', title: 'Timeline' },
  { path: 'timeline/add-timers', title: 'Add Timers' },
  { path: 'timeline/add-animations', title: 'Add Animations' },
  { path: 'timeline/sync-waapi-animations', title: 'Sync WAAPI Animations' },
  { path: 'timeline/sync-timelines', title: 'Sync Timelines' },
  { path: 'timeline/call-functions', title: 'Call Functions' },
  { path: 'timeline/time-position', title: 'Time Position' },
  { path: 'timeline/timeline-playback-settings', title: 'Timeline Playback Settings' },
  { path: 'timeline/timeline-callbacks', title: 'Timeline Callbacks' },
  { path: 'timeline/timeline-methods', title: 'Timeline Methods' },
  { path: 'timeline/timeline-properties', title: 'Timeline Properties' },
  
  // Animatable
  { path: 'animatable', title: 'Animatable' },
  { path: 'animatable/animatable-settings', title: 'Animatable Settings' },
  { path: 'animatable/animatable-methods', title: 'Animatable Methods' },
  { path: 'animatable/animatable-properties', title: 'Animatable Properties' },
  
  // Draggable
  { path: 'draggable', title: 'Draggable' },
  { path: 'draggable/draggable-axes-parameters', title: 'Draggable Axes Parameters' },
  { path: 'draggable/draggable-settings', title: 'Draggable Settings' },
  { path: 'draggable/draggable-callbacks', title: 'Draggable Callbacks' },
  { path: 'draggable/draggable-methods', title: 'Draggable Methods' },
  { path: 'draggable/draggable-properties', title: 'Draggable Properties' },
  
  // ScrollObserver
  { path: 'scroll', title: 'ScrollObserver' },
  { path: 'scroll/scrollobserver-settings', title: 'ScrollObserver Settings' },
  { path: 'scroll/scrollobserver-thresholds', title: 'ScrollObserver Thresholds' },
  { path: 'scroll/scrollobserver-synchronisation-modes', title: 'ScrollObserver Synchronisation Modes' },
  { path: 'scroll/scrollobserver-callbacks', title: 'ScrollObserver Callbacks' },
  { path: 'scroll/scrollobserver-methods', title: 'ScrollObserver Methods' },
  { path: 'scroll/scrollobserver-properties', title: 'ScrollObserver Properties' },
  
  // Scope
  { path: 'scope', title: 'Scope' },
  { path: 'scope/add-constructor-function', title: 'Add Constructor Function' },
  { path: 'scope/register-method-function', title: 'Register Method Function' },
  { path: 'scope/scope-parameters', title: 'Scope Parameters' },
  { path: 'scope/scope-methods', title: 'Scope Methods' },
  { path: 'scope/scope-properties', title: 'Scope Properties' },
  
  // Stagger
  { path: 'stagger', title: 'Stagger' },
  { path: 'stagger/time-staggering', title: 'Time Staggering' },
  { path: 'stagger/values-staggering', title: 'Values Staggering' },
  { path: 'stagger/timeline-positions-staggering', title: 'Timeline Positions Staggering' },
  { path: 'stagger/stagger-value-types', title: 'Stagger Value Types' },
  { path: 'stagger/stagger-parameters', title: 'Stagger Parameters' },
  
  // SVG
  { path: 'svg', title: 'SVG' },
  { path: 'svg/morphto', title: 'morphTo()' },
  { path: 'svg/createdrawable', title: 'createDrawable()' },
  { path: 'svg/createmotionpath', title: 'createMotionPath()' },
  
  // Text
  { path: 'text', title: 'Text' },
  { path: 'text/split', title: 'split()' },
  
  // Utilities
  { path: 'utilities', title: 'Utilities' },
  { path: 'utilities/dollar-sign', title: '$()' },
  { path: 'utilities/get', title: 'get()' },
  { path: 'utilities/set', title: 'set()' },
  { path: 'utilities/remove', title: 'remove()' },
  { path: 'utilities/clean-inline-styles', title: 'cleanInlineStyles()' },
  { path: 'utilities/createtimekeeper', title: 'keepTime()' },
  { path: 'utilities/random', title: 'random()' },
  { path: 'utilities/random-pick', title: 'randomPick()' },
  { path: 'utilities/shuffle', title: 'shuffle()' },
  { path: 'utilities/sync', title: 'sync()' },
  { path: 'utilities/lerp', title: 'lerp()' },
  { path: 'utilities/round', title: 'round()' },
  { path: 'utilities/clamp', title: 'clamp()' },
  { path: 'utilities/snap', title: 'snap()' },
  { path: 'utilities/wrap', title: 'wrap()' },
  { path: 'utilities/map-range', title: 'mapRange()' },
  { path: 'utilities/interpolate', title: 'interpolate()' },
  { path: 'utilities/round-pad', title: 'roundPad()' },
  { path: 'utilities/pad-start', title: 'padStart()' },
  { path: 'utilities/pad-end', title: 'padEnd()' },
  { path: 'utilities/deg-to-rad', title: 'degToRad()' },
  { path: 'utilities/rad-to-deg', title: 'radToDeg()' },
  { path: 'utilities/chain-able-utility-functions', title: 'Chain-able Utility Functions' },
  
  // WAAPI
  { path: 'web-animation-api', title: 'Web Animation API' },
  { path: 'web-animation-api/when-to-use-waapi', title: 'When to use WAAPI' },
  { path: 'web-animation-api/hardware-accelerated-animations', title: 'Hardware-accelerated animations' },
  { path: 'web-animation-api/improvements-to-the-web-animation-api', title: 'Improvements to WAAPI' },
  { path: 'web-animation-api/api-differences-with-native-waapi', title: 'API Differences' },
  { path: 'web-animation-api/waapi-convertease', title: 'waapi.convertEase()' },
  
  // Engine
  { path: 'engine', title: 'Engine' },
  { path: 'engine/engine-parameters', title: 'Engine Parameters' },
  { path: 'engine/engine-methods', title: 'Engine Methods' },
  { path: 'engine/engine-properties', title: 'Engine Properties' },
  { path: 'engine/engine-defaults', title: 'Engine Defaults' },
];

async function fetchPage(page) {
  const url = `https://animejs.com/documentation/${page.path}`;
  console.log(`Fetching: ${url}`);
  
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Extract content from the HTML
    const contentStart = html.indexOf('<article class="documentation-article');
    const contentEnd = html.indexOf('</article>', contentStart);
    
    if (contentStart === -1 || contentEnd === -1) {
      console.warn(`Could not extract content from ${page.path}`);
      return null;
    }
    
    const content = html.substring(contentStart, contentEnd + '</article>'.length);
    return { ...page, content };
  } catch (error) {
    console.error(`Error fetching ${page.path}:`, error.message);
    return null;
  }
}

function htmlToMarkdown(html) {
  let markdown = html;
  
  // Remove script tags
  markdown = markdown.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Convert headings
  markdown = markdown.replace(/<h1[^>]*>([^<]+)<\/h1>/gi, '# $1\n\n');
  markdown = markdown.replace(/<h2[^>]*>([^<]+)<\/h2>/gi, '## $1\n\n');
  markdown = markdown.replace(/<h3[^>]*>([^<]+)<\/h3>/gi, '### $1\n\n');
  markdown = markdown.replace(/<h4[^>]*>([^<]+)<\/h4>/gi, '#### $1\n\n');
  
  // Convert code blocks
  markdown = markdown.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (match, code) => {
    const cleaned = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<[^>]+>/g, '')
      .trim();
    return '```javascript\n' + cleaned + '\n```\n\n';
  });
  
  // Convert inline code
  markdown = markdown.replace(/<code[^>]*>([^<]+)<\/code>/gi, '`$1`');
  
  // Convert links
  markdown = markdown.replace(/<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi, '[$2]($1)');
  
  // Convert strong/bold
  markdown = markdown.replace(/<strong[^>]*>([^<]+)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<b[^>]*>([^<]+)<\/b>/gi, '**$1**');
  
  // Convert emphasis/italic
  markdown = markdown.replace(/<em[^>]*>([^<]+)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<i[^>]*>([^<]+)<\/i>/gi, '*$1*');
  
  // Convert paragraphs
  markdown = markdown.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n');
  
  // Convert lists
  markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (match, content) => {
    return content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n') + '\n';
  });
  
  markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match, content) => {
    let counter = 1;
    return content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, () => {
      return `${counter++}. $1\n`;
    }) + '\n';
  });
  
  // Convert tables
  markdown = markdown.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (match, tableContent) => {
    let result = '';
    
    // Extract headers
    const headerMatch = tableContent.match(/<thead[^>]*>([\s\S]*?)<\/thead>/i);
    if (headerMatch) {
      const headers = headerMatch[1].match(/<th[^>]*>([\s\S]*?)<\/th>/gi);
      if (headers) {
        result += '| ' + headers.map(h => h.replace(/<[^>]+>/g, '').trim()).join(' | ') + ' |\n';
        result += '|' + headers.map(() => ' --- ').join('|') + '|\n';
      }
    }
    
    // Extract rows
    const bodyMatch = tableContent.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
    if (bodyMatch) {
      const rows = bodyMatch[1].match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
      if (rows) {
        for (const row of rows) {
          const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
          if (cells) {
            result += '| ' + cells.map(c => c.replace(/<[^>]+>/g, '').trim()).join(' | ') + ' |\n';
          }
        }
      }
    }
    
    return result + '\n';
  });
  
  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]+>/g, '');
  
  // Clean up HTML entities
  markdown = markdown
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
  
  // Clean up excessive newlines
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  
  return markdown.trim();
}

async function scrapeAllDocs() {
  console.log('Starting anime.js documentation scrape...\n');
  
  let fullMarkdown = '# Anime.js Complete Documentation\n\n';
  fullMarkdown += 'Source: https://animejs.com/documentation/\n\n';
  fullMarkdown += 'Generated on: ' + new Date().toISOString() + '\n\n';
  fullMarkdown += '---\n\n';
  fullMarkdown += '## Table of Contents\n\n';
  
  // Generate table of contents
  let currentSection = '';
  for (const page of docPages) {
    const depth = page.path.split('/').length - 1;
    const section = page.path.split('/')[0];
    
    if (section !== currentSection) {
      currentSection = section;
      fullMarkdown += '\n';
    }
    
    const indent = '  '.repeat(depth);
    fullMarkdown += `${indent}- [${page.title}](#${page.path.replace(/\//g, '-')})\n`;
  }
  
  fullMarkdown += '\n---\n\n';
  
  // Fetch and process each page
  for (let i = 0; i < docPages.length; i++) {
    const page = docPages[i];
    const pageData = await fetchPage(page);
    
    if (pageData && pageData.content) {
      const depth = page.path.split('/').length;
      const heading = '#'.repeat(Math.min(depth + 1, 4));
      
      fullMarkdown += `${heading} ${page.title}\n\n`;
      fullMarkdown += `*Path: /documentation/${page.path}*\n\n`;
      
      const markdown = htmlToMarkdown(pageData.content);
      fullMarkdown += markdown + '\n\n';
      fullMarkdown += '---\n\n';
    }
    
    // Add a small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Show progress
    console.log(`Progress: ${i + 1}/${docPages.length} pages processed`);
  }
  
  return fullMarkdown;
}

// Run the scraper
scrapeAllDocs()
  .then(async (markdown) => {
    const outputPath = path.join(process.cwd(), 'animejs-complete-documentation.md');
    await fs.writeFile(outputPath, markdown, 'utf-8');
    console.log(`\n✅ Documentation saved to ${outputPath}`);
    console.log(`📄 File size: ${(markdown.length / 1024).toFixed(2)} KB`);
  })
  .catch(error => {
    console.error('❌ Error scraping documentation:', error);
    process.exit(1);
  });