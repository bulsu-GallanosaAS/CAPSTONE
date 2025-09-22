import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Support Clever Cloud style env vars and URL
const dbUrl = process.env.DB_URL || process.env.DATABASE_URL || '';
let parsedUrlConfig: Partial<mysql.PoolOptions> = {};

try {
  if (dbUrl) {
    const url = new URL(dbUrl);
    parsedUrlConfig = {
      host: url.hostname,
      port: url.port ? Number(url.port) : undefined,
      user: url.username,
      password: url.password,
      database: url.pathname ? url.pathname.replace(/^\//, '') : undefined
    };
  }
} catch {}

// Clever Cloud specific variables
const cleverCloudConfig: Partial<mysql.PoolOptions> = {
  host: process.env.MYSQL_ADDON_HOST,
  port: process.env.MYSQL_ADDON_PORT ? Number(process.env.MYSQL_ADDON_PORT) : undefined,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB
};

// Database connection configuration
const dbConfig: mysql.PoolOptions = {
  host: parsedUrlConfig.host || cleverCloudConfig.host || process.env.DB_HOST || 'localhost',
  port: parsedUrlConfig.port || cleverCloudConfig.port || (process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306),
  user: parsedUrlConfig.user || cleverCloudConfig.user || process.env.DB_USER || 'root',
  password: parsedUrlConfig.password || cleverCloudConfig.password || process.env.DB_PASSWORD || '',
  database: parsedUrlConfig.database || cleverCloudConfig.database || process.env.DB_NAME || 'siszum_pos',
  waitForConnections: true,
  connectionLimit: process.env.DB_CONNECTION_LIMIT ? Number(process.env.DB_CONNECTION_LIMIT) : 10,
  queueLimit: 0,
  // Valid mysql2 options below. Removed invalid options (acquireTimeout, timeout, reconnect)
  connectTimeout: process.env.DB_CONNECT_TIMEOUT ? Number(process.env.DB_CONNECT_TIMEOUT) : 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: process.env.DB_SSL === 'true' || process.env.MYSQL_ADDON_SSL === 'true' ? { rejectUnauthorized: true } : undefined
};


// Create connection pool
export const pool = mysql.createPool(dbConfig);

// Initialize database - create database if it doesn't exist
export async function initDatabase() {
  try {
    // Only attempt to create database in local/dev or if explicitly allowed
    const allowCreate = process.env.ALLOW_DB_CREATE === 'true' || process.env.NODE_ENV === 'development';
    if (allowCreate) {
      const tempConfig = {
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user as string,
        password: dbConfig.password as string
      } as mysql.ConnectionOptions;
      const tempConnection = await mysql.createConnection(tempConfig);
      const dbName = (dbConfig.database as string) || process.env.DB_NAME;
      if (dbName) {
        await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
      }
      await tempConnection.end();
    }
    
    // Test the pool connection
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    
    // Test a simple query to verify the connection works
    const [testResult]: any = await connection.execute('SELECT 1 as test, NOW() as current_time');
    
    connection.release();
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Helper function to execute queries
export async function executeQuery(query: string, params: any[] = []): Promise<any> {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('Query execution error:', error);
    throw error;
  }
}

// Helper function for transactions
export async function executeTransaction(queries: { query: string; params: any[] }[]): Promise<any> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { query, params } of queries) {
      const [result] = await connection.execute(query, params);
      results.push(result);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
