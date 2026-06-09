// Refresh the VENDORED CLI docs in this repo from the CipherRadar product repo.
//
// This docs site is self-contained: the CLI guide pages under
// src/content/docs/guides/cli/ are COMMITTED here (vendored), so the site builds and
// deploys with no dependency on the product repo's location.
//
// Run this script ON DEMAND when the canonical CLI docs change in the product repo:
//
//   CRADAR_REPO=/path/to/cipherradar npm run refresh
//
// It reads docs/guides/cli/*.md from the product repo, injects Starlight frontmatter,
// rewrites links, and overwrites the vendored copies here. Then commit the result.
// The canonical source remains the product repo; this is a periodic copy, not a live link.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = process.env.CRADAR_REPO || '/home/nk-sentinel/projects/cradarCLIImprovements';
const SRC_DIR = join(REPO_ROOT, 'docs', 'guides', 'cli');
const OUT_DIR = join(here, '..', 'src', 'content', 'docs', 'guides', 'cli');
const REPO = 'https://github.com/nk-sentinel/cipherradar';

// Canonical page set. Only user-facing CLI docs are published (no internal ADRs/design).
const PAGES = [
	{ src: 'README.md', slug: 'overview', title: 'CLI Overview', order: 1,
	  description: 'What cradar does, how to install it, and a 60-second quick start.' },
	{ src: 'commands.md', slug: 'commands', title: 'Command Reference', order: 2,
	  description: 'Every cradar subcommand and flag, with examples.' },
	{ src: 'configuration.md', slug: 'configuration', title: 'Configuration', order: 3,
	  description: 'The .cradar.yml and policy.cradar.yml schemas, annotated.' },
	{ src: 'output-formats.md', slug: 'output-formats', title: 'Output Formats', order: 4,
	  description: 'The output writers, extension dispatch, and TTY-aware defaults.' },
	{ src: 'cbom-schema-reference.md', slug: 'cbom-schema-reference', title: 'CBOM Output Schema Reference', order: 5,
	  description: 'component.type and cryptoProperties.assetType values, per-field enums, and which fields need action.' },
	{ src: 'exit-codes.md', slug: 'exit-codes', title: 'Exit Codes', order: 6,
	  description: 'The exit-code contract for CI pipelines.' },
	{ src: 'workflows.md', slug: 'workflows', title: 'Workflows', order: 7,
	  description: 'Common recipes — CI gate, baseline, container scan, push, hooks.' },
];

// filename.md -> published site route
const slugByFile = Object.fromEntries(PAGES.map((p) => [p.src, `/guides/cli/${p.slug}/`]));

function rewriteLinks(body) {
	return body.replace(/\]\(([^)]+)\)/g, (whole, target) => {
		if (/^(https?:)?\/\//.test(target) || target.startsWith('#') || target.startsWith('mailto:')) {
			return whole;
		}
		const decision = target.match(/decisions\/([^)#]+)/);
		if (decision) {
			return `](${REPO}/blob/main/docs/decisions/${decision[1]})`;
		}
		const sibling = target.match(/^([\w.-]+)\.md(#.+)?$/);
		if (sibling && slugByFile[`${sibling[1]}.md`]) {
			return `](${slugByFile[`${sibling[1]}.md`]}${sibling[2] ?? ''})`;
		}
		if (target.startsWith('../') || target.startsWith('./') || target.endsWith('.md')) {
			const clean = target.replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');
			return `](${REPO}/blob/main/docs/${clean})`;
		}
		return whole;
	});
}

const stripLeadingH1 = (body) => body.replace(/^\s*#\s+.+\n+/, '');
const yamlEscape = (s) => `"${s.replace(/"/g, '\\"')}"`;

async function main() {
	console.log(`refresh: reading CLI docs from ${SRC_DIR}`);
	await mkdir(OUT_DIR, { recursive: true });
	for (const page of PAGES) {
		let raw;
		try {
			raw = await readFile(join(SRC_DIR, page.src), 'utf8');
		} catch {
			console.error(`\n✗ Could not read ${join(SRC_DIR, page.src)}.`);
			console.error(`  Set CRADAR_REPO to the product repo checkout, e.g.:`);
			console.error(`  CRADAR_REPO=/path/to/cipherradar npm run refresh\n`);
			process.exit(1);
		}
		const body = rewriteLinks(stripLeadingH1(raw));
		const frontmatter = [
			'---',
			`title: ${yamlEscape(page.title)}`,
			`description: ${yamlEscape(page.description)}`,
			'sidebar:',
			`  order: ${page.order}`,
			`editUrl: ${REPO}/edit/main/docs/guides/cli/${page.src}`,
			'---',
			'',
			`<!-- VENDORED from cipherradar:docs/guides/cli/${page.src} via scripts/refresh-content.mjs. Edit the source in the product repo, then re-run \`npm run refresh\`. -->`,
			'',
		].join('\n');
		await writeFile(join(OUT_DIR, `${page.slug}.md`), frontmatter + body, 'utf8');
		console.log(`  vendored ${page.src} -> guides/cli/${page.slug}.md`);
	}
	console.log(`\n${PAGES.length} pages refreshed. Review the diff and commit.`);
}

main().catch((err) => {
	console.error('refresh-content failed:', err);
	process.exit(1);
});
