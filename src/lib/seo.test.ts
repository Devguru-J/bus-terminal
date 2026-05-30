import {beforeEach, describe, expect, it} from "vitest";
import {applySeoMeta, getSeoMeta} from "./seo";

describe("seo metadata", () => {
    beforeEach(() => {
        document.head.innerHTML = "";
        document.title = "";
    });

    it("returns route-specific metadata for public platform pages", () => {
        const meta = getSeoMeta("/tmux");

        expect(meta.title).toBe("tmux .tmux.conf 생성기 | 버스터미널 BusTerminal");
        expect(meta.description).toContain("tmux prefix");
        expect(meta.path).toBe("/tmux");
        expect(meta.robots).toBeUndefined();
    });

    it("marks personal workflow pages as noindex", () => {
        const meta = getSeoMeta("/export");

        expect(meta.title).toBe("출발권 만들기 | 버스터미널 BusTerminal");
        expect(meta.robots).toBe("noindex, follow");
    });

    it("marks unknown routes as noindex and keeps their canonical path", () => {
        const meta = getSeoMeta("/not-real-page");

        expect(meta.title).toBe("페이지를 찾을 수 없습니다 | 버스터미널 BusTerminal");
        expect(meta.path).toBe("/not-real-page");
        expect(meta.robots).toBe("noindex, follow");
    });

    it("returns indexable metadata for SEO apply guide pages", () => {
        const meta = getSeoMeta("/guides/tmux-conf-apply");

        expect(meta.title).toBe("tmux .tmux.conf 적용 방법 | 버스터미널");
        expect(meta.description).toContain("tmux source-file");
        expect(meta.path).toBe("/guides/tmux-conf-apply");
        expect(meta.robots).toBeUndefined();
    });

    it("applies title, description, robots, canonical, and social tags", () => {
        applySeoMeta(getSeoMeta("/ghostty"));

        expect(document.title).toBe("Ghostty 설정 생성기 | 버스터미널 BusTerminal");
        expect(metaContent("description")).toContain("Ghostty 터미널");
        expect(metaContent("robots")).toBe("index, follow, max-image-preview:large, max-snippet:-1");
        expect(document.querySelector<HTMLLinkElement>("link[rel='canonical']")?.href).toBe(
            "https://busterminal.dev/ghostty"
        );
        expect(propertyContent("og:title")).toBe("Ghostty 설정 생성기 | 버스터미널 BusTerminal");
        expect(propertyContent("og:url")).toBe("https://busterminal.dev/ghostty");
        expect(metaContent("twitter:title")).toBe("Ghostty 설정 생성기 | 버스터미널 BusTerminal");
    });
});

function metaContent(name: string) {
    return document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.content;
}

function propertyContent(property: string) {
    return document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)?.content;
}
