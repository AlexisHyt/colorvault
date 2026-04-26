type AuthErrorLike = {
	code?: string;
	message?: string;
	status?: number;
};

const ERROR_MESSAGES_BY_CODE: Record<string, string> = {
	EMAIL_NOT_VERIFIED:
		"Please verify your email before signing in. Check your inbox.",
	VERIFICATION_EMAIL_EXPIRED:
		"Your verification link expired. Please request a new one.",
	INVALID_EMAIL_OR_PASSWORD: "Invalid email or password.",
	USER_NOT_FOUND: "Invalid email or password.",
	INVALID_CREDENTIALS: "Invalid email or password.",
	TOO_MANY_REQUESTS: "Too many attempts. Please wait a moment and try again.",
};

export function mapAuthErrorToMessage(
	error: unknown,
	fallbackMessage = "Something went wrong. Please try again.",
): string {
	if (!error || typeof error !== "object") {
		return fallbackMessage;
	}

	const { code, message, status } = error as AuthErrorLike;
	const normalizedCode = code?.toUpperCase();

	if (normalizedCode && ERROR_MESSAGES_BY_CODE[normalizedCode]) {
		return ERROR_MESSAGES_BY_CODE[normalizedCode];
	}

	if (status === 429) {
		return ERROR_MESSAGES_BY_CODE.TOO_MANY_REQUESTS;
	}

	if (typeof message === "string" && message.length > 0) {
		return message;
	}

	return fallbackMessage;
}
