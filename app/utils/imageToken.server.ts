// 服务端图片 Token 工具函数
// 统一生成、验证和 URL 构造，避免不同路由签名口径不一致

import crypto from 'crypto';
import { getEnvVar, getRequiredEnv } from "~/utils/cloudflare-env.server";

export interface TokenResult {
  imageName: string;
  imageUrl: string;
  token: string;
  expires: number;
}

export interface TokenVerificationResult {
  valid: boolean;
  error?: string;
  expires?: number;
  remainingTime?: number;
}

export function normalizeImageName(imageName: string): string {
  return imageName.trim().replace(/^\/+/, '');
}

function buildMediaUrl(imageName: string, token: string): string {
  const encodedImageName = encodeURIComponent(imageName);
  const mediaBaseUrl = getEnvVar("MEDIA_BASE_URL")?.replace(/\/+$/, '');
  const path = `/api/media?imageName=${encodedImageName}&token=${token}`;

  if (!mediaBaseUrl) {
    return path;
  }

  return `${mediaBaseUrl}${path}`;
}

/**
 * 生成单个图片的访问token
 * @param imageName 图片名称（相对路径，如 'camera/a.jpg' 或 '/SVG/dd.jpg'）
 * @param expiresInMinutes 过期时间（分钟），默认30分钟，范围5-60分钟
 * @returns Token生成结果，包含完整的图片URL
 */
export function generateImageToken(
  imageName: string,
  expiresInMinutes: number = 30
): TokenResult {
  const secret = getRequiredEnv("AUTH_KEY_SECRET");
  const normalizedImageName = normalizeImageName(imageName);
  
  // 验证过期时间范围（5-60分钟）
  const validExpiresInMinutes = Math.max(5, Math.min(60, expiresInMinutes));
  
  // 计算过期时间戳（秒）
  const expires = Math.floor(Date.now() / 1000) + (validExpiresInMinutes * 60);
  
  // 生成签名：HMAC_SHA256(normalizedImageName:expires, secret)
  // 使用规范化后的路径名来生成签名，确保与OSS服务器验证逻辑一致
  const message = `${normalizedImageName}:${expires}`;
  const signature = crypto.createHmac('sha256', secret)
    .update(message)
    .digest('hex');
  
  // 生成Token：base64url(expires:signature)
  const tokenData = `${expires}:${signature}`;
  const token = Buffer.from(tokenData).toString('base64url');
  
  // 生成 Worker 代理地址，避免依赖外部 OSS 域名校验逻辑
  const imageUrl = buildMediaUrl(normalizedImageName, token);
  
  return { imageName: normalizedImageName, imageUrl, token, expires };
}

export function verifyImageToken(
  token: string,
  imageName: string
): TokenVerificationResult {
  try {
    const secret = getRequiredEnv("AUTH_KEY_SECRET");
    const normalizedImageName = normalizeImageName(imageName);

    const tokenData = Buffer.from(token, 'base64url').toString('utf-8');
    const [expires, receivedSignature] = tokenData.split(':');

    if (!expires || !receivedSignature) {
      return { valid: false, error: 'Invalid token format' };
    }

    const expiresTimestamp = parseInt(expires, 10);
    if (!Number.isFinite(expiresTimestamp)) {
      return { valid: false, error: 'Invalid expires value' };
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (expiresTimestamp < currentTime) {
      return { valid: false, error: 'Token expired', expires: expiresTimestamp, remainingTime: 0 };
    }

    const message = `${normalizedImageName}:${expires}`;
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(message)
      .digest('hex');

    if (receivedSignature !== expectedSignature) {
      return { valid: false, error: 'Invalid signature' };
    }

    return {
      valid: true,
      expires: expiresTimestamp,
      remainingTime: expiresTimestamp - currentTime,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Token validation failed';
    return { valid: false, error: errorMessage };
  }
}

/**
 * 批量生成多个图片的访问token
 * @param imageNames 图片名称数组
 * @param expiresInMinutes 过期时间（分钟），默认30分钟
 * @returns Token生成结果数组
 */
export function generateImageTokens(
  imageNames: string[],
  expiresInMinutes: number = 30
): TokenResult[] {
  return imageNames.map(name => generateImageToken(name, expiresInMinutes));
}

