import { db } from "./db.server";

/**
 * SQLite-based Rate Limiting Service
 * 替代Redis，避免远程连接超时问题
 */

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

interface CooldownResult {
  allowed: boolean;
  remainingSeconds: number;
}

interface GlobalRateLimitResult {
  allowed: boolean;
  remaining: number;
}

/**
 * 检查或增加限流计数
 * @param key 限流键
 * @param limit 限制次数
 * @param windowSeconds 时间窗口（秒）
 */
function checkAndIncrementRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): RateLimitResult {
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + windowSeconds;

  try {
    // 先清理过期的记录（保证查询准确性）
    db.prepare("DELETE FROM rate_limits WHERE expires_at < ?").run(now);

    // 查询当前计数
    const record = db
      .prepare("SELECT count, expires_at FROM rate_limits WHERE key = ? AND expires_at > ?")
      .get(key, now) as { count: number; expires_at: number } | undefined;

    if (!record) {
      // 第一次请求，插入新记录
      db.prepare(
        "INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?)"
      ).run(key, expiresAt);

      return {
        allowed: true,
        remaining: limit - 1,
        resetAt: new Date(expiresAt * 1000),
      };
    }

    // 检查是否超过限制
    if (record.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(record.expires_at * 1000),
      };
    }

    // 增加计数
    db.prepare("UPDATE rate_limits SET count = count + 1 WHERE key = ?").run(key);

    return {
      allowed: true,
      remaining: limit - record.count - 1,
      resetAt: new Date(record.expires_at * 1000),
    };
  } catch (error) {
    console.error("[RateLimit] Database error:", error);

    // 数据库错误时降级：允许请求（宽松策略）
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: new Date(Date.now() + windowSeconds * 1000),
    };
  }
}

/**
 * Magic Link 限流服务
 */
export const MagicLinkRateLimitService = {
  /**
   * 检查 IP 限流（每小时5次）
   */
  checkIPRateLimit(ip: string): RateLimitResult {
    const key = `ip:${ip}:magic_link`;
    return checkAndIncrementRateLimit(key, 5, 3600); // 5次/小时
  },

  /**
   * 检查邮箱限流（每小时3次）
   */
  checkEmailRateLimit(email: string): RateLimitResult {
    const key = `email:${email.toLowerCase()}:magic_link:hour`;
    return checkAndIncrementRateLimit(key, 3, 3600); // 3次/小时
  },

  /**
   * 检查邮箱冷却时间（60秒）
   * 防止用户连续点击发送按钮
   */
  checkEmailCooldown(email: string): CooldownResult {
    const key = `email:${email.toLowerCase()}:magic_link:cooldown`;
    const now = Math.floor(Date.now() / 1000);

    try {
      // 查询是否存在冷却记录
      const record = db
        .prepare("SELECT expires_at FROM rate_limits WHERE key = ? AND expires_at > ?")
        .get(key, now) as { expires_at: number } | undefined;

      if (record) {
        return {
          allowed: false,
          remainingSeconds: record.expires_at - now,
        };
      }

      // 设置冷却标记
      const expiresAt = now + 60; // 60秒
      db.prepare(
        "INSERT OR REPLACE INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?)"
      ).run(key, expiresAt);

      return {
        allowed: true,
        remainingSeconds: 0,
      };
    } catch (error) {
      console.error("[RateLimit] Cooldown check error:", error);
      // 出错时允许请求
      return {
        allowed: true,
        remainingSeconds: 0,
      };
    }
  },

  /**
   * 检查全局限流（每小时100次）
   */
  checkGlobalRateLimit(): GlobalRateLimitResult {
    const key = "global:magic_link:hour";
    const result = checkAndIncrementRateLimit(key, 100, 3600); // 100次/小时

    return {
      allowed: result.allowed,
      remaining: result.remaining,
    };
  },

  /**
   * 获取邮箱的限流状态（用于前端显示）
   */
  getEmailLimitStatus(email: string): {
    hourlyRemaining: number;
    cooldownSeconds: number;
  } {
    const hourKey = `email:${email.toLowerCase()}:magic_link:hour`;
    const cooldownKey = `email:${email.toLowerCase()}:magic_link:cooldown`;
    const now = Math.floor(Date.now() / 1000);

    try {
      // 查询小时限流
      const hourRecord = db
        .prepare("SELECT count FROM rate_limits WHERE key = ? AND expires_at > ?")
        .get(hourKey, now) as { count: number } | undefined;

      const hourlyRemaining = 3 - (hourRecord?.count || 0);

      // 查询冷却时间
      const cooldownRecord = db
        .prepare("SELECT expires_at FROM rate_limits WHERE key = ? AND expires_at > ?")
        .get(cooldownKey, now) as { expires_at: number } | undefined;

      const cooldownSeconds = cooldownRecord
        ? Math.max(0, cooldownRecord.expires_at - now)
        : 0;

      return {
        hourlyRemaining: Math.max(0, hourlyRemaining),
        cooldownSeconds,
      };
    } catch (error) {
      console.error("[RateLimit] Get status error:", error);
      return {
        hourlyRemaining: 3,
        cooldownSeconds: 0,
      };
    }
  },
};

