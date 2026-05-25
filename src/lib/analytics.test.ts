import {describe, it, expect, beforeEach, vi} from "vitest";
import {trackEvent, trackPageview, initAnalytics} from "./analytics";

describe("analytics", () => {
    beforeEach(() => {
        delete (window as {plausible?: unknown}).plausible;
        document.getElementById("plausible-analytics-script")?.remove();
    });

    it("trackEvent does not throw when plausible is missing", () => {
        expect(() => trackEvent("Test Event")).not.toThrow();
        expect(() => trackEvent("Test Event", {foo: "bar"})).not.toThrow();
    });

    it("trackEvent calls window.plausible with props when present", () => {
        const spy = vi.fn();
        (window as {plausible?: unknown}).plausible = spy;
        trackEvent("Config Downloaded", {platform: "ghostty"});
        expect(spy).toHaveBeenCalledWith("Config Downloaded", {props: {platform: "ghostty"}});
    });

    it("trackEvent calls window.plausible without options when no props", () => {
        const spy = vi.fn();
        (window as {plausible?: unknown}).plausible = spy;
        trackEvent("Auth SignIn");
        expect(spy).toHaveBeenCalledWith("Auth SignIn", undefined);
    });

    it("trackPageview does not throw when plausible is missing", () => {
        expect(() => trackPageview("/ghostty")).not.toThrow();
    });

    it("trackPageview calls plausible with origin+path", () => {
        const spy = vi.fn();
        (window as {plausible?: unknown}).plausible = spy;
        trackPageview("/themes");
        expect(spy).toHaveBeenCalledWith("pageview", {u: `${window.location.origin}/themes`});
    });

    it("initAnalytics is a no-op when VITE_PLAUSIBLE_DOMAIN is unset", () => {
        // 테스트 환경에서 env가 비어있다는 전제. 스크립트 태그가 주입되지 않아야 한다.
        initAnalytics();
        expect(document.getElementById("plausible-analytics-script")).toBeNull();
    });
});
