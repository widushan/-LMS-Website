#!/usr/bin/env node

/**
 * Design Evaluation Analysis Script
 * Analyzes codebase for coupling, cohesion, complexity, and maintainability metrics
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Get project root - go up from scripts/ directory
const projectRoot = path.resolve(__dirname, '..');

// Configuration
const SERVER_DIR = path.join(projectRoot, 'server');
const CLIENT_DIR = path.join(projectRoot, 'client', 'src');

// Analysis results
const results = {
  files: [],
  controllers: [],
  models: [],
  components: [],
  dependencies: {
    server: [],
    client: []
  },
  metrics: {
    totalFiles: 0,
    totalLines: 0,
    avgFileSize: 0,
    largestFiles: [],
    complexity: {
      high: [],
      medium: [],
      low: []
    }
  },
  coupling: {
    externalServices: [],
    directImports: []
  },
  cohesion: {
    mixedConcerns: []
  }
};

/**
 * Read and analyze a file
 */
function analyzeFile(filePath, relativePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const lineCount = lines.length;
    const imports = content.match(/import\s+.*?from\s+['"](.+?)['"]/g) || [];
    const exports = content.match(/export\s+(const|function|class|default)/g) || [];
    const functions = content.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)/g) || [];
    const classes = content.match(/(?:export\s+)?class\s+(\w+)/g) || [];
    
    // Detect external service dependencies
    const externalServices = [];
    if (content.includes('stripe') || content.includes('Stripe')) externalServices.push('Stripe');
    if (content.includes('clerk') || content.includes('Clerk')) externalServices.push('Clerk');
    if (content.includes('cloudinary') || content.includes('Cloudinary')) externalServices.push('Cloudinary');
    if (content.includes('mongoose') || content.includes('mongoose')) externalServices.push('MongoDB');
    
    // Detect direct model imports (coupling indicator)
    const directModelImports = imports.filter(imp => 
      imp.includes('models/') || imp.includes('models\\')
    );
    
    // Complexity estimation (based on function count and lines)
    let complexity = 'low';
    if (lineCount > 200 || functions.length > 10) complexity = 'high';
    else if (lineCount > 100 || functions.length > 5) complexity = 'medium';
    
    // Detect mixed concerns (cohesion indicator)
    const hasState = content.includes('useState') || content.includes('useContext');
    const hasAPI = content.includes('axios') || content.includes('fetch');
    const hasCalculations = content.match(/calculate|compute|sum|reduce|map/g);
    const mixedConcerns = [];
    if (hasState && hasAPI) mixedConcerns.push('State + API calls');
    if (hasState && hasCalculations) mixedConcerns.push('State + Calculations');
    if (hasAPI && hasCalculations) mixedConcerns.push('API + Calculations');
    
    return {
      path: relativePath,
      lineCount,
      importCount: imports.length,
      exportCount: exports.length,
      functionCount: functions.length,
      classCount: classes.length,
      externalServices,
      directModelImports: directModelImports.length,
      complexity,
      mixedConcerns: mixedConcerns.length > 0 ? mixedConcerns : null
    };
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Recursively scan directory
 */
function scanDirectory(dir, baseDir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other ignored directories
      if (!['node_modules', '.git', 'dist', 'build', '.tmp_docx'].includes(file)) {
        scanDirectory(filePath, baseDir, fileList);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      const relativePath = path.relative(baseDir, filePath);
      const analysis = analyzeFile(filePath, relativePath);
      if (analysis) {
        fileList.push(analysis);
      }
    }
  });
  
  return fileList;
}

/**
 * Analyze package.json for dependencies
 */
function analyzeDependencies(dir, type) {
  const packagePath = path.join(dir, 'package.json');
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    return Object.keys(deps).map(name => ({
      name,
      version: deps[name],
      type: pkg.dependencies[name] ? 'dependency' : 'devDependency'
    }));
  }
  return [];
}

