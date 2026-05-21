import { useState } from "react";

export function useClipboard() {
	const [copied, setCopied] = useState(false);

	const copyToClipboard = async (text: string): Promise<boolean> => {
		try {
			// Try modern Clipboard API first
			if (navigator.clipboard && window.isSecureContext) {
				await navigator.clipboard.writeText(text);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
				return true;
			} else {
				// Fallback for older browsers or non-secure contexts
				return fallbackCopyToClipboard(text);
			}
		} catch (error) {
			console.error("Clipboard copy failed:", error);
			// Try fallback if Clipboard API fails
			return fallbackCopyToClipboard(text);
		}
	};

	const fallbackCopyToClipboard = (text: string): boolean => {
		try {
			const textArea = document.createElement("textarea");
			textArea.value = text;
			textArea.style.position = "fixed";
			textArea.style.left = "-9999px";
			textArea.style.top = "-9999px";
			document.body.appendChild(textArea);

			textArea.focus();
			textArea.select();

			const successful = document.execCommand("copy");
			document.body.removeChild(textArea);

			if (successful) {
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
				return true;
			}
			return false;
		} catch (error) {
			console.error("Fallback clipboard copy failed:", error);
			return false;
		}
	};

	return { copied, copyToClipboard };
}
