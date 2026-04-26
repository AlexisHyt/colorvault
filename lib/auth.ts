import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { jsx } from "react/jsx-runtime";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { baseEmail, resend } from "@/lib/emails/resend.config";
import EmailActivation from "@/lib/emails/templates/EmailActivation";
import EmailResetPassword from "@/lib/emails/templates/EmailResetPassword";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	secret: process.env.BETTER_AUTH_SECRET!,
	baseURL: process.env.BETTER_AUTH_URL!,
	plugins: [
		admin({
			defaultRole: "user",
		}),
	],
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url, token }, request) => {
			await resend.emails.send({
				from: baseEmail,
				replyTo: baseEmail,
				to: user.email,
				subject: "Reset your password",
				text: `Click on the link to reset your password: ${url}`,
				// react: jsx(EmailResetPassword, { url }),
			});
		},
		onExistingUserSignUp: async ({ user }, request) => {
			await resend.emails.send({
				from: baseEmail,
				replyTo: baseEmail,
				to: user.email,
				subject: "Sign-up attempt with your email",
				text: "Someone tried to create an account using your email address. If this was you, try signing in instead. If not, you can safely ignore this email.",
				// react: jsx(EmailActivation, { url }),
			});
		},
	},
	emailVerification: {
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({ user, url }) => {
			await resend.emails.send({
				from: baseEmail,
				replyTo: baseEmail,
				to: user.email,
				subject: "Verify your email address",
				text: `Click on the link to verify your email: ${url}`,
				// react: jsx(EmailActivation, { url }),
			});
		},
	},
	rateLimit: {
		window: 10, // time window in seconds
		max: 100, // max requests in the window
	},
});
