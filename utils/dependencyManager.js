import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { logInfo, logWarn, logError } from './logger.js';

const packageJsonPath = path.join(process.cwd(), 'package.json');

/**
 * Check for outdated dependencies
 */
export function checkOutdatedDependencies() {
  try {
    logInfo('Checking for outdated dependencies...');
    const result = execSync('npm outdated --json', { encoding: 'utf8' });
    const outdated = JSON.parse(result || '{}');

    if (Object.keys(outdated).length === 0) {
      logInfo('All dependencies are up to date');
      return { status: 'up-to-date', outdated: {} };
    }

    logWarn(`Found ${Object.keys(outdated).length} outdated dependencies`, { outdated });
    return { status: 'outdated', outdated };
  } catch (error) {
    logError('Failed to check outdated dependencies', { error: error.message });
    return { status: 'error', error: error.message };
  }
}

/**
 * Check for security vulnerabilities
 */
export function checkSecurityVulnerabilities() {
  try {
    logInfo('Checking for security vulnerabilities...');
    const result = execSync('npm audit --json', { encoding: 'utf8' });
    const audit = JSON.parse(result);

    if (audit.metadata.vulnerabilities.total === 0) {
      logInfo('No security vulnerabilities found');
      return { status: 'secure', vulnerabilities: 0 };
    }

    logWarn(`Found ${audit.metadata.vulnerabilities.total} security vulnerabilities`, {
      vulnerabilities: audit.metadata.vulnerabilities
    });
    return {
      status: 'vulnerable',
      vulnerabilities: audit.metadata.vulnerabilities.total,
      details: audit
    };
  } catch (error) {
    logError('Failed to check security vulnerabilities', { error: error.message });
    return { status: 'error', error: error.message };
  }
}

/**
 * Update dependencies
 */
export function updateDependencies() {
  try {
    logInfo('Updating dependencies...');
    execSync('npm update', { stdio: 'inherit' });
    logInfo('Dependencies updated successfully');
    return { status: 'updated' };
  } catch (error) {
    logError('Failed to update dependencies', { error: error.message });
    return { status: 'error', error: error.message };
  }
}

/**
 * Fix security vulnerabilities
 */
export function fixSecurityVulnerabilities() {
  try {
    logInfo('Attempting to fix security vulnerabilities...');
    execSync('npm audit fix', { stdio: 'inherit' });
    logInfo('Security vulnerabilities fixed');
    return { status: 'fixed' };
  } catch (error) {
    logError('Failed to fix security vulnerabilities', { error: error.message });
    return { status: 'error', error: error.message };
  }
}

/**
 * Get dependency information
 */
export function getDependencyInfo() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    const dependencies = {
      total: Object.keys(packageJson.dependencies || {}).length,
      dev: Object.keys(packageJson.devDependencies || {}).length,
      peer: Object.keys(packageJson.peerDependencies || {}).length,
    };

    dependencies.all = dependencies.total + dependencies.dev + dependencies.peer;

    logInfo('Dependency information retrieved', dependencies);
    return { status: 'success', dependencies };
  } catch (error) {
    logError('Failed to get dependency information', { error: error.message });
    return { status: 'error', error: error.message };
  }
}

/**
 * Comprehensive dependency health check
 */
export function performDependencyHealthCheck() {
  logInfo('Performing comprehensive dependency health check...');

  const results = {
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // Check outdated dependencies
  results.checks.outdated = checkOutdatedDependencies();

  // Check security vulnerabilities
  results.checks.security = checkSecurityVulnerabilities();

  // Get dependency info
  results.checks.info = getDependencyInfo();

  // Overall status
  const hasIssues = results.checks.outdated.status !== 'up-to-date' ||
                   results.checks.security.status !== 'secure';

  results.overall = {
    status: hasIssues ? 'needs-attention' : 'healthy',
    issues: hasIssues,
    summary: {
      outdatedCount: Object.keys(results.checks.outdated.outdated || {}).length,
      vulnerabilityCount: results.checks.security.vulnerabilities || 0,
      totalDependencies: results.checks.info.dependencies?.all || 0
    }
  };

  logInfo('Dependency health check completed', {
    status: results.overall.status,
    issues: results.overall.issues
  });

  return results;
}

/**
 * Generate dependency report
 */
export function generateDependencyReport() {
  const healthCheck = performDependencyHealthCheck();

  const report = {
    title: 'Dependency Health Report',
    generated: healthCheck.timestamp,
    summary: healthCheck.overall,
    details: healthCheck.checks
  };

  // Save report to file
  const reportPath = path.join(process.cwd(), 'reports', 'dependency-report.json');
  const reportsDir = path.dirname(reportPath);

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  logInfo('Dependency report generated', { path: reportPath });

  return { status: 'generated', path: reportPath, report };
}