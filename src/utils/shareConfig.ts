/**
 * 分享链接时效配置
 *
 * 修改以下两个常量即可控制分享链接是否限时、限时多久：
 *
 * - ENABLE_EXPIRY: 是否开启限时（true=限时，false=不限时永久有效）
 * - EXPIRY_MINUTES: 限时时长（分钟），仅在 ENABLE_EXPIRY=true 时生效
 *
 * 示例：
 *   ENABLE_EXPIRY = true,  EXPIRY_MINUTES = 1   → 链接 1 分钟后过期
 *   ENABLE_EXPIRY = true,  EXPIRY_MINUTES = 60  → 链接 1 小时后过期
 *   ENABLE_EXPIRY = false                       → 链接永久有效
 */

export const SHARE_CONFIG = {
  /** 是否开启限时分享 */
  ENABLE_EXPIRY: true,
  /** 限时时长（分钟），仅在 ENABLE_EXPIRY=true 时生效 */
  EXPIRY_MINUTES: 1440,
} as const;

/**
 * 检查分享载荷是否已过期
 * @param ts - 分享链接生成时的时间戳（毫秒）
 * @returns true 表示已过期或无时间戳
 */
export function isSharePayloadExpired(ts?: number): boolean {
  // 未开启限时 → 永不过期
  if (!SHARE_CONFIG.ENABLE_EXPIRY) return false;
  // 无时间戳 → 视为过期（旧链接无 ts 字段）
  if (!ts) return true;
  const elapsed = Date.now() - ts;
  const expiryMs = SHARE_CONFIG.EXPIRY_MINUTES * 60 * 1000;
  return elapsed > expiryMs;
}
