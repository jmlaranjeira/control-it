import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { logInfo, logError, logWarn } from './logger.js';

const execAsync = promisify(exec);

// Backup configuration
const BACKUP_CONFIG = {
  maxBackups: 7, // Keep 7 days of backups
  backupDir: process.env.BACKUP_DIR || './backups',
  compression: true,
  includeLogs: true,
  includeConfig: true,
  includeMetrics: true,
};

/**
 * Ensure backup directory exists
 */
function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_CONFIG.backupDir)) {
    fs.mkdirSync(BACKUP_CONFIG.backupDir, { recursive: true });
    logInfo(`Created backup directory: ${BACKUP_CONFIG.backupDir}`);
  }
}

/**
 * Generate backup filename with timestamp
 */
function generateBackupFilename(type, extension = 'tar.gz') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${type}_backup_${timestamp}.${extension}`;
}

/**
 * Create compressed backup of directory
 */
async function createCompressedBackup(sourceDir, backupPath) {
  try {
    const command = `tar -czf "${backupPath}" -C "${path.dirname(sourceDir)}" "${path.basename(sourceDir)}"`;
    await execAsync(command);
    logInfo(`Created compressed backup: ${backupPath}`);
    return true;
  } catch (error) {
    logError(`Failed to create compressed backup: ${error.message}`);
    return false;
  }
}

/**
 * Create uncompressed backup of files
 */
async function createFileBackup(files, backupPath) {
  try {
    const tarCommand = `tar -czf "${backupPath}" ${files.join(' ')}`;
    await execAsync(tarCommand);
    logInfo(`Created file backup: ${backupPath}`);
    return true;
  } catch (error) {
    logError(`Failed to create file backup: ${error.message}`);
    return false;
  }
}

/**
 * Backup configuration files
 */
async function backupConfiguration() {
  if (!BACKUP_CONFIG.includeConfig) {
    logInfo('Configuration backup skipped (disabled in config)');
    return null;
  }

  const configFiles = [
    '.env',
    '.env.test',
    '.env.example',
    'config.js',
    'package.json',
    'package-lock.json',
    'jest.config.js',
    'docker-compose.yml',
    'Dockerfile',
  ].filter(file => fs.existsSync(file));

  if (configFiles.length === 0) {
    logWarn('No configuration files found to backup');
    return null;
  }

  const backupPath = path.join(BACKUP_CONFIG.backupDir, generateBackupFilename('config'));
  const success = await createFileBackup(configFiles, backupPath);

  return success ? backupPath : null;
}

/**
 * Backup log files
 */
async function backupLogs() {
  if (!BACKUP_CONFIG.includeLogs) {
    logInfo('Log backup skipped (disabled in config)');
    return null;
  }

  const logsDir = './logs';
  if (!fs.existsSync(logsDir)) {
    logWarn('Logs directory does not exist, skipping log backup');
    return null;
  }

  const backupPath = path.join(BACKUP_CONFIG.backupDir, generateBackupFilename('logs'));
  const success = await createCompressedBackup(logsDir, backupPath);

  return success ? backupPath : null;
}

/**
 * Backup monitoring data
 */
async function backupMonitoringData() {
  if (!BACKUP_CONFIG.includeMetrics) {
    logInfo('Monitoring data backup skipped (disabled in config)');
    return null;
  }

  const monitoringDir = './monitoring';
  if (!fs.existsSync(monitoringDir)) {
    logWarn('Monitoring directory does not exist, skipping monitoring backup');
    return null;
  }

  const backupPath = path.join(BACKUP_CONFIG.backupDir, generateBackupFilename('monitoring'));
  const success = await createCompressedBackup(monitoringDir, backupPath);

  return success ? backupPath : null;
}

/**
 * Clean up old backups
 */
async function cleanupOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_CONFIG.backupDir)
      .filter(file => file.endsWith('.tar.gz'))
      .map(file => ({
        name: file,
        path: path.join(BACKUP_CONFIG.backupDir, file),
        stats: fs.statSync(path.join(BACKUP_CONFIG.backupDir, file))
      }))
      .sort((a, b) => b.stats.mtime - a.stats.mtime);

    if (files.length > BACKUP_CONFIG.maxBackups) {
      const filesToDelete = files.slice(BACKUP_CONFIG.maxBackups);

      for (const file of filesToDelete) {
        fs.unlinkSync(file.path);
        logInfo(`Deleted old backup: ${file.name}`);
      }

      logInfo(`Cleaned up ${filesToDelete.length} old backups`);
    }
  } catch (error) {
    logError(`Failed to cleanup old backups: ${error.message}`);
  }
}

/**
 * Get backup statistics
 */
function getBackupStats() {
  try {
    if (!fs.existsSync(BACKUP_CONFIG.backupDir)) {
      return { totalBackups: 0, totalSize: 0, backups: [] };
    }

    const files = fs.readdirSync(BACKUP_CONFIG.backupDir)
      .filter(file => file.endsWith('.tar.gz'))
      .map(file => {
        const filePath = path.join(BACKUP_CONFIG.backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          size: stats.size,
          created: stats.mtime,
          type: file.split('_')[0] // config, logs, or monitoring
        };
      })
      .sort((a, b) => b.created - a.created);

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    return {
      totalBackups: files.length,
      totalSize,
      totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
      backups: files
    };
  } catch (error) {
    logError(`Failed to get backup stats: ${error.message}`);
    return { totalBackups: 0, totalSize: 0, backups: [] };
  }
}

/**
 * Verify backup integrity
 */
async function verifyBackup(backupPath) {
  try {
    await execAsync(`tar -tzf "${backupPath}" > /dev/null`);
    logInfo(`Backup integrity verified: ${path.basename(backupPath)}`);
    return true;
  } catch (error) {
    logError(`Backup integrity check failed for ${path.basename(backupPath)}: ${error.message}`);
    return false;
  }
}

/**
 * Perform complete backup
 */
export async function performBackup() {
  logInfo('Starting automated backup process');

  ensureBackupDir();

  const results = {
    timestamp: new Date().toISOString(),
    config: null,
    logs: null,
    monitoring: null,
    success: false,
    errors: []
  };

  try {
    // Backup configuration
    results.config = await backupConfiguration();

    // Backup logs
    results.logs = await backupLogs();

    // Backup monitoring data
    results.monitoring = await backupMonitoringData();

    // Cleanup old backups
    await cleanupOldBackups();

    // Verify backups
    const backupsToVerify = [results.config, results.logs, results.monitoring].filter(Boolean);
    for (const backup of backupsToVerify) {
      const verified = await verifyBackup(backup);
      if (!verified) {
        results.errors.push(`Backup verification failed: ${path.basename(backup)}`);
      }
    }

    results.success = results.errors.length === 0;
    logInfo('Backup process completed', {
      success: results.success,
      config: !!results.config,
      logs: !!results.logs,
      monitoring: !!results.monitoring
    });

  } catch (error) {
    results.errors.push(error.message);
    logError(`Backup process failed: ${error.message}`);
  }

  return results;
}

/**
 * Schedule automated backups
 */
export function scheduleBackups(intervalHours = 24) {
  const intervalMs = intervalHours * 60 * 60 * 1000;

  logInfo(`Scheduling automated backups every ${intervalHours} hours`);

  setInterval(async () => {
    try {
      await performBackup();
    } catch (error) {
      logError(`Scheduled backup failed: ${error.message}`);
    }
  }, intervalMs);

  // Perform initial backup
  setTimeout(() => {
    performBackup().catch(error => {
      logError(`Initial backup failed: ${error.message}`);
    });
  }, 5000); // Wait 5 seconds after startup
}

/**
 * Manual backup command
 */
export async function manualBackup() {
  console.log('🔄 Starting manual backup...');
  const result = await performBackup();

  if (result.success) {
    console.log('✅ Backup completed successfully!');
    console.log(`📁 Config backup: ${result.config ? '✓' : '✗'}`);
    console.log(`📋 Logs backup: ${result.logs ? '✓' : '✗'}`);
    console.log(`📊 Monitoring backup: ${result.monitoring ? '✓' : '✗'}`);
  } else {
    console.log('❌ Backup completed with errors:');
    result.errors.forEach(error => console.log(`  - ${error}`));
  }

  return result;
}

export { getBackupStats, BACKUP_CONFIG };