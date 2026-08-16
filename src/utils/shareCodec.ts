/**
 * 前端分享链接参数编解码
 * 注意：纯静态项目无法做到真正防篡改，此处使用 Base64 + 简单混淆，
 * 只能阻止普通用户直接修改 URL 参数，无法防御会查看源码的攻击者。
 */

const XOR_KEY = 'whimsy-qixi-2026';

function xorCipher(input: string): string {
  let output = '';
  for (let i = 0; i < input.length; i++) {
    output += String.fromCharCode(input.charCodeAt(i) ^ XOR_KEY.charCodeAt(i % XOR_KEY.length));
  }
  return output;
}

function safeBase64Encode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function safeBase64Decode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = str.length % 4;
  if (pad) str += '='.repeat(4 - pad);
  return atob(str);
}

export interface SharePayload {
  festivalId: string;
  step: number;
  fortuneId?: number;
  from?: string;
  to?: string;
  msg?: string;
  ts?: number;
}

export function encodeSharePayload(payload: SharePayload): string {
  const json = JSON.stringify(payload);
  const xored = xorCipher(json);
  return safeBase64Encode(xored);
}

export function decodeSharePayload(encoded: string): SharePayload | null {
  try {
    const xored = safeBase64Decode(encoded);
    const json = xorCipher(xored);
    const payload = JSON.parse(json) as SharePayload;
    if (!payload.festivalId || typeof payload.step !== 'number') return null;
    return payload;
  } catch {
    return null;
  }
}

export function buildShareUrl(payload: SharePayload): string {
  const base = (import.meta.env.BASE_URL || '/whimsy-hub').replace(/\/?$/, '/');
  const origin = window.location.origin;
  const encoded = encodeSharePayload({ ...payload, ts: Date.now() });
  return `${origin}${base}blessing/${payload.festivalId}?s=${encoded}`;
}
