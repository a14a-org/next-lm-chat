import { expect, test } from "@playwright/test";

// Smoke tests: every key route must render server-side without an HTTP error
// and without throwing an uncaught client exception. Intentionally content-
// agnostic so dependency bumps don't break it on copy changes — it verifies
// the app still boots and routes still resolve.
const routes = ["/"];

for (const path of routes) {
	test(`smoke: ${path} renders without errors`, async ({ page }) => {
		const pageErrors: string[] = [];
		page.on("pageerror", (err) => pageErrors.push(String(err)));

		const response = await page.goto(path, { waitUntil: "domcontentloaded" });

		expect(response, `no response for ${path}`).not.toBeNull();
		expect(response?.status(), `HTTP status for ${path}`).toBeLessThan(400);
		await expect(page.locator("body")).toBeVisible();
		expect(pageErrors, `uncaught exceptions on ${path}`).toEqual([]);
	});
}
