type EmailResetPasswordProps = {
	url: string;
};

export default function EmailResetPassword({ url }: EmailResetPasswordProps) {
	return (
		<div
			style={{
				backgroundColor: "#020617",
				padding: "32px 16px",
				fontFamily:
					"Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
				color: "#e2e8f0",
			}}
		>
			<div
				style={{
					maxWidth: "560px",
					margin: "0 auto",
					backgroundColor: "#0f172a",
					border: "1px solid #1e293b",
					borderRadius: "14px",
					overflow: "hidden",
				}}
			>
				<div
					style={{
						padding: "24px 24px 8px",
						textAlign: "center",
					}}
				>
					<div
						style={{
							display: "inline-block",
							padding: "6px 10px",
							borderRadius: "999px",
							backgroundColor: "#082f49",
							border: "1px solid #0e7490",
							color: "#67e8f9",
							fontSize: "12px",
							fontWeight: 600,
							letterSpacing: "0.04em",
							textTransform: "uppercase",
						}}
					>
						ColorVault
					</div>
					<h1
						style={{
							fontSize: "28px",
							lineHeight: "34px",
							margin: "16px 0 8px",
							color: "#f8fafc",
						}}
					>
						Reset your password
					</h1>
					<p
						style={{
							margin: 0,
							fontSize: "16px",
							lineHeight: "24px",
							color: "#94a3b8",
						}}
					>
						Click the button below to set a new password for your ColorVault
						account.
					</p>
				</div>

				<div style={{ padding: "24px", textAlign: "center" }}>
					<a
						href={url}
						style={{
							display: "inline-block",
							padding: "12px 20px",
							borderRadius: "10px",
							backgroundColor: "#2563eb",
							color: "#ffffff",
							fontSize: "15px",
							fontWeight: 600,
							textDecoration: "none",
						}}
					>
						Reset password
					</a>

					<p
						style={{
							margin: "20px 0 8px",
							fontSize: "13px",
							lineHeight: "20px",
							color: "#64748b",
						}}
					>
						If the button does not work, copy and paste this link:
					</p>
					<p style={{ margin: 0, fontSize: "13px", lineHeight: "20px" }}>
						<a
							href={url}
							style={{ color: "#38bdf8", textDecoration: "underline" }}
						>
							{url}
						</a>
					</p>

					<p
						style={{
							marginTop: "24px",
							fontSize: "13px",
							lineHeight: "20px",
							color: "#64748b",
						}}
					>
						If you did not request a password reset, you can safely ignore this
						email.
					</p>
				</div>
			</div>
		</div>
	);
}
