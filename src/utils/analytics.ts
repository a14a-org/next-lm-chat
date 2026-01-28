interface AnalyticsEvent {
	name: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data?: Record<string, any>;
}

// Type declaration for umami window object
declare global {
	interface Window {
		umami?: {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			track: (event: string, data?: Record<string, any>) => void;
		};
	}
}

// Helper function to track events
export const trackEvent = ({ name, data }: AnalyticsEvent) => {
	try {
		if (typeof window !== "undefined" && window.umami) {
			window.umami.track(name, data);
		}
	} catch (error) {
		console.error("Error tracking event:", error);
	}
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const trackSettingsChanged = (setting: string, value: any) => {
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
