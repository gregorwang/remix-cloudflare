import Database from "better-sqlite3";
import path from "path";
import { Kysely, SqliteDialect } from "kysely";

// 数据库文件路径
const dbPath =
  process.env.NODE_ENV === "production"
    ? path.join(process.cwd(), "data", "app.db")
    : path.join(process.cwd(), "app.db");

console.log(`[Database] Using database at: ${dbPath}`);

// 原生 better-sqlite3 连接
const sqliteDb = new Database(dbPath);

// 启用WAL模式（提升并发性能）
sqliteDb.pragma("journal_mode = WAL");
sqliteDb.pragma("foreign_keys = ON");

// Kysely 实例（Better Auth 需要）
export const authDb = new Kysely<any>({
  dialect: new SqliteDialect({
    database: sqliteDb,
  }),
});

// 导出原生数据库用于现有查询逻辑
export const db = sqliteDb;

// 初始化数据库表
export function initializeDatabase() {
  console.log("[Database] Initializing tables...");

  sqliteDb.exec(`
    -- 用户表
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      emailVerified INTEGER DEFAULT 0,
      name TEXT,
      image TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    -- 会话表（Better Auth需要）
    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      expiresAt INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      ipAddress TEXT,
      userAgent TEXT,
      userId TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    );

    -- 账户表（OAuth需要）
    CREATE TABLE IF NOT EXISTS account (
      id TEXT PRIMARY KEY,
      accountId TEXT NOT NULL,
      providerId TEXT NOT NULL,
      userId TEXT NOT NULL,
      accessToken TEXT,
      refreshToken TEXT,
      idToken TEXT,
      expiresAt INTEGER,
      accessTokenExpiresAt INTEGER,
      refreshTokenExpiresAt INTEGER,
      scope TEXT,
      password TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
    );

    -- 验证表（Magic Link需要）
    CREATE TABLE IF NOT EXISTS verification (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expiresAt INTEGER NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    -- 留言表
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
    );

    -- 限流记录表（替代Redis）
    CREATE TABLE IF NOT EXISTS rate_limits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      count INTEGER NOT NULL DEFAULT 1,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );

    -- 索引优化
    CREATE INDEX IF NOT EXISTS idx_session_userId ON session(userId);
    CREATE INDEX IF NOT EXISTS idx_account_userId ON account(userId);
    CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
    CREATE INDEX IF NOT EXISTS idx_rate_limits_key ON rate_limits(key, expires_at);
    CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON rate_limits(expires_at);
  `);

  console.log("[Database] Tables initialized successfully");
}

// 清理过期的限流记录（定期清理，减少数据库大小）
export function cleanupExpiredRateLimits() {
  const now = Math.floor(Date.now() / 1000);
  const stmt = db.prepare("DELETE FROM rate_limits WHERE expires_at < ?");
  const result = stmt.run(now);

  if (result.changes > 0) {
    console.log(`[Database] Cleaned up ${result.changes} expired rate limit records`);
  }
}

// 每小时清理一次过期记录
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredRateLimits, 60 * 60 * 1000);
}

// 应用启动时初始化数据库
initializeDatabase();

// 优雅关闭
if (typeof process !== "undefined") {
  const shutdown = () => {
    void authDb.destroy().catch((error) => {
      console.error("[Database] Failed to destroy Kysely instance:", error);
    });
    sqliteDb.close();
  };

  process.on("exit", shutdown);
  process.on("SIGINT", () => {
    shutdown();
    process.exit(0);
  });
}
