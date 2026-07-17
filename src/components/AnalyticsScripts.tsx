"use client";

import Script from "next/script";
import { settleAnalyticsProvider } from "../utils/analytics";

export default function AnalyticsScripts() {
	return (
		<>
			<Script
				src="https://analytics.a14a.org/script.js"
				data-website-id="3ffe85b0-bad7-4843-a33e-a13ee2caa8ac"
				strategy="lazyOnload"
				onReady={() => settleAnalyticsProvider("umami", "ready")}
				onError={() => settleAnalyticsProvider("umami", "failed")}
			/>
			<Script
				src={
					process.env.NEXT_PUBLIC_CHILITRACK_SCRIPT_URL ||
					"https://ingest.chilitrack.com/script.js"
				}
				data-website-id={
					process.env.NEXT_PUBLIC_CHILITRACK_WEBSITE_ID ||
					"63d4f14a-c808-4ce9-885b-5ff9f27cb0b1"
				}
				data-chili-mode="side-by-side"
				data-domains="chat.a14a.org"
				strategy="lazyOnload"
				onReady={() => settleAnalyticsProvider("chili", "ready")}
				onError={() => settleAnalyticsProvider("chili", "failed")}
			/>
		</>
	);
}
