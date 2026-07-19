interface AnalyticsEvent {
	name: string;
	data?: Record<string, unknown>;
}

type AnalyticsClient = {
	track: (event: string, data?: Record<string, unknown>) => unknown;
};

type AnalyticsProvider = "umami" | "chili";
type ProviderStatus = "pending" | "ready" | "failed";
type PendingEvent = {
	event: AnalyticsEvent;
	deliveredProviders: Set<AnalyticsProvider>;
	deliveredClients: Set<AnalyticsClient>;
};

const providerStatus: Record<AnalyticsProvider, ProviderStatus> = {
	umami: "pending",
	chili: "pending",
};
const pendingEvents: PendingEvent[] = [];
const MAX_PENDING_EVENTS = 100;

declare global {
	interface Window {
		umami?: AnalyticsClient;
		chili?: AnalyticsClient;
	}
}

const analyticsClients = (): Record<
	AnalyticsProvider,
	AnalyticsClient | undefined
> => ({
	umami: window.umami,
	chili: window.chili,
});

const deliver = (pending: PendingEvent) => {
	const clients = analyticsClients();
	let hasPendingProvider = false;
	for (const provider of ["umami", "chili"] as const) {
		if (
			pending.deliveredProviders.has(provider) ||
			providerStatus[provider] === "failed"
		) {
			continue;
		}
		if (providerStatus[provider] === "pending") {
			hasPendingProvider = true;
			continue;
		}
		const client = clients[provider];
		if (!client?.track) {
			hasPendingProvider = true;
			continue;
		}
		if (pending.deliveredClients.has(client)) {
			pending.deliveredProviders.add(provider);
			continue;
		}
		try {
			const result = client.track(pending.event.name, pending.event.data);
			if (
				result &&
				typeof result === "object" &&
				"catch" in result &&
				typeof result.catch === "function"
			) {
				void result.catch(() => undefined);
			}
		} catch {
			// Analytics must never interrupt the chat flow.
		}
		pending.deliveredClients.add(client);
		pending.deliveredProviders.add(provider);
	}
	return !hasPendingProvider;
};

export const flushAnalyticsQueue = () => {
	if (typeof window === "undefined") return;
	while (pendingEvents.length > 0) {
		if (!deliver(pendingEvents[0])) return;
		pendingEvents.shift();
	}
};

export const settleAnalyticsProvider = (
	provider: AnalyticsProvider,
	status: ProviderStatus,
) => {
	providerStatus[provider] = status;
	flushAnalyticsQueue();
};

export const trackEvent = (event: AnalyticsEvent) => {
	if (typeof window === "undefined") return;
	const pending = {
		event,
		deliveredProviders: new Set<AnalyticsProvider>(),
		deliveredClients: new Set<AnalyticsClient>(),
	};
	if (deliver(pending)) return;
	if (pendingEvents.length === MAX_PENDING_EVENTS) pendingEvents.shift();
	pendingEvents.push(pending);
};

// Message events
export const trackMessageSent = (model: string, hasImage: boolean = false) => {
	trackEvent({
		name: "message_sent",
		data: {
			model,
			has_image: hasImage,
		},
	});
};

// Image events
export const trackImageGenerated = (model: string, prompt: string) => {
	trackEvent({
		name: "image_generated",
		data: {
			model,
			prompt_length: prompt.length,
		},
	});
};

export const trackImageUploaded = () => {
	trackEvent({ name: "image_uploaded" });
};

// Settings events
export const trackSettingsOpened = () => {
	trackEvent({ name: "settings_opened" });
};

export const trackSettingsChanged = (setting: string, value: unknown) => {
	trackEvent({
		name: "settings_changed",
		data: {
			setting,
			value: typeof value === "object" ? JSON.stringify(value) : value,
		},
	});
};

// Model events
export const trackModelChanged = (model: string) => {
	trackEvent({
		name: "model_changed",
		data: { model },
	});
};

// Theme events
export const trackThemeChanged = (theme: "light" | "dark") => {
	trackEvent({
		name: "theme_changed",
		data: { theme },
	});
};
