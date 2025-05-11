#!/usr/bin/env node

const { execSync } = require('child_process');
const semver = require('semver');

// Required Git version (updated to accept 2.39.5+)
const REQUIRED_GIT_VERSION = '2.39.5';

/**
 * Check Git version
 */
const verifyGitVersion = () => {
  try {
    // Get the current Git version
    const versionOutput = execSync('git --version').toString().trim();
    const versionMatch = versionOutput.match(/git version (\d+\.\d+\.\d+)/);
    
    if (!versionMatch) {
      throw new Error('Could not parse Git version');
    }
    
    const currentVersion = versionMatch[1];
    
    console.log(`Current Git version: ${currentVersion}`);
    console.log(`Minimum required Git version: ${REQUIRED_GIT_VERSION}`);
    
    // Check if current version is greater than or equal to required version
    if (semver.gte(currentVersion, REQUIRED_GIT_VERSION)) {
      console.log('\x1b[32m✅ Git version check passed!\x1b[0m');
      return true;
    } else {
      console.log('\x1b[31m❌ Git version too old!\x1b[0m');
      console.log('\nInstallation instructions:');
      console.log('1. Visit https://git-scm.com/downloads');
      console.log(`2. Download and install Git v${REQUIRED_GIT_VERSION} or newer for your platform`);
      console.log('3. Verify installation with: git --version');
      return false;
    }
  } catch (error) {
    console.log('\x1b[31m❌ Error checking Git version!\x1b[0m');
    console.log(error.message);
    console.log(`\nPlease install Git v${REQUIRED_GIT_VERSION} or newer from https://git-scm.com/downloads`);
    return false;
  }
};

// Run the verification
const result = verifyGitVersion();

// Exit with appropriate code
process.exit(result ? 0 : 1); 