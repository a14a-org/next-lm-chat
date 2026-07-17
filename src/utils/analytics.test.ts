/// <reference types="bun" />

import { expect, test } from "bun:test";
import { settleAnalyticsProvider, trackEvent } from "./analytics";

test("delivers once per healthy provider as scripts settle independently", () => {
	const calls: string[] = [];
	Object.defineProperty(globalThis, "window", {
		configurable: true,
		value: {},
	});

	trackEvent({ name: "message_sent", data: { model: "local" } });
	window.umami = { track: (name) => calls.push(`umami:${name}`) };
	settleAnalyticsProvider("umami", "ready");
	expect(calls).toEqual(["umami:message_sent"]);

	window.chili = { track: (name) => calls.push(`chili:${name}`) };
	settleAnalyticsProvider("chili", "ready");
	expect(calls).toEqual(["umami:message_sent", "chili:message_sent"]);

	settleAnalyticsProvider("umami", "pending");
	settleAnalyticsProvider("chili", "pending");
	trackEvent({ name: "settings_opened" });
	settleAnalyticsProvider("umami", "ready");
	settleAnalyticsProvider("chili", "failed");
	expect(calls).toEqual([
		"umami:message_sent",
		"chili:message_sent",
		"umami:settings_opened",
	]);

	settleAnalyticsProvider("umami", "pending");
	settleAnalyticsProvider("chili", "pending");
	trackEvent({ name: "image_uploaded" });
	settleAnalyticsProvider("umami", "failed");
	settleAnalyticsProvider("chili", "failed");
	expect(calls).not.toContain("umami:image_uploaded");
	expect(calls).not.toContain("chili:image_uploaded");

	delete (globalThis as { window?: Window }).window;
});
