"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.initDatabase = initDatabase;
exports.executeQuery = executeQuery;
exports.executeTransaction = executeTransaction;
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Support Clever Cloud style env vars and URL
const dbUrl = process.env.DB_URL || process.env.DATABASE_URL || '';
let parsedUrlConfig = {};
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
}
catch { }
// Clever Cloud specific variables
const cleverCloudConfig = {
    host: process.env.MYSQL_ADDON_HOST,
    port: process.env.MYSQL_ADDON_PORT ? Number(process.env.MYSQL_ADDON_PORT) : undefined,
    user: process.env.MYSQL_ADDON_USER,
    password: process.env.MYSQL_ADDON_PASSWORD,
    database: process.env.MYSQL_ADDON_DB
};
// Database connection configuration
const dbConfig = {
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
exports.pool = promise_1.default.createPool(dbConfig);
// Initialize database - create database if it doesn't exist
async function initDatabase() {
    try {
        // Only attempt to create database in local/dev or if explicitly allowed
        const allowCreate = process.env.ALLOW_DB_CREATE === 'true' || process.env.NODE_ENV === 'development';
        if (allowCreate) {
            const tempConfig = {
                host: dbConfig.host,
                port: dbConfig.port,
                user: dbConfig.user,
                password: dbConfig.password
            };
            const tempConnection = await promise_1.default.createConnection(tempConfig);
            const dbName = dbConfig.database || process.env.DB_NAME;
            if (dbName) {
                await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
            }
            await tempConnection.end();
        }
        // Test the pool connection
        const connection = await exports.pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
}
// Helper function to execute queries
async function executeQuery(query, params = []) {
    try {
        const [results] = await exports.pool.execute(query, params);
        return results;
    }
    catch (error) {
        console.error('Query execution error:', error);
        throw error;
    }
}
// Helper function for transactions
async function executeTransaction(queries) {
    const connection = await exports.pool.getConnection();
    try {
        await connection.beginTransaction();
        const results = [];
        for (const { query, params } of queries) {
            const [result] = await connection.execute(query, params);
            results.push(result);
        }
        await connection.commit();
        return results;
    }
    catch (error) {
        await connection.rollback();
        throw error;
    }
    finally {
        connection.release();
    }
}
//# sourceMappingURL=database.js.map