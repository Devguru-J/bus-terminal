import {describe, expect, test} from "vitest";
import {
    buildShareUrl,
    decodePayload,
    encodePayload,
    readShareFromHash,
    SHARE_KEY
} from "./share";

describe("share encode/decode round-trip", () => {
    test("ASCII round-trip", () => {
        const input = "hello world 123";
        expect(decodePayload(encodePayload(input))).toBe(input);
    });

    test("Korean unicode round-trip", () => {
        const input = "다람쥐 헌 쳇바퀴에 타고파";
        expect(decodePayload(encodePayload(input))).toBe(input);
    });

    test("emoji + special bytes round-trip", () => {
        const input = "🚌 ❯ git status — 안녕 \\n // 'quotes'";
        expect(decodePayload(encodePayload(input))).toBe(input);
    });

    test("large JSON config round-trip", () => {
        const input = JSON.stringify({
            name: "tokyo night",
            palette16: Array.from({length: 16}, (_, i) => `#${i.toString(16).padStart(6, "0")}`),
            keybinds: ["ctrl+t=new_tab", "cmd+shift+p"],
            note: "한글 + multibyte + \"quotes\" + \\\\backslash"
        });
        expect(decodePayload(encodePayload(input))).toBe(input);
    });

    test("encoded output is URL-safe (no +, /, =)", () => {
        const encoded = encodePayload("a".repeat(100) + "🚌");
        expect(encoded).not.toMatch(/\+/);
        expect(encoded).not.toMatch(/\//);
        expect(encoded).not.toMatch(/=/);
    });

    test("empty string round-trip", () => {
        expect(decodePayload(encodePayload(""))).toBe("");
    });

    test("buildShareUrl / readShareFromHash round-trip", () => {
        const payload = encodePayload("내 노선 설정");
        const url = buildShareUrl("https://bus-terminal.pages.dev", "/my-routes", payload);
        expect(url).toContain("#");
        expect(url).toContain(SHARE_KEY);
        // 해시 부분 추출
        const hash = url.slice(url.indexOf("#"));
        const recovered = readShareFromHash(hash);
        expect(recovered).toBe(payload);
        expect(decodePayload(recovered!)).toBe("내 노선 설정");
    });

    test("readShareFromHash returns null for empty or missing param", () => {
        expect(readShareFromHash("")).toBeNull();
        expect(readShareFromHash("#")).toBeNull();
        expect(readShareFromHash("#other=value")).toBeNull();
    });
});
