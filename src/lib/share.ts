/**
 * 노선 공유: URL-safe base64로 config 텍스트를 인코딩해서 해시에 박는다.
 * 서버 없이 링크 한 줄로 공유 가능.
 */

export const SHARE_KEY = "route";
export const MAX_SHARE_URL_LENGTH = 1800;

export function encodePayload(text: string): string {
    const bytes = new TextEncoder().encode(text);
    let bin = "";
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function decodePayload(encoded: string): string {
    const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const pad = normalized.length % 4;
    const b64 = pad === 0 ? normalized : `${normalized}${"=".repeat(4 - pad)}`;
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
}

export function buildShareUrl(origin: string, pathname: string, encoded: string): string {
    const p = new URLSearchParams();
    p.set(SHARE_KEY, encoded);
    return `${origin}${pathname}#${p.toString()}`;
}

export function readShareFromHash(hash: string): string | null {
    if (!hash) return null;
    const p = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    return p.get(SHARE_KEY);
}
