import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClipboard } from "@/hooks/use-clipboard";

export function CodeBlock({ code }: { code: string }) {
	const { copied, copyToClipboard } = useClipboard();

	const copy = () => {
		copyToClipboard(code);
	};

	return (
		<div className="relative">
			<pre className="bg-slate-950 rounded-lg p-4 overflow-auto max-h-80 text-xs font-mono text-slate-300 border border-slate-700">
				<code>{code}</code>
			</pre>
			<Button
				size="sm"
				variant="outline"
				className="absolute top-2 right-2 h-7 px-2 text-xs"
				onClick={copy}
			>
				{copied ? (
					<Check className="w-3 h-3 mr-1" />
				) : (
					<Copy className="w-3 h-3 mr-1" />
				)}
				{copied ? "Copied!" : "Copy"}
			</Button>
		</div>
	);
}
