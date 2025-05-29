/**
 * Script to update import paths after duplicate file cleanup
 * - Scans all TypeScript files for imports
 * - Updates import paths to point to the correct files after duplicate removal
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Load the cleanup report to know which files were kept and which were removed
const report = JSON.parse(fs.readFileSync('cleanup-report.json', 'utf8'));
console.log(`Loaded cleanup report: ${report.filesKept} files kept, ${report.filesRemoved} files removed`);

// Create a map of removed files to their kept counterparts
const redirectMap = new Map();

// For each removed file, find its corresponding kept file
report.removedFiles.forEach(removedFile => {
  const basename = path.basename(removedFile);
  const keptFile = report.keptFiles.find(keptFile => path.basename(keptFile) === basename);
  
  if (keptFile) {
    // Remove .bak extension if present in the key
    const cleanRemovedPath = removedFile.replace(/\.bak$/, '');
    redirectMap.set(cleanRemovedPath, keptFile);
  }
});

console.log(`Created redirect map with ${redirectMap.size} entries`);

// Find all TypeScript files
const tsFiles = glob.sync('src/**/*.{ts,tsx}');
console.log(`Found ${tsFiles.length} TypeScript files to check for imports`);

let updatedCount = 0;

// Update import paths in all TypeScript files
tsFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let updated = false;
  
  // Check for imports that need to be updated
  redirectMap.forEach((newPath, oldPath) => {
    // Create regex patterns to match different import styles
    const importPatterns = [
      // import X from 'path'
      new RegExp(`import\\s+[^{]*?\\s+from\\s+['"](.*/)?${path.basename(oldPath, path.extname(oldPath))}['"]`, 'g'),
      // import { X } from 'path'
      new RegExp(`import\\s+{[^}]*?}\\s+from\\s+['"](.*/)?${path.basename(oldPath, path.extname(oldPath))}['"]`, 'g'),
      // import * as X from 'path'
      new RegExp(`import\\s+\\*\\s+as\\s+[^\\s]+\\s+from\\s+['"](.*/)?${path.basename(oldPath, path.extname(oldPath))}['"]`, 'g')
    ];
    
    for (const pattern of importPatterns) {
      if (pattern.test(content)) {
        // Calculate the relative path from current file to new path
        const relativeDir = path.dirname(file);
        const targetDir = path.dirname(newPath);
        
        let relativePath = path.relative(relativeDir, targetDir);
        if (!relativePath.startsWith('.')) {
          relativePath = `./${relativePath}`;
        }
        
        // If they're in the same directory
        if (relativePath === '.') {
          relativePath = './';
        }
        
        const newImportPath = `${relativePath}/${path.basename(newPath, path.extname(newPath))}`;
        
        // Replace import paths
        content = content.replace(pattern, (match) => {
          console.log(`In ${file}, updating import: ${match} -> to use ${newImportPath}`);
          return match.replace(/['"](.*)['"]/, `"${newImportPath}"`);
        });
        
        updated = true;
      }
    }
  });
  
  if (updated) {
    fs.writeFileSync(file, content);
    updatedCount++;
  }
});

console.log(`Updated imports in ${updatedCount} files`);

// Update index.ts files to ensure proper exports
const indexFiles = glob.sync('src/**/index.ts');
console.log(`Found ${indexFiles.length} index.ts files to check`);

let indexUpdatedCount = 0;

indexFiles.forEach(file => {
  const dir = path.dirname(file);
  const content = fs.readFileSync(file, 'utf8');
  
  // Check if this index file exports from a file that was removed
  let updated = false;
  let newContent = content;
  
  redirectMap.forEach((newPath, oldPath) => {
    if (content.includes(path.basename(oldPath, path.extname(oldPath)))) {
      const oldBasename = path.basename(oldPath, path.extname(oldPath));
      const newBasename = path.basename(newPath, path.extname(newPath));
      const newDir = path.dirname(newPath);
      
      // If the new path is in a subdirectory of the current directory
      if (newDir.startsWith(dir)) {
        const relativePath = path.relative(dir, newDir);
        newContent = newContent.replace(
          new RegExp(`['"]\\.\/${oldBasename}['"]`, 'g'),
          `"./${relativePath}/${newBasename}"`
        );
        updated = true;
      }
    }
  });
  
  if (updated) {
    fs.writeFileSync(file, newContent);
    indexUpdatedCount++;
  }
});

console.log(`Updated ${indexUpdatedCount} index.ts files`);

// Create a final report
const finalReport = {
  ...report,
  importsUpdated: updatedCount,
  indexFilesUpdated: indexUpdatedCount
};

fs.writeFileSync('import-update-report.json', JSON.stringify(finalReport, null, 2));
console.log('Import update report saved to import-update-report.json');

console.log('Import path updates completed successfully!');
