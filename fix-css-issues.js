/**
 * Script to fix CSS issues in the MTN Mega Billion Promo Admin Portal
 * - Removes JavaScript-style comments and replaces with CSS comments
 * - Removes @import statements that cause build errors
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all CSS files
const cssFiles = glob.sync('src/**/*.css');
console.log(`Found ${cssFiles.length} CSS files to check`);

let fixedCount = 0;

cssFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  
  // Check if file has problematic syntax
  if (content.includes('// Import') || content.includes('@import')) {
    console.log(`Fixing CSS file: ${file}`);
    
    // Replace JS-style comments with CSS comments
    let newContent = content.replace(/\/\/ (.*)/g, '/* $1 */');
    
    // Remove @import statements
    newContent = newContent.replace(/@import ['"](.*)['"];?/g, '/* Import removed: $1 */');
    
    fs.writeFileSync(file, newContent);
    fixedCount++;
  }
});

console.log(`Fixed ${fixedCount} CSS files with problematic syntax`);
