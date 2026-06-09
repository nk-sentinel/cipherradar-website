// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Public site is served at the apex of cradar.shadow-lab.org (no base path).
export default defineConfig({
	site: 'https://cradar.shadow-lab.org',
	integrations: [
		starlight({
			title: 'CipherRadar',
			description:
				'Source-code-first Cryptography Bill of Materials (CBOM) platform. Discover every cryptographic asset, map it to compliance frameworks, and track post-quantum readiness — from one CLI.',
			logo: {
				src: './src/assets/cipherradar-logo.svg',
				alt: 'CipherRadar',
			},
			favicon: '/favicon.svg',
			customCss: ['./src/styles/brand.css'],
			social: [
				{
					icon: 'github',
					label: 'GitHub',
					href: 'https://github.com/nk-sentinel/cipherradar',
				},
			],
			lastUpdated: true,
			// Per-page edit links are injected by scripts/sync-docs.mjs (editUrl
			// frontmatter) so they point at the canonical source under docs/guides/cli/,
			// not at the generated copies. No global editLink base needed.
			tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
			sidebar: [
				{ label: 'Features', slug: 'features' },
				{
					label: 'CLI Guide',
					items: [
						{ label: 'Overview', slug: 'guides/cli/overview' },
						{ label: 'Command Reference', slug: 'guides/cli/commands' },
						{ label: 'Configuration', slug: 'guides/cli/configuration' },
						{ label: 'Output Formats', slug: 'guides/cli/output-formats' },
						{ label: 'CBOM Schema Reference', slug: 'guides/cli/cbom-schema-reference' },
						{ label: 'Exit Codes', slug: 'guides/cli/exit-codes' },
						{ label: 'Workflows', slug: 'guides/cli/workflows' },
					],
				},
			],
		}),
	],
});
