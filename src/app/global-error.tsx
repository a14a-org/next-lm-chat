"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<html lang="en">
			<body
				style={{
					margin: 0,
					minHeight: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: "#0a0a0a",
					color: "#ededed",
					fontFamily:
						"system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
					padding: "1.5rem",
				}}
			>
				<div style={{ maxWidth: "28rem", textAlign: "center" }}>
					<h1
						style={{
							fontSize: "1.5rem",
							fontWeight: 600,
							marginBottom: "0.75rem",
						}}
					>
						Something went wrong
					</h1>
					<p
						style={{
							fontSize: "0.95rem",
							color: "#a1a1a1",
							marginBottom: "1.5rem",
							lineHeight: 1.5,
						}}
					>
						An unexpected error occurred. The issue has been reported and we are
						looking into it.
					</p>
					<button
						type="button"
						onClick={() => reset()}
						style={{
							cursor: "pointer",
							border: "none",
							borderRadius: "0.5rem",
							padding: "0.625rem 1.25rem",
							fontSize: "0.95rem",
							fontWeight: 500,
							backgroundColor: "#ededed",
							color: "#0a0a0a",
						}}
					>
						Try again
					</button>
				</div>
			</body>
		</html>
	);
}
