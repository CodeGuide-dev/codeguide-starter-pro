#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Run a verification script and return the result
 */
const runVerification = (scriptName) => {
  try {
    console.log(`\n🔍 Running ${scriptName}...`);
    execSync(`node ${path.join(__dirname, scriptName)}`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.log(`\n❌ ${scriptName} verification failed!`);
    return false;
  }
};

/**
 * Check if a directory exists
 */
const directoryExists = (dirPath) => {
  try {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  } catch (err) {
    return false;
  }
};

/**
 * Check if a file exists
 */
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
};

/**
 * Check project structure
 */
const verifyProjectStructure = () => {
  console.log('\n🔍 Verifying project structure...');
  
  const rootDir = path.resolve(__dirname, '..');
  const requiredDirs = [
    'app',
    'app/components',
    'app/hooks',
    'app/lib',
    'app/types',
    'app/utils',
    'app/api',
    '.cursor'
  ];
  
  const requiredFiles = [
    'cursor_metrics.md',
    '.cursor/mcp.json',
    '.gitignore'
  ];
  
  let allValid = true;
  
  // Check directories
  console.log('\nChecking required directories:');
  for (const dir of requiredDirs) {
    const dirPath = path.join(rootDir, dir);
    const exists = directoryExists(dirPath);
    
    console.log(`  ${exists ? '✅' : '❌'} ${dir}`);
    
    if (!exists) {
      allValid = false;
    }
  }
  
  // Check files
  console.log('\nChecking required files:');
  for (const file of requiredFiles) {
    const filePath = path.join(rootDir, file);
    const exists = fileExists(filePath);
    
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    
    if (!exists) {
      allValid = false;
    }
  }
  
  return allValid;
};

/**
 * Main verification function
 */
const verifySetup = () => {
  console.log('🚀 Starting environment verification');
  
  // Run all verification scripts
  const prevalidationResult = runVerification('prevalidate.js');
  const nodeResult = runVerification('verify-node.js');
  const dockerResult = runVerification('verify-docker.js');
  const gitResult = runVerification('verify-git.js');
  
  // Check project structure
  const structureResult = verifyProjectStructure();
  
  // Overall result
  const overallResult = 
    prevalidationResult && 
    nodeResult && 
    dockerResult && 
    gitResult && 
    structureResult;
  
  // Print summary
  console.log('\n=== Verification Summary ===');
  console.log(`Prevalidation: ${prevalidationResult ? '✅ Passed' : '❌ Failed'}`);
  console.log(`Node.js: ${nodeResult ? '✅ Passed' : '❌ Failed'}`);
  console.log(`Docker: ${dockerResult ? '✅ Passed' : '❌ Failed'}`);
  console.log(`Git: ${gitResult ? '✅ Passed' : '❌ Failed'}`);
  console.log(`Project Structure: ${structureResult ? '✅ Passed' : '❌ Failed'}`);
  console.log('\nOverall: ' + (overallResult 
    ? '\x1b[32m✅ All checks passed!\x1b[0m' 
    : '\x1b[31m❌ Some checks failed!\x1b[0m'));
  
  return overallResult;
};

// Run the verification
const result = verifySetup();

// Exit with appropriate code
process.exit(result ? 0 : 1); 