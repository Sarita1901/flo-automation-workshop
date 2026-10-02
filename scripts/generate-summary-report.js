// Converts Playwright's JSON reporter output into a plain, static HTML
// summary report. Unlike the built-in Playwright HTML report (a JS-module
// SPA that needs to be served over HTTP), this file has no scripts or
// fetch calls, so it can be opened directly by double-clicking it.

const fs = require('fs');
const path = require('path');

const RESULTS_JSON = path.join(__dirname, '..', 'test-results', 'results.json');
const OUTPUT_HTML = path.join(__dirname, '..', 'test-results', 'summary.html');

function collectTests(suites, out) {
  for (const suite of suites || []) {
    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const result = test.results && test.results[0];
        out.push({
          title: spec.title,
          status: result ? result.status : 'unknown',
          durationMs: result ? result.duration : 0,
          error: result && result.error ? result.error.message : null,
        });
      }
    }
    // Suites can nest (e.g., describe blocks) - recurse into them.
    collectTests(suite.suites, out);
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildHtml(tests, generatedAt) {
  const passed = tests.filter((t) => t.status === 'passed').length;
  const failed = tests.filter((t) => t.status === 'failed' || t.status === 'timedOut').length;
  const total = tests.length;

  const rows = tests
    .map((t) => {
      const badgeClass = t.status === 'passed' ? 'badge-pass' : 'badge-fail';
      const badgeText = t.status === 'passed' ? 'PASSED' : 'FAILED';
      const errorRow = t.error
        ? `<tr class="error-row"><td colspan="3">${escapeHtml(t.error)}</td></tr>`
        : '';
      return `
      <tr>
        <td>${escapeHtml(t.title)}</td>
        <td><span class="${badgeClass}">${badgeText}</span></td>
        <td>${(t.durationMs / 1000).toFixed(2)}s</td>
      </tr>${errorRow}`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Test Summary Report</title>
<style>
  body { font-family: Arial, Helvetica, sans-serif; background: #f5f5f5; margin: 0; padding: 2rem; color: #222; }
  .report { max-width: 720px; margin: 0 auto; background: #fff; padding: 1.5rem 2rem; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
  h1 { font-size: 1.4rem; margin-top: 0; }
  .meta { color: #666; font-size: 0.85rem; margin-bottom: 1.5rem; }
  .totals { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
  .totals div { flex: 1; text-align: center; padding: 0.75rem; border-radius: 6px; font-weight: bold; }
  .total-total { background: #eef2ff; color: #3730a3; }
  .total-passed { background: #e7f8ee; color: #15803d; }
  .total-failed { background: #fdecea; color: #b91c1c; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 0.5rem 0.6rem; border-bottom: 1px solid #eee; font-size: 0.9rem; }
  th { background: #fafafa; }
  .badge-pass, .badge-fail { padding: 0.15rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: bold; }
  .badge-pass { background: #e7f8ee; color: #15803d; }
  .badge-fail { background: #fdecea; color: #b91c1c; }
  .error-row td { font-family: monospace; font-size: 0.8rem; color: #b91c1c; white-space: pre-wrap; background: #fff7f7; }
</style>
</head>
<body>
  <div class="report">
    <h1>Playwright Test Summary</h1>
    <p class="meta">Generated: ${escapeHtml(generatedAt)}</p>
    <div class="totals">
      <div class="total-total">Total: ${total}</div>
      <div class="total-passed">Passed: ${passed}</div>
      <div class="total-failed">Failed: ${failed}</div>
    </div>
    <table>
      <thead>
        <tr><th>Test</th><th>Status</th><th>Duration</th></tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  </div>
</body>
</html>
`;
}

function main() {
  if (!fs.existsSync(RESULTS_JSON)) {
    console.error(`Results file not found: ${RESULTS_JSON}`);
    console.error('Run "npx playwright test" first to generate it.');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(RESULTS_JSON, 'utf-8'));
  const tests = [];
  collectTests(raw.suites, tests);

  const html = buildHtml(tests, new Date().toLocaleString());
  fs.writeFileSync(OUTPUT_HTML, html, 'utf-8');
  console.log(`Summary report written to: ${OUTPUT_HTML}`);
}

main();
