/**
 * Build Automation
 * Handles npm install, build, and packaging
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

class BuildAutomation {
  constructor(projectPath, outputDir) {
    this.projectPath = projectPath;
    this.outputDir = outputDir;
  }

  /**
   * Run command with live output
   */
  async runCommand(command, cwd, description) {
    console.log(`\n🔧 ${description}...`);
    console.log(`   Command: ${command}\n`);

    return new Promise((resolve, reject) => {
      const child = exec(command, { cwd, maxBuffer: 10 * 1024 * 1024 });

      child.stdout.on('data', (data) => {
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        process.stderr.write(data);
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log(`\n✅ ${description} completed successfully\n`);
          resolve();
        } else {
          reject(new Error(`${description} failed with code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Install dependencies
   */
  async installDependencies() {
    try {
      await this.runCommand(
        'npm install',
        this.projectPath,
        'Installing dependencies'
      );
      return true;
    } catch (error) {
      console.error('❌ Failed to install dependencies:', error.message);
      return false;
    }
  }

  /**
   * Build project
   */
  async buildProject() {
    try {
      await this.runCommand(
        'npm run build',
        this.projectPath,
        'Building project (next build + inject-seo)'
      );
      return true;
    } catch (error) {
      console.error('❌ Failed to build project:', error.message);
      return false;
    }
  }

  /**
   * Validate build output
   */
  validateBuild() {
    const outDir = path.join(this.projectPath, 'out');
    
    if (!fs.existsSync(outDir)) {
      console.error('❌ out/ directory not found');
      return false;
    }

    // Check if there are HTML files
    const htmlFiles = this.findHTMLFiles(outDir);
    
    if (htmlFiles.length === 0) {
      console.error('❌ No HTML files found in out/');
      return false;
    }

    // Check if SEO tags were injected
    const firstFile = htmlFiles[0];
    const content = fs.readFileSync(firstFile, 'utf8');
    
    if (!content.includes('<!-- SEO Meta Tags (injected by post-build script) -->')) {
      console.warn('⚠️  SEO tags may not have been injected');
    }

    console.log(`\n✅ Build validation passed`);
    console.log(`   HTML files: ${htmlFiles.length}`);
    console.log(`   Output directory: ${outDir}\n`);

    return true;
  }

  /**
   * Find all HTML files recursively
   */
  findHTMLFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    
    const files = fs.readdirSync(dir);
    
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.findHTMLFiles(filePath, fileList);
      } else if (file.endsWith('.html')) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  }

  /**
   * Package output directory
   */
  async packageOutput(projectName) {
    const outDir = path.join(this.projectPath, 'out');
    const zipName = `${projectName}-build.zip`;
    const zipPath = path.join(this.outputDir, zipName);

    console.log('\n📦 Packaging output...\n');

    try {
      // Create zip archive
      await this.runCommand(
        `zip -r "${zipPath}" out/`,
        this.projectPath,
        'Creating ZIP archive'
      );

      // Get file size
      const stats = fs.statSync(zipPath);
      const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      console.log(`✅ Package created: ${zipName}`);
      console.log(`   Size: ${sizeMB} MB`);
      console.log(`   Path: ${zipPath}\n`);

      return zipPath;
    } catch (error) {
      console.error('❌ Failed to package output:', error.message);
      return null;
    }
  }

  /**
   * Run complete build process
   */
  async runFullBuild(projectName) {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 STARTING BUILD PROCESS');
    console.log('='.repeat(60));

    // Step 1: Install dependencies
    const installed = await this.installDependencies();
    if (!installed) {
      console.error('\n❌ Build process failed at dependency installation\n');
      return null;
    }

    // Step 2: Build project
    const built = await this.buildProject();
    if (!built) {
      console.error('\n❌ Build process failed at project build\n');
      return null;
    }

    // Step 3: Validate build
    const valid = this.validateBuild();
    if (!valid) {
      console.error('\n❌ Build validation failed\n');
      return null;
    }

    // Step 4: Package output
    const zipPath = await this.packageOutput(projectName);
    if (!zipPath) {
      console.error('\n❌ Build process failed at packaging\n');
      return null;
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ BUILD PROCESS COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60) + '\n');

    return zipPath;
  }
}

module.exports = BuildAutomation;
