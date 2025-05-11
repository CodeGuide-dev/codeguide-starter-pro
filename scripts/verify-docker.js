#!/usr/bin/env node

const { execSync } = require('child_process');
const semver = require('semver');

// Required Docker version
const REQUIRED_DOCKER_VERSION = '24.0.5';

/**
 * Check Docker version
 */
const verifyDockerVersion = () => {
  try {
    // Get the current Docker version
    const versionOutput = execSync('docker --version').toString().trim();
    const versionMatch = versionOutput.match(/Docker version (\d+\.\d+\.\d+)/);
    
    if (!versionMatch) {
      throw new Error('Could not parse Docker version');
    }
    
    const currentVersion = versionMatch[1];
    
    console.log(`Current Docker version: ${currentVersion}`);
    console.log(`Minimum required Docker version: ${REQUIRED_DOCKER_VERSION}`);
    
    // Check if current version is greater than or equal to required version
    if (semver.gte(currentVersion, REQUIRED_DOCKER_VERSION)) {
      console.log('\x1b[32m✅ Docker version check passed!\x1b[0m');
      return true;
    } else {
      console.log('\x1b[31m❌ Docker version too old!\x1b[0m');
      console.log('\nInstallation instructions:');
      console.log('1. Visit https://docs.docker.com/engine/install/');
      console.log(`2. Download and install Docker Engine v${REQUIRED_DOCKER_VERSION} or newer for your platform`);
      console.log('3. Verify installation with: docker --version');
      return false;
    }
  } catch (error) {
    console.log('\x1b[31m❌ Error checking Docker version!\x1b[0m');
    console.log(error.message);
    console.log(`\nPlease install Docker Engine v${REQUIRED_DOCKER_VERSION} or newer from https://docs.docker.com/engine/install/`);
    return false;
  }
};

// Run the verification
const result = verifyDockerVersion();

// Exit with appropriate code
process.exit(result ? 0 : 1); 