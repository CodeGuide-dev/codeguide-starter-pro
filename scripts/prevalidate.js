#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Function to check if file exists
const fileExists = (filePath) => {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
};

// Function to prompt user
const promptUser = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
};

// Main validation function
const prevalidate = async () => {
  const currentDir = process.cwd();
  const packageJsonPath = path.join(currentDir, 'package.json');
  const gitFolderPath = path.join(currentDir, '.git');
  
  const hasPackageJson = fileExists(packageJsonPath);
  const hasGitFolder = fileExists(gitFolderPath);
  
  if (hasPackageJson || hasGitFolder) {
    console.log('\x1b[33m⚠️  Warning: Existing project detected!\x1b[0m');
    
    if (hasPackageJson) {
      console.log('  - Found package.json file');
    }
    
    if (hasGitFolder) {
      console.log('  - Found .git directory');
    }
    
    console.log('\nThis operation will initialize or overwrite existing project files.');
    
    const shouldContinue = await promptUser('Do you want to continue? (y/n): ');
    
    if (!shouldContinue) {
      console.log('\x1b[31m❌ Operation cancelled by user\x1b[0m');
      process.exit(1);
    }
    
    console.log('\x1b[32m✅ Continuing with project initialization\x1b[0m');
  } else {
    console.log('\x1b[32m✅ No existing project detected. Proceeding with initialization.\x1b[0m');
  }
};

// Run the validation
prevalidate(); 