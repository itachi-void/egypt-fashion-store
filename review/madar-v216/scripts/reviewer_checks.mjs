// Read-only checks of committed evidence; never launches Chrome or contacts the store.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const reviewDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(reviewDir, '../..');
const read = name => fs.readFileSync(path.join(reviewDir, name), 'utf8');
const results = JSON.parse(read('test_results.json'));
const audit = JSON.parse(read('console_audit_log.json'));
const functional = read('scripts/run_functional_tests.mjs');
const collector = read('scripts/audit_console.mjs');
const report = read('report.md');
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const evidenceCommit = git('log', '-1', '--format=%H', '--', 'review/madar-v216/test_results.json');

function exactBlock(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert(start >= 0 && end > start, 'Source decision block not found');
  return source.slice(start, end);
}

const decision = exactBlock(
  functional,
  '            const expectedRuns = 22;',
  '            testResults.push({',
);
function evaluateConsoleFixture(log) {
  const context = { auditLog: log, fileValid: true, hasFailure: false };
  vm.runInNewContext(
    decision + '\nglobalThis.observed = { status: test10Status, hasFailure };',
    context,
    { timeout: 1000 },
  );
  return { ...context.observed };
}

const fixtures = {
  missing_summary_and_run_fields: {
    runs: Array.from({ length: 22 }, () => ({ status: 'OK' })),
    canaryVerification: { passed: true },
  },
  repeated_same_scene: {
    runs: Array.from({ length: 22 }, () => ({ runKey: 'home_375', status: 'OK' })),
    canaryVerification: { passed: true },
    summary: { totalErrors: 0, totalUnhandledExceptions: 0 },
  },
  raw_errors_with_zero_summary: {
    runs: Array.from({ length: 22 }, (_, i) => ({
      runKey: `scene_${i}`,
      status: 'OK',
      errorCount: 1,
      unhandledExceptions: [{ text: 'synthetic exception; not a site observation' }],
      calls: [{ type: 'error', message: 'synthetic console error' }],
    })),
    canaryVerification: { passed: true },
    summary: { totalErrors: 0, totalUnhandledExceptions: 0 },
  },
};
const counterexamples = Object.entries(fixtures).map(([name, log]) => ({
  name,
  observed: evaluateConsoleFixture(log),
  requiredClassification: 'NOT TESTED / observation error; never PASS',
}));
for (const example of counterexamples) {
  assert.equal(example.observed.status, 'PASS', 'Reassess notes: predicate changed');
}

const navigation = exactBlock(
  collector,
  '                let status = "OK";',
  '                client.ws.close();',
);
const navContext = {
  p: { url: 'http://capability-test.local/checkout/' },
  sleep: async () => {},
  client: {
    send: async method => method === 'Page.navigate'
      ? { errorText: 'net::ERR_CONNECTION_REFUSED' }
      : { result: { value: 'chrome-error://chromewebdata/' } },
  },
};
const navigationCounterexample = await vm.runInNewContext(
  '(async () => {' + navigation + '\nreturn { status, finalUrl }; })()',
  navContext,
  { timeout: 1000 },
);
assert.equal(navigationCounterexample.status, 'OK', 'Reassess notes: navigation validation changed');

const hashes = new Map();
for (const name of fs.readdirSync(path.join(reviewDir, 'screenshots')).sort()) {
  if (!name.endsWith('.png')) continue;
  const sha = createHash('sha256')
    .update(fs.readFileSync(path.join(reviewDir, 'screenshots', name))).digest('hex');
  if (!hashes.has(sha)) hashes.set(sha, []);
  hashes.get(sha).push(name);
}
const duplicateGroups = [...hashes].filter(([, names]) => names.length > 1)
  .map(([sha256, files]) => ({ sha256, files }));
const scopeDiff = git('diff', '--name-only', evidenceCommit + '^', evidenceCommit);
assert(scopeDiff.split('\n').every(name => name.startsWith('review/madar-v216/')));
assert.equal(git('diff', 'a6e7f4c', evidenceCommit, '--', 'themes/', 'plugins/'), '');

const output = {
  purpose: 'Independent static evidence review and isolated synthetic predicate checks',
  evidenceCommit,
  command: 'node review/madar-v216/scripts/reviewer_checks.mjs',
  noStoreRequests: true,
  noBrowserExecution: true,
  originalRawResultsUnmodified: true,
  rawStatusCounts: results.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {}),
  test01: {
    rawActual: results.find(item => item.testId === 'TEST-01').actual,
    reportSummary: report.split('\n').find(line => line.includes('**TEST-01:**')),
  },
  consoleAudit: {
    runMetadata: audit.runMetadata,
    uniqueRunKeys: new Set(audit.runs.map(run => run.runKey)).size,
    checkoutRuns: audit.runs.filter(run => run.pageName === 'checkout')
      .map(({ runKey, requestedUrl, finalUrl, status }) => ({ runKey, requestedUrl, finalUrl, status })),
    canary: audit.canaryVerification,
  },
  syntheticCounterexamples: counterexamples,
  syntheticNavigationCounterexample: {
    returnedByMock: { errorText: 'net::ERR_CONNECTION_REFUSED' },
    observed: { ...navigationCounterexample },
  },
  screenshotSha256DuplicateGroups: duplicateGroups,
  evidenceCommitChangedFiles: scopeDiff.split('\n'),
  themePluginDiffFromA6e7f4c: 'empty',
  interpretation: 'Exit 0 means reviewer checks completed, NOT that storefront tests passed.',
};
process.stdout.write(JSON.stringify(output, null, 2) + '\n');
