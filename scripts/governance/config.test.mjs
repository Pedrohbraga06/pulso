import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const agentsRoot = path.join(repositoryRoot, '.agents', 'agents');
const expectedAgents = [
  'ai-ml-engineer',
  'application-security-engineer',
  'backend-developer',
  'business-analyst',
  'data-engineer',
  'database-engineer',
  'devops-sre-engineer',
  'engineering-manager',
  'frontend-developer',
  'product-manager',
  'product-owner',
  'qa-engineer',
  'software-architect',
  'ux-ui-designer',
];
const requiredHeadings = [
  'Professional profile',
  'Required knowledge and reading',
  'File ownership',
  'Decision rights and human gates',
  'Inputs and deliverables',
  'Quality and rejection criteria',
  'Interactions',
  'Report format',
];
const linkedDocuments = [
  'AGENTS.md',
  'docs/agents/README.md',
  'docs/agents/CHANGELOG.md',
  'docs/agents/founder-cto-charter.md',
  'docs/agents/definition-of-ready.md',
  'docs/agents/definition-of-done.md',
  'docs/agents/test-strategy.md',
  'docs/agents/sprint-plan-template.md',
  'docs/agents/code-review-template.md',
  'docs/agents/delivery-report-template.md',
  'docs/product/README.md',
  'docs/product/prd-template.md',
  'docs/product/roadmap-template.md',
  'docs/security/engineering-security-policy.md',
];

function readAgent(name) {
  return readFileSync(path.join(agentsRoot, name, 'agent.md'), 'utf8');
}

function invokeApprovalHook(toolName, args) {
  const hookPath = path.join(
    repositoryRoot,
    '.agents',
    'hooks',
    'pre-tool-approval.mjs',
  );
  const result = spawnSync(process.execPath, [hookPath], {
    input: JSON.stringify({ toolCall: { name: toolName, args } }),
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test('all requested AI roles use the Antigravity CLI agent folder format', () => {
  const directories = readdirSync(agentsRoot)
    .filter((name) => statSync(path.join(agentsRoot, name)).isDirectory())
    .sort();
  assert.deepEqual(directories, expectedAgents);

  for (const name of expectedAgents) {
    const profile = readAgent(name);
    const frontmatter = profile.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    assert.ok(frontmatter, `${name}: missing YAML frontmatter`);
    assert.match(frontmatter[1], new RegExp(`^name: ${name}$`, 'm'));
    assert.match(frontmatter[1], /^description: .+$/m);
    assert.match(frontmatter[1], /^tools:\r?\n(?:\s+- .+\r?\n)+/m);
    assert.match(frontmatter[1], /^mainAgent: (true|false)$/m);
    assert.match(frontmatter[1], /^subagent: (true|false)$/m);
    assert.match(frontmatter[1], /^model: (inherit|flash|pro)$/m);
    assert.match(frontmatter[1], /^commandExecutionPolicy: (off|auto|eager|sandbox)$/m);

    for (const heading of requiredHeadings) {
      const sectionStart = profile.indexOf(`## ${heading}`);
      assert.notEqual(sectionStart, -1, `${name}: missing ${heading}`);
      const contentStart = profile.indexOf('\n', sectionStart) + 1;
      const nextSection = profile.indexOf('\n## ', contentStart);
      const section = profile
        .slice(contentStart, nextSection === -1 ? profile.length : nextSection)
        .trim();
      assert.ok(section.length > 20, `${name}: empty or incomplete ${heading}`);
    }
    assert.match(profile, /^# Mission(?: and responsibilities)?\b|^## Mission and responsibilities\b/m);

    for (const [, skillPath] of frontmatter[1].matchAll(/^\s+- (skills\/[^\s]+)$/gm)) {
      assert.ok(
        existsSync(path.join(repositoryRoot, '.agents', skillPath, 'SKILL.md')),
        `${name}: missing skill ${skillPath}`,
      );
    }
  }
});

test('all workspace rules declare supported Antigravity triggers', () => {
  const rulesRoot = path.join(repositoryRoot, '.agents', 'rules');
  const ruleFiles = readdirSync(rulesRoot).filter((name) => name.endsWith('.md'));
  assert.ok(ruleFiles.length > 0);

  for (const filename of ruleFiles) {
    const rule = readFileSync(path.join(rulesRoot, filename), 'utf8');
    const frontmatter = rule.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    assert.ok(frontmatter, `${filename}: missing YAML frontmatter`);
    assert.match(frontmatter[1], /^trigger: (always_on|model_decision|glob|manual)$/m);
    if (/^trigger: model_decision$/m.test(frontmatter[1])) {
      assert.match(frontmatter[1], /^description: .+$/m);
    }
    if (/^trigger: glob$/m.test(frontmatter[1])) {
      assert.match(frontmatter[1], /^globs?: .+$/m);
    }
  }
});

test('organizational documentation has no broken local Markdown links', () => {
  for (const filename of linkedDocuments) {
    const markdown = readFileSync(path.join(repositoryRoot, filename), 'utf8');
    const links = markdown.matchAll(/\[[^\]]+\]\(([^)]+)\)/g);

    for (const [, href] of links) {
      if (/^(?:https?:|mailto:|#)/i.test(href)) continue;
      const target = href.split('#', 1)[0];
      assert.ok(
        existsSync(path.resolve(repositoryRoot, path.dirname(filename), target)),
        `${filename}: broken link ${href}`,
      );
    }
  }
});

test('approval hook requires a human for every shell command', () => {
  assert.equal(
    invokeApprovalHook('run_command', {
      CommandLine: 'pnpm --filter api db:migrate',
    }).decision,
    'force_ask',
  );
  assert.equal(
    invokeApprovalHook('run_command', {
      CommandLine: 'pnpm typecheck',
    }).decision,
    'force_ask',
  );
  assert.equal(
    invokeApprovalHook('run_command', {
      CommandLine: "node -e \"require('child_process').execFileSync('prisma',['migrate','reset'])\"",
    }).decision,
    'force_ask',
  );
});

test('approval hook requires a human for migration and Prisma schema edits', () => {
  assert.equal(
    invokeApprovalHook('write_to_file', {
      TargetFile: '/repo/apps/api/prisma/migrations/next/migration.sql',
    }).decision,
    'force_ask',
  );
  assert.equal(
    invokeApprovalHook('write_to_file', {
      TargetFile: '/repo/apps/api/prisma/schema.prisma',
    }).decision,
    'force_ask',
  );
});

test('approval hook protects local secrets and allows safe examples', () => {
  assert.equal(
    invokeApprovalHook('write_to_file', {
      TargetFile: '/repo/apps/api/.env',
    }).decision,
    'force_ask',
  );
  assert.equal(
    invokeApprovalHook('write_to_file', {
      TargetFile: '/repo/apps/api/.env.example',
    }).decision,
    'allow',
  );
});

test('approval hook fails closed when it cannot parse input', () => {
  const hookPath = path.join(
    repositoryRoot,
    '.agents',
    'hooks',
    'pre-tool-approval.mjs',
  );
  const result = spawnSync(process.execPath, [hookPath], {
    input: 'not-json',
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).decision, 'force_ask');
});