/**
 * 留言板限流服务
 */
export const MessageRateLimitService = {
  /**
   * 检查 IP 限流（每小时20次）
   */
  checkIPRateLimit(ip: string): boolean {
    const key = `ip:${ip}:messages`;
    const result = checkAndIncrementRateLimit(key, 20, 3600); // 20次/小时
    return result.allowed;
  },

  /**
   * 检查用户冷却时间（60秒）
   */
  checkUserRateLimit(userId: string): boolean {
    const key = `user:${userId}:messages:cooldown`;
    const now = Math.floor(Date.now() / 1000);

    try {
      // 查询是否存在冷却记录
      const record = db
        .prepare("SELECT expires_at FROM rate_limits WHERE key = ? AND expires_at > ?")
        .get(key, now) as { expires_at: number } | undefined;

      if (record) {
        return false; // 冷却中
      }

      // 设置冷却标记
      const expiresAt = now + 60; // 60秒
      db.prepare(
        "INSERT OR REPLACE INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?)"
      ).run(key, expiresAt);

      return true;
    } catch (error) {
      console.error("[RateLimit] User cooldown check error:", error);
      return true; // 出错时允许
    }
  },

  /**
   * 获取用户今天的留言数
   */
  getUserTodayCount(userId: string): number {
    const key = `user:${userId}:messages:today`;
    const now = Math.floor(Date.now() / 1000);

    try {
      const record = db
        .prepare("SELECT count FROM rate_limits WHERE key = ? AND expires_at > ?")
        .get(key, now) as { count: number } | undefined;

      return record?.count || 0;
    } catch (error) {
      console.error("[RateLimit] Get today count error:", error);
      return 0;
    }
  },

  /**
   * 检查用户是否达到每日留言上限
   */
  checkDailyLimit(userId: string, limit: number = 10): boolean {
    const count = this.getUserTodayCount(userId);
    return count < limit;
  },

  /**
   * 增加用户今天的留言计数
   */
  incrementUserTodayCount(userId: string): void {
    const key = `user:${userId}:messages:today`;
    const now = Math.floor(Date.now() / 1000);

    try {
      // 计算今天结束的时间
      const today = new Date();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      const expiresAt = Math.floor(endOfDay.getTime() / 1000);

      // 查询现有记录
      const record = db
        .prepare("SELECT count FROM rate_limits WHERE key = ? AND expires_at > ?")
        .get(key, now) as { count: number } | undefined;

      if (record) {
        // 增加计数
        db.prepare("UPDATE rate_limits SET count = count + 1 WHERE key = ?").run(key);
      } else {
        // 创建新记录
        db.prepare(
          "INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?)"
        ).run(key, expiresAt);
      }
    } catch (error) {
      console.error("[RateLimit] Increment today count error:", error);
    }
  },
};

/**
 * 向后兼容的导出
 */
export const RateLimitService = MessageRateLimitService;
export const MessageService = MessageRateLimitService;
