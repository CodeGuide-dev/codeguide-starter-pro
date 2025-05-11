#!/usr/bin/env node

const { execSync } = require('child_process');
const semver = require('semver');

// Required Node version
const REQUIRED_NODE_VERSION = 'v20.2.1';
const REQUIRED_VERSION_WITHOUT_V = REQUIRED_NODE_VERSION.replace('v', '');

/**
 * Check Node.js version
 */
const verifyNodeVersion = () => {
  try {
    // Get the current Node.js version
    const currentVersion = execSync('node -v').toString().trim();
    const currentVersionWithoutV = currentVersion.replace('v', '');
    
    console.log(`Current Node.js version: ${currentVersion}`);
    console.log(`Minimum required Node.js version: ${REQUIRED_NODE_VERSION}`);
    
    // Check if current version is greater than or equal to required version
    if (semver.gte(currentVersionWithoutV, REQUIRED_VERSION_WITHOUT_V)) {
      console.log('\x1b[32m✅ Node.js version check passed!\x1b[0m');
      return true;
    } else {
      console.log('\x1b[31m❌ Node.js version too old!\x1b[0m');
      console.log('\nInstallation instructions:');
      console.log(`1. Visit https://nodejs.org/dist/${REQUIRED_NODE_VERSION}/`);
      console.log(`2. Download and install Node.js ${REQUIRED_NODE_VERSION} or newer for your platform`);
      console.log('3. Alternatively, use a version manager like nvm:');
      console.log(`   - nvm install ${REQUIRED_VERSION_WITHOUT_V}`);
      console.log(`   - nvm use ${REQUIRED_VERSION_WITHOUT_V}`);
      return false;
    }
  } catch (error) {
    if (error.message.includes("Cannot find module 'semver'")) {
      console.log('\x1b[33m⚠️ The semver package is not installed. Using simple comparison.\x1b[0m');
      
      // Fallback to simple version comparison
      const currentVersion = execSync('node -v').toString().trim();
      console.log(`Current Node.js version: ${currentVersion}`);
      console.log(`Minimum required Node.js version: ${REQUIRED_NODE_VERSION}`);
      
      // Simple string comparison (works for most version formats but less reliable)
      const currentVersionNum = currentVersion.replace('v', '');
      const requiredVersionNum = REQUIRED_NODE_VERSION.replace('v', '');
      
      // Split version strings and compare components
      const current = currentVersionNum.split('.').map(Number);
      const required = requiredVersionNum.split('.').map(Number);
      
      let isNewer = false;
      for (let i = 0; i < Math.max(current.length, required.length); i++) {
        const a = current[i] || 0;
        const b = required[i] || 0;
        if (a > b) {
          isNewer = true;
          break;
        } else if (a < b) {
          break;
        }
      }
      
      if (currentVersion === REQUIRED_NODE_VERSION || isNewer) {
        console.log('\x1b[32m✅ Node.js version check passed!\x1b[0m');
        return true;
      } else {
        console.log('\x1b[31m❌ Node.js version too old!\x1b[0m');
        console.log('\nInstallation instructions:');
        console.log(`1. Visit https://nodejs.org/dist/${REQUIRED_NODE_VERSION}/`);
        console.log(`2. Download and install Node.js ${REQUIRED_NODE_VERSION} or newer for your platform`);
        console.log('3. Alternatively, use a version manager like nvm:');
        console.log(`   - nvm install ${REQUIRED_VERSION_WITHOUT_V}`);
        console.log(`   - nvm use ${REQUIRED_VERSION_WITHOUT_V}`);
        return false;
      }
    } else {
      console.log('\x1b[31m❌ Error checking Node.js version!\x1b[0m');
      console.log(error.message);
      console.log(`\nPlease install Node.js ${REQUIRED_NODE_VERSION} or newer from https://nodejs.org/`);
      return false;
    }
  }
};

// Run the verification
const result = verifyNodeVersion();

// Exit with appropriate code
process.exit(result ? 0 : 1); 