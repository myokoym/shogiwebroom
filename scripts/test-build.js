#!/usr/bin/env node
/**
 * Build Verification Test Script
 * Programmatically runs the Nuxt build process and verifies build artifacts
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const NUXT_DIR = path.join(PROJECT_ROOT, '.nuxt');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');

class BuildTester {
  constructor() {
    this.startTime = null;
    this.buildProcess = null;
  }

  log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }

  error(message, error = null) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`);
    if (error) {
      console.error(error);
    }
  }

  async cleanBuildArtifacts() {
    this.log('Cleaning previous build artifacts...');
    
    try {
      if (fs.existsSync(NUXT_DIR)) {
        try {
          fs.rmSync(NUXT_DIR, { recursive: true, force: true });
          this.log('Removed .nuxt directory');
        } catch (nuxtError) {
          if (nuxtError.code === 'EACCES') {
            this.log('Warning: Permission denied removing .nuxt directory, attempting alternative cleanup...');
            // Try to clean contents instead of removing the directory
            try {
              const files = fs.readdirSync(NUXT_DIR);
              for (const file of files) {
                const filePath = path.join(NUXT_DIR, file);
                fs.rmSync(filePath, { recursive: true, force: true });
              }
              this.log('Cleaned .nuxt directory contents');
            } catch (contentError) {
              this.log('Warning: Could not clean .nuxt directory, proceeding with build test...');
            }
          } else {
            throw nuxtError;
          }
        }
      }
      
      if (fs.existsSync(DIST_DIR)) {
        try {
          fs.rmSync(DIST_DIR, { recursive: true, force: true });
          this.log('Removed dist directory');
        } catch (distError) {
          if (distError.code === 'EACCES') {
            this.log('Warning: Permission denied removing dist directory, proceeding...');
          } else {
            throw distError;
          }
        }
      }
    } catch (error) {
      // Only fail if it's a critical error, not permissions
      if (error.code !== 'EACCES') {
        this.error('Failed to clean build artifacts', error);
        throw error;
      }
      this.log('Warning: Some build artifacts could not be cleaned due to permissions, proceeding with build test...');
    }
  }

  async runBuild() {
    this.log('Starting Nuxt build process...');
    this.startTime = Date.now();

    return new Promise((resolve, reject) => {
      // Use npm run build to ensure proper environment and configuration
      this.buildProcess = spawn('npm', ['run', 'build'], {
        cwd: PROJECT_ROOT,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          NODE_ENV: 'production',
          // Disable telemetry to avoid build noise
          NUXT_TELEMETRY_DISABLED: '1'
        }
      });

      let stdout = '';
      let stderr = '';

      this.buildProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        // Log build progress in real-time
        process.stdout.write(output);
      });

      this.buildProcess.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        // Log errors in real-time
        process.stderr.write(output);
      });

      this.buildProcess.on('close', (code) => {
        const buildTime = Date.now() - this.startTime;
        
        if (code === 0) {
          this.log(`Build completed successfully in ${buildTime}ms`);
          resolve({ stdout, stderr, code, buildTime });
        } else {
          this.error(`Build failed with exit code ${code}`);
          reject(new Error(`Build process failed with code ${code}\nStderr: ${stderr}`));
        }
      });

      this.buildProcess.on('error', (error) => {
        this.error('Build process error', error);
        reject(error);
      });
    });
  }

  async verifyBuildArtifacts() {
    this.log('Verifying build artifacts...');
    
    const requiredArtifacts = [
      '.nuxt',
      '.nuxt/dist',
      '.nuxt/dist/client',
      '.nuxt/dist/server',
    ];

    const criticalFiles = [
      '.nuxt/dist/client/manifest.json',
      '.nuxt/dist/server/server.js',
    ];

    // Check required directories
    for (const artifact of requiredArtifacts) {
      const artifactPath = path.join(PROJECT_ROOT, artifact);
      if (!fs.existsSync(artifactPath)) {
        throw new Error(`Required build artifact missing: ${artifact}`);
      }
      this.log(`✓ Found: ${artifact}`);
    }

    // Check critical files
    for (const file of criticalFiles) {
      const filePath = path.join(PROJECT_ROOT, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Critical build file missing: ${file}`);
      }
      
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        throw new Error(`Critical build file is empty: ${file}`);
      }
      
      this.log(`✓ Verified: ${file} (${stats.size} bytes)`);
    }

    // Additional checks for client build
    const clientDir = path.join(PROJECT_ROOT, '.nuxt/dist/client');
    const clientFiles = fs.readdirSync(clientDir);
    
    // Check for JavaScript bundles
    const jsFiles = clientFiles.filter(file => file.endsWith('.js'));
    if (jsFiles.length === 0) {
      throw new Error('No JavaScript bundles found in client build');
    }
    this.log(`✓ Found ${jsFiles.length} JavaScript bundle(s)`);

    // Check for CSS files
    const cssFiles = clientFiles.filter(file => file.endsWith('.css'));
    this.log(`✓ Found ${cssFiles.length} CSS file(s)`);

    this.log('Build artifact verification completed successfully');
  }

  async testBuild() {
    try {
      await this.cleanBuildArtifacts();
      const buildResult = await this.runBuild();
      await this.verifyBuildArtifacts();
      
      this.log('Build test completed successfully');
      return {
        success: true,
        buildTime: buildResult.buildTime,
        message: 'Build verification passed'
      };
      
    } catch (error) {
      this.error('Build test failed', error);
      return {
        success: false,
        error: error.message,
        message: 'Build verification failed'
      };
    }
  }
}

// Run the build test if this script is executed directly
if (require.main === module) {
  const tester = new BuildTester();
  
  tester.testBuild()
    .then(result => {
      if (result.success) {
        console.log('\n✅ Build verification passed');
        process.exit(0);
      } else {
        console.error('\n❌ Build verification failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n❌ Unexpected error during build test:', error);
      process.exit(1);
    });
}

module.exports = BuildTester;