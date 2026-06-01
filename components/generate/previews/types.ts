export type PreviewTemplateId =
	| "landing-page"
	| "saas-dashboard"
	| "form"
	| "pricing-cards"
	| "mobile-app"
	| "blog"
	| "ecommerce-product-card";

export type PreviewTemplateOption = {
	id: PreviewTemplateId;
	label: string;
};

export const PREVIEW_TEMPLATE_OPTIONS: PreviewTemplateOption[] = [
	{ id: "landing-page", label: "Landing page" },
	{ id: "saas-dashboard", label: "Dashboard SaaS" },
	{ id: "form", label: "Formulaire" },
	{ id: "pricing-cards", label: "Pricing cards" },
	{ id: "mobile-app", label: "Mobile app" },
	{ id: "blog", label: "Blog" },
	{ id: "ecommerce-product-card", label: "Product card e-commerce" },
];

export type PreviewTheme = {
	primary: string;
	secondary: string;
	accent: string;
	neutral: string;
	textOnPrimary: string;
	textOnSecondary: string;
	textOnAccent: string;
	textOnNeutral: string;
	bgPage: string;
	cardBg: string;
	textBody: string;
	textMuted: string;
	borderSoft: string;
};

export type PreviewTemplateProps = {
	theme: PreviewTheme;
};
