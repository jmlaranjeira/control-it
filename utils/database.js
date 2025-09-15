import pkg from 'pg';
const { Pool } = pkg;
import { logInfo, logError, logWarn } from './logger.js';

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'controlit',
  user: process.env.DB_USER || 'controlit',
  password: process.env.DB_PASSWORD,
  max: parseInt(process.env.DB_MAX_CONNECTIONS) || 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
let pool = null;

/**
 * Initialize database connection
 */
export async function initDatabase() {
  try {
    if (!process.env.DB_PASSWORD) {
      logWarn('Database password not configured, skipping database initialization');
      return false;
    }

    pool = new Pool(dbConfig);

    // Test connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    logInfo('Database connection established successfully');

    // Create tables if they don't exist
    await createTables();

    return true;
  } catch (error) {
    logError(error);
    return false;
  }
}

/**
 * Get database pool
 */
export function getPool() {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool;
}

/**
 * Create database tables
 */
async function createTables() {
  const queries = [
    // User preferences table
    `CREATE TABLE IF NOT EXISTS user_preferences (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      preference_key VARCHAR(255) NOT NULL,
      preference_value TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, preference_key)
    )`,

    // Audit log table
    `CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255),
      action VARCHAR(255) NOT NULL,
      resource VARCHAR(255),
      details JSONB,
      ip_address INET,
      user_agent TEXT,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`,

    // Application metrics table
    `CREATE TABLE IF NOT EXISTS app_metrics (
      id SERIAL PRIMARY KEY,
      metric_name VARCHAR(255) NOT NULL,
      metric_value NUMERIC,
      tags JSONB,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`,

    // Backup metadata table
    `CREATE TABLE IF NOT EXISTS backup_metadata (
      id SERIAL PRIMARY KEY,
      backup_type VARCHAR(50) NOT NULL,
      filename VARCHAR(255) NOT NULL,
      file_path TEXT NOT NULL,
      file_size BIGINT,
      checksum VARCHAR(255),
      status VARCHAR(20) DEFAULT 'completed',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP WITH TIME ZONE
    )`,

    // Sessions table
    `CREATE TABLE IF NOT EXISTS user_sessions (
      id SERIAL PRIMARY KEY,
      session_id VARCHAR(255) UNIQUE NOT NULL,
      user_id VARCHAR(255),
      data JSONB,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  const client = await pool.connect();

  try {
    for (const query of queries) {
      await client.query(query);
    }

    // Create indexes for performance
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_app_metrics_name_timestamp ON app_metrics(metric_name, timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_backup_metadata_type_created ON backup_metadata(backup_type, created_at)',
      'CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at)',
      'CREATE INDEX IF NOT EXISTS idx_user_sessions_id ON user_sessions(session_id)'
    ];

    for (const query of indexQueries) {
      await client.query(query);
    }

    logInfo('Database tables and indexes created successfully');
  } catch (error) {
    logError(error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close database connection
 */
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    logInfo('Database connection closed');
  }
}

/**
 * User Preferences Operations
 */
export const userPreferences = {
  async get(userId, key) {
    const query = 'SELECT preference_value FROM user_preferences WHERE user_id = $1 AND preference_key = $2';
    const result = await pool.query(query, [userId, key]);
    return result.rows[0]?.preference_value || null;
  },

  async set(userId, key, value) {
    const query = `
      INSERT INTO user_preferences (user_id, preference_key, preference_value, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, preference_key)
      DO UPDATE SET preference_value = $3, updated_at = CURRENT_TIMESTAMP
    `;
    await pool.query(query, [userId, key, value]);
  },

  async getAll(userId) {
    const query = 'SELECT preference_key, preference_value FROM user_preferences WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return Object.fromEntries(result.rows.map(row => [row.preference_key, row.preference_value]));
  }
};

/**
 * Audit Logging Operations
 */
export const auditLogs = {
  async log(action, details = {}) {
    const query = `
      INSERT INTO audit_logs (user_id, action, resource, details, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    const values = [
      details.userId || null,
      action,
      details.resource || null,
      JSON.stringify(details),
      details.ipAddress || null,
      details.userAgent || null
    ];
    await pool.query(query, values);
  },

  async getRecent(limit = 100) {
    const query = 'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT $1';
    const result = await pool.query(query, [limit]);
    return result.rows;
  }
};

/**
 * Application Metrics Operations
 */
export const appMetrics = {
  async record(name, value, tags = {}) {
    const query = 'INSERT INTO app_metrics (metric_name, metric_value, tags) VALUES ($1, $2, $3)';
    await pool.query(query, [name, value, JSON.stringify(tags)]);
  },

  async getMetrics(name, hours = 24) {
    const query = `
      SELECT metric_name, metric_value, tags, timestamp
      FROM app_metrics
      WHERE metric_name = $1 AND timestamp > CURRENT_TIMESTAMP - INTERVAL '${hours} hours'
      ORDER BY timestamp DESC
    `;
    const result = await pool.query(query, [name]);
    return result.rows;
  }
};

/**
 * Backup Metadata Operations
 */
export const backupMetadata = {
  async record(backupType, filename, filePath, fileSize, checksum) {
    const query = `
      INSERT INTO backup_metadata (backup_type, filename, file_path, file_size, checksum)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await pool.query(query, [backupType, filename, filePath, fileSize, checksum]);
  },

  async getBackups(backupType = null, limit = 50) {
    let query = 'SELECT * FROM backup_metadata';
    const params = [];

    if (backupType) {
      query += ' WHERE backup_type = $1';
      params.push(backupType);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows;
  },

  async cleanupExpired() {
    const query = 'DELETE FROM backup_metadata WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP';
    const result = await pool.query(query);
    return result.rowCount;
  }
};

/**
 * Session Management Operations
 */
export const sessions = {
  async create(sessionId, userId, data, expiresInMinutes = 1440) { // 24 hours default
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    const query = `
      INSERT INTO user_sessions (session_id, user_id, data, expires_at)
      VALUES ($1, $2, $3, $4)
    `;
    await pool.query(query, [sessionId, userId, JSON.stringify(data), expiresAt]);
  },

  async get(sessionId) {
    const query = 'SELECT * FROM user_sessions WHERE session_id = $1 AND expires_at > CURRENT_TIMESTAMP';
    const result = await pool.query(query, [sessionId]);
    return result.rows[0] || null;
  },

  async update(sessionId, data) {
    const query = 'UPDATE user_sessions SET data = $1 WHERE session_id = $2 AND expires_at > CURRENT_TIMESTAMP';
    await pool.query(query, [JSON.stringify(data), sessionId]);
  },

  async destroy(sessionId) {
    const query = 'DELETE FROM user_sessions WHERE session_id = $1';
    await pool.query(query, [sessionId]);
  },

  async cleanupExpired() {
    const query = 'DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP';
    const result = await pool.query(query);
    return result.rowCount;
  }
};

/**
 * Health check for database
 */
export async function healthCheck() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}
