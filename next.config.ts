import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
};

export default withSentryConfig(nextConfig, {
	sentryUrl: "https://errors.a14a.org",
	org: "a14a",
	project: "next-lm-chat",
	authToken: process.env.SENTRY_AUTH_TOKEN,
	silent: true,
	telemetry: false,
	release:
		process.env.SOURCE_COMMIT && process.env.SOURCE_COMMIT !== "undefined"
			? { name: process.env.SOURCE_COMMIT }
			: undefined,
	sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
	errorHandler: (e) =>
		console.warn("[sentry] sourcemap upload failed (non-fatal):", e),
});
