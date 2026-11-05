import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

let pool: mysql.Pool | null = null;
let isConnected = false;

export async function initDatabase(): Promise<boolean> {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'daily_expense_tracker';

  try {
    // 1. Check server connection
    const tempConnection = await mysql.createConnection({
      host,
      port,
      user,
      password,
    });

    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await tempConnection.end();

    // 2. Create connection pool for the database
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 0,
      multipleStatements: true,
    });

    // 3. Test ping
    const connection = await pool.getConnection();
    console.log(`[Database] Connected successfully to MySQL database "${database}" at ${host}:${port}`);
    connection.release();

    // 4. Run schema file
    const schemaPath = path.join(__dirname, '../schema/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(sql);
      console.log('[Database] Schema verified and tables created/updated.');
    }

    isConnected = true;
    return true;
  } catch (error: any) {
    console.warn(`[Database] MySQL connection notice: ${error.message}`);
    console.warn('[Database] Operating with resilient memory-backed engine. You can connect MySQL in backend/.env anytime!');
    isConnected = false;
    return false;
  }
}

export function isMysqlConnected(): boolean {
  return isConnected;
}

export function getPool(): mysql.Pool | null {
  return pool;
}

