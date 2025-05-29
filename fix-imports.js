// fix-imports.js
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Helper function to read and update file content
function updateImportsInFile(filePath) {
  console.log(`Processing: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Determine directory depth relative to src
  const relativePath = path.relative('src', filePath);
  const depth = relativePath.split(path.sep).length - 1;
  
  // Skip files at root level
  if (depth <= 0) return;
  
  let updatedContent = content;
  
  // Handle different types of imports based on file location
  if (filePath.includes('/pages/') && depth > 1) {
    // Pages in subdirectories (e.g., src/pages/Login/LoginPage.tsx)
    updatedContent = updatedContent.replace(/from\s+['"]\.\.\/contexts\//g, `from '../../contexts/`);
    updatedContent = updatedContent.replace(/from\s+['"]\.\.\/components\//g, `from '../../components/`);
    updatedContent = updatedContent.replace(/from\s+['"]\.\.\/services\//g, `from '../../services/`);
    updatedContent = updatedContent.replace(/from\s+['"]\.\.\/hooks\//g, `from '../../hooks/`);
    updatedContent = updatedContent.replace(/from\s+['"]\.\.\/utils\//g, `from '../../utils/`);
    updatedContent = updatedContent.replace(/from\s+['"]\.\.\/types\//g, `from '../../types/`);
  } 
  else if (filePath.includes('/components/') && depth > 2) {
    // Components in subdirectories (e.g., src/components/layout/Header/Header.tsx)
    updatedContent = updatedContent.replace(/from\s+['"]\.\.\/contexts\//g, `from '../../../contexts/`);
    updatedContent = updatedContent.replace(/from\s+['"]\.\.\/components\//g, `from '../../../components/`);
    updatedContent = updatedContent.replace(/from\s+['"]\.\.\/services\//g, `from '../../../services/`);
    updatedContent = updatedContent.replace(/from\s+['"]\.\.\/hooks\//g, `from '../../../hooks/`);
    updatedContent = updatedContent.replace(/from\s+['"]\.\.\/utils\//g, `from '../../../utils/`);
    updatedContent = updatedContent.replace(/from\s+['"]\.\.\/types\//g, `from '../../../types/`);
    
    // Handle imports from same component category but different component
    if (filePath.match(/\/components\/([^\/]+)\/[^\/]+\//)) {
      const category = filePath.match(/\/components\/([^\/]+)\/[^\/]+\//)[1];
      updatedContent = updatedContent.replace(
        new RegExp(`from\\s+['"]\\.\\.\\/${category}\\/`, 'g'), 
        `from '../`
      );
    }
  }
  
  // Use index exports where possible
  // Replace specific component imports with index imports
  const componentCategories = ['layout', 'dashboard', 'drawManagement', 'participantManagement', 'prizeStructure', 'userManagement'];
  componentCategories.forEach(category => {
    const specificImportRegex = new RegExp(`from\\s+['"]([.]+)/components/${category}/([^/'"]+)/\\2['"]`, 'g');
    updatedContent = updatedContent.replace(specificImportRegex, `from '$1/components/${category}'`);
  });
  
  // Write back if changed
  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`Updated imports in: ${filePath}`);
    return true;
  }
  return false;
}

// Find all TypeScript files
async function main() {
  try {
    const files = await glob('src/**/*.{ts,tsx}');
    let updatedCount = 0;
    
    files.forEach(file => {
      if (updateImportsInFile(file)) {
        updatedCount++;
      }
    });
    
    console.log(`Import paths updated in ${updatedCount} files!`);
  } catch (err) {
    console.error('Error finding files:', err);
  }
}

main();
