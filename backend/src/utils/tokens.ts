import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

// ─── Access Token ────────────────────────────────────────────

export function signAccessToken(userId: string): string {
  // expiresIn as seconds (number) to satisfy jsonwebtoken v9 strict overloads
  const fifteenMinutes = 15 * 60;
  return jwt.sign({ sub: userId }, ENV.JWT_ACCESS_SECRET, {
    expiresIn: fifteenMinutes,
    algorithm: 'HS256',
  });
}

// ─── Refresh Token ───────────────────────────────────────────

export function generateRefreshToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(64).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}

export function hashRefreshToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

// ─── Recovery Key ────────────────────────────────────────────
// Format: BKHL-XXXX-XXXX-XXXX-XXXX  (16 random hex chars in 4 groups)

export function generateRecoveryKey(): string {
  const segment = () => crypto.randomBytes(2).toString('hex').toUpperCase();
  return `BKHL-${segment()}${segment()}-${segment()}${segment()}-${segment()}${segment()}-${segment()}${segment()}`;
}

export function hashRecoveryKey(key: string): string {
  // Use SHA-256 for storage (fast lookup); bcrypt used at registration for extra hardening
  return crypto.createHash('sha256').update(key.trim().toUpperCase()).digest('hex');
}

// ─── Refresh Token Cookie ────────────────────────────────────

export function refreshCookieOptions() {
  const expires = new Date();
  expires.setDate(expires.getDate() + ENV.REFRESH_TOKEN_TTL_DAYS);
  return {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/api/v1/auth',
    expires,
  };
}
