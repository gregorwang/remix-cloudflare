import { getRateLimiterBinding } from "~/utils/cloudflare-env.server";

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

type IncrementWindowResponse = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  count: number;
};

type CheckCooldownResponse = {
  allowed: boolean;
  remainingSeconds: number;
};

type PeekResponse = {
  count: number;
  expiresAt: number;
};

async function callRateLimiter<T>(key: string, payload: Record<string, unknown>): Promise<T> {
  const namespace = getRateLimiterBinding();
  const stub = namespace.get(namespace.idFromName(key));

  const response = await stub.fetch("https://rate-limiter/internal", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Rate limiter DO request failed (${response.status}): ${message}`);
  }

  return (await response.json()) as T;
}

async function checkAndIncrementRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  try {
    const result = await callRateLimiter<IncrementWindowResponse>(key, {
      op: "incrementWindow",
      limit,
      windowSeconds,
    });

    return {
      allowed: result.allowed,
      remaining: result.remaining,
      resetAt: new Date(result.resetAt * 1000),
    };
  } catch (error) {
    console.error("[RateLimit] Durable Object error:", error);

    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      resetAt: new Date(Date.now() + windowSeconds * 1000),
    };
  }
}

async function checkCooldown(key: string, cooldownSeconds: number): Promise<CooldownResult> {
  try {
    return await callRateLimiter<CheckCooldownResponse>(key, {
      op: "checkCooldown",
      cooldownSeconds,
    });
  } catch (error) {
    console.error("[RateLimit] Cooldown Durable Object error:", error);
    return {
      allowed: true,
      remainingSeconds: 0,
    };
  }
}

async function peekCounter(key: string): Promise<PeekResponse> {
  return callRateLimiter<PeekResponse>(key, { op: "peek" });
}

function getEndOfDayTimestamp(): number {
  const today = new Date();
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  return Math.floor(endOfDay.getTime() / 1000);
}

export const MagicLinkRateLimitService = {
  async checkIPRateLimit(ip: string): Promise<RateLimitResult> {
    const key = `ip:${ip}:magic_link`;
    return checkAndIncrementRateLimit(key, 5, 3600);
  },

  async checkEmailRateLimit(email: string): Promise<RateLimitResult> {
    const key = `email:${email.toLowerCase()}:magic_link:hour`;
    return checkAndIncrementRateLimit(key, 3, 3600);
  },

  async checkEmailCooldown(email: string): Promise<CooldownResult> {
    const key = `email:${email.toLowerCase()}:magic_link:cooldown`;
    return checkCooldown(key, 60);
  },

  async checkGlobalRateLimit(): Promise<GlobalRateLimitResult> {
    const key = "global:magic_link:hour";
    const result = await checkAndIncrementRateLimit(key, 100, 3600);

    return {
      allowed: result.allowed,
      remaining: result.remaining,
    };
  },

  async getEmailLimitStatus(email: string): Promise<{
    hourlyRemaining: number;
    cooldownSeconds: number;
  }> {
    const hourKey = `email:${email.toLowerCase()}:magic_link:hour`;
    const cooldownKey = `email:${email.toLowerCase()}:magic_link:cooldown`;
    const now = Math.floor(Date.now() / 1000);

    try {
      const [hourState, cooldownState] = await Promise.all([
        peekCounter(hourKey),
        peekCounter(cooldownKey),
      ]);

      return {
        hourlyRemaining: Math.max(0, 3 - hourState.count),
        cooldownSeconds: Math.max(0, cooldownState.expiresAt - now),
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

export const MessageRateLimitService = {
  async checkIPRateLimit(ip: string): Promise<boolean> {
    const key = `ip:${ip}:messages`;
    const result = await checkAndIncrementRateLimit(key, 20, 3600);
    return result.allowed;
  },

  async checkUserRateLimit(userId: string): Promise<boolean> {
    const key = `user:${userId}:messages:cooldown`;
    const result = await checkCooldown(key, 60);
    return result.allowed;
  },

  async getUserTodayCount(userId: string): Promise<number> {
    const key = `user:${userId}:messages:today`;

    try {
      const state = await peekCounter(key);
      return state.count;
    } catch (error) {
      console.error("[RateLimit] Get today count error:", error);
      return 0;
    }
  },

  async checkDailyLimit(userId: string, limit: number = 10): Promise<boolean> {
    const count = await this.getUserTodayCount(userId);
    return count < limit;
  },

  async incrementUserTodayCount(userId: string): Promise<void> {
    const key = `user:${userId}:messages:today`;

    try {
      await callRateLimiter<{ count: number; expiresAt: number }>(key, {
        op: "incrementFixedExpiry",
        expiresAt: getEndOfDayTimestamp(),
      });
    } catch (error) {
      console.error("[RateLimit] Increment today count error:", error);
    }
  },
};

export const RateLimitService = MessageRateLimitService;
export const MessageService = MessageRateLimitService;