/**
 * Generate report
 */
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('DESIGN EVALUATION ANALYSIS REPORT');
  console.log('='.repeat(80) + '\n');
  
  // File metrics
  console.log('📊 FILE METRICS');
  console.log('-'.repeat(80));
  console.log(`Total Files Analyzed: ${results.metrics.totalFiles}`);
  console.log(`Total Lines of Code: ${results.metrics.totalLines}`);
  console.log(`Average File Size: ${Math.round(results.metrics.avgFileSize)} lines`);
  console.log(`\nLargest Files:`);
  results.metrics.largestFiles.slice(0, 10).forEach(file => {
    console.log(`  - ${file.path}: ${file.lineCount} lines`);
  });
  
  // Complexity analysis
  console.log('\n📈 COMPLEXITY ANALYSIS');
  console.log('-'.repeat(80));
  console.log(`High Complexity Files: ${results.metrics.complexity.high.length}`);
  results.metrics.complexity.high.forEach(file => {
    console.log(`  - ${file.path} (${file.lineCount} lines, ${file.functionCount} functions)`);
  });
  console.log(`Medium Complexity Files: ${results.metrics.complexity.medium.length}`);
  console.log(`Low Complexity Files: ${results.metrics.complexity.low.length}`);
  
  // Coupling analysis
  console.log('\n🔗 COUPLING ANALYSIS');
  console.log('-'.repeat(80));
  console.log('External Service Dependencies:');
  const serviceCounts = {};
  results.coupling.externalServices.forEach(service => {
    serviceCounts[service] = (serviceCounts[service] || 0) + 1;
  });
  Object.entries(serviceCounts).forEach(([service, count]) => {
    console.log(`  - ${service}: ${count} files`);
  });
  
  console.log('\nDirect Model Imports (High Coupling Indicator):');
  const highCouplingFiles = results.files.filter(f => f.directModelImports > 0);
  highCouplingFiles.forEach(file => {
    console.log(`  - ${file.path}: ${file.directModelImports} direct model imports`);
  });
  
  // Cohesion analysis
  console.log('\n🧩 COHESION ANALYSIS');
  console.log('-'.repeat(80));
  console.log('Files with Mixed Concerns (Low Cohesion):');
  results.cohesion.mixedConcerns.forEach(file => {
    console.log(`  - ${file.path}:`);
    file.mixedConcerns.forEach(concern => {
      console.log(`    • ${concern}`);
    });
  });
  
  // Controller analysis
  console.log('\n🎮 CONTROLLER ANALYSIS');
  console.log('-'.repeat(80));
  results.controllers.forEach(ctrl => {
    console.log(`\n${ctrl.path}:`);
    console.log(`  - Functions: ${ctrl.functionCount}`);
    console.log(`  - Lines: ${ctrl.lineCount}`);
    console.log(`  - External Services: ${ctrl.externalServices.join(', ') || 'None'}`);
    console.log(`  - Direct Model Imports: ${ctrl.directModelImports}`);
  });
  
  // Component analysis
  console.log('\n⚛️  COMPONENT ANALYSIS');
  console.log('-'.repeat(80));
  const componentStats = {
    total: results.components.length,
    withState: results.components.filter(c => c.mixedConcerns?.some(m => m.includes('State'))).length,
    withAPI: results.components.filter(c => c.mixedConcerns?.some(m => m.includes('API'))).length,
    withCalculations: results.components.filter(c => c.mixedConcerns?.some(m => m.includes('Calculations'))).length
  };
  console.log(`Total Components: ${componentStats.total}`);
  console.log(`Components with State Management: ${componentStats.withState}`);
  console.log(`Components with API Calls: ${componentStats.withAPI}`);
  console.log(`Components with Calculations: ${componentStats.withCalculations}`);
  
  // Dependency analysis
  console.log('\n📦 DEPENDENCY ANALYSIS');
  console.log('-'.repeat(80));
  console.log('Server Dependencies:');
  results.dependencies.server.forEach(dep => {
    console.log(`  - ${dep.name}@${dep.version} (${dep.type})`);
  });
  console.log('\nClient Dependencies:');
  results.dependencies.client.forEach(dep => {
    console.log(`  - ${dep.name}@${dep.version} (${dep.type})`);
  });
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('-'.repeat(80));
  
  if (results.coupling.externalServices.length > 0) {
    console.log('⚠️  HIGH COUPLING DETECTED:');
    console.log('   - Consider introducing abstraction layers (service layer, repository pattern)');
    console.log('   - Use dependency injection to reduce direct dependencies');
  }
  
  if (results.cohesion.mixedConcerns.length > 0) {
    console.log('\n⚠️  LOW COHESION DETECTED:');
    console.log('   - Split files with mixed concerns (state + API + calculations)');
    console.log('   - Extract utility functions to separate files');
    console.log('   - Use custom hooks for API calls');
  }
  
  if (results.metrics.complexity.high.length > 0) {
    console.log('\n⚠️  HIGH COMPLEXITY FILES:');
    console.log('   - Consider refactoring large files into smaller modules');
    console.log('   - Extract functions to separate utility files');
  }
  
  // SOLID/GRASP Summary
  console.log('\n📋 SOLID/GRASP SUMMARY');
  console.log('-'.repeat(80));
  console.log('Single Responsibility Principle (SRP):');
  console.log(`  - Files with mixed concerns: ${results.cohesion.mixedConcerns.length}`);
  console.log(`  - Recommendation: ${results.cohesion.mixedConcerns.length > 0 ? 'Split mixed-concern files' : 'Good - most files have single responsibility'}`);
  
  console.log('\nDependency Inversion Principle (DIP):');
  console.log(`  - Direct external service dependencies: ${results.coupling.externalServices.length} files`);
  console.log(`  - Direct model imports: ${highCouplingFiles.length} files`);
  console.log(`  - Recommendation: ${highCouplingFiles.length > 0 ? 'Introduce abstraction layers' : 'Good - low direct dependencies'}`);
  
  console.log('\nLow Coupling (GRASP):');
  const avgImports = results.files.reduce((sum, f) => sum + f.importCount, 0) / results.files.length;
  console.log(`  - Average imports per file: ${Math.round(avgImports)}`);
  console.log(`  - Recommendation: ${avgImports > 5 ? 'Consider reducing dependencies' : 'Good - reasonable import count'}`);
  
  console.log('\nHigh Cohesion (GRASP):');
  console.log(`  - Files with mixed concerns: ${results.cohesion.mixedConcerns.length}`);
  console.log(`  - Recommendation: ${results.cohesion.mixedConcerns.length > 0 ? 'Improve cohesion by separating concerns' : 'Good - high cohesion maintained'}`);
  
  console.log('\n' + '='.repeat(80));
  console.log('Analysis Complete!');
  console.log('='.repeat(80) + '\n');
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Analyzing codebase...\n');
  
  // Scan server directory
  console.log('Scanning server directory...');
  const serverFiles = scanDirectory(SERVER_DIR, SERVER_DIR);
  results.files.push(...serverFiles);
  
  // Scan client directory
  console.log('Scanning client directory...');
  const clientFiles = scanDirectory(CLIENT_DIR, CLIENT_DIR);
  results.files.push(...clientFiles);
  
  // Categorize files
  results.controllers = results.files.filter(f => 
    f.path.includes('controllers/') || f.path.includes('Controller')
  );
  results.models = results.files.filter(f => 
    f.path.includes('models/') || f.path.includes('Model')
  );
  results.components = results.files.filter(f => 
    f.path.includes('components/') || f.path.includes('pages/')
  );
  
  // Calculate metrics
  results.metrics.totalFiles = results.files.length;
  results.metrics.totalLines = results.files.reduce((sum, f) => sum + f.lineCount, 0);
  results.metrics.avgFileSize = results.metrics.totalLines / results.metrics.totalFiles;
  results.metrics.largestFiles = [...results.files].sort((a, b) => b.lineCount - a.lineCount);
  
  // Categorize by complexity
  results.metrics.complexity.high = results.files.filter(f => f.complexity === 'high');
  results.metrics.complexity.medium = results.files.filter(f => f.complexity === 'medium');
  results.metrics.complexity.low = results.files.filter(f => f.complexity === 'low');
  
  // Coupling analysis
  results.files.forEach(file => {
    if (file.externalServices.length > 0) {
      file.externalServices.forEach(service => {
        results.coupling.externalServices.push(service);
      });
    }
    if (file.directModelImports > 0) {
      results.coupling.directImports.push(file);
    }
  });
  
  // Cohesion analysis
  results.cohesion.mixedConcerns = results.files.filter(f => f.mixedConcerns !== null);
  
  // Dependency analysis
  results.dependencies.server = analyzeDependencies(SERVER_DIR, 'server');
  results.dependencies.client = analyzeDependencies(CLIENT_DIR, 'client');
  
  // Generate report
  generateReport();
  
  // Save JSON report
  const reportPath = path.join(projectRoot, 'design-analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed JSON report saved to: ${reportPath}`);
}

main();
