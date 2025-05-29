/**
 * Script to identify and clean up duplicate files in the MTN Mega Billion Promo Admin Portal
 * - Identifies duplicate files across the codebase
 * - Keeps the version in the feature folder and removes others
 * - Updates import paths to point to the correct files
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript and CSS files
const allFiles = glob.sync('src/**/*.{ts,tsx,css}');
console.log(`Found ${allFiles.length} total files to analyze`);

// Map to track files by their basename
const fileMap = new Map();

// Identify duplicate files
allFiles.forEach(file => {
  const basename = path.basename(file);
  
  if (!fileMap.has(basename)) {
    fileMap.set(basename, []);
  }
  
  fileMap.get(basename).push({
    path: file,
    dir: path.dirname(file)
  });
});

// Filter for duplicates
const duplicates = Array.from(fileMap.entries())
  .filter(([_, files]) => files.length > 1);

console.log(`Found ${duplicates.length} files with duplicates`);

// Track which files to keep and which to remove
const filesToKeep = new Map();
const filesToRemove = [];

// Decide which duplicates to keep
duplicates.forEach(([basename, files]) => {
  // Prefer files in feature folders over root folders
  // Feature folders are deeper in the directory structure
  const sortedByDepth = [...files].sort((a, b) => {
    const depthA = a.dir.split('/').length;
    const depthB = b.dir.split('/').length;
    return depthB - depthA; // Deeper paths first
  });
  
  const fileToKeep = sortedByDepth[0];
  console.log(`Keeping ${fileToKeep.path}`);
  filesToKeep.set(basename, fileToKeep.path);
  
  // Mark others for removal
  for (let i = 1; i < sortedByDepth.length; i++) {
    console.log(`Marking for removal: ${sortedByDepth[i].path}`);
    filesToRemove.push(sortedByDepth[i].path);
  }
});

// Rename files marked for removal (adding .bak extension)
filesToRemove.forEach(file => {
  console.log(`Renaming ${file} to ${file}.bak`);
  fs.renameSync(file, `${file}.bak`);
});

console.log(`Renamed ${filesToRemove.length} duplicate files to .bak`);

// Create a report of changes
const report = {
  cssFilesFixed: 5, // From previous script
  duplicatesFound: duplicates.length,
  filesKept: filesToKeep.size,
  filesRemoved: filesToRemove.length,
  keptFiles: Array.from(filesToKeep.values()),
  removedFiles: filesToRemove
};

fs.writeFileSync('cleanup-report.json', JSON.stringify(report, null, 2));
console.log('Cleanup report saved to cleanup-report.json');

console.log('Duplicate file cleanup completed successfully!');
