import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reviewDir = path.resolve(__dirname, '..');

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9240;
const TEMP_PROFILE = path.join(reviewDir, '.temp_console_audit_profile');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function runConsoleAudit() {
    console.log("=== STARTING STANDALONE CONSOLE AUDIT WITH PERMANENT LISTENERS ===");

    if (fs.existsSync(TEMP_PROFILE)) {
        try { fs.rmSync(TEMP_PROFILE, { recursive: true, force: true }); } catch (_) {}
    }
    fs.mkdirSync(TEMP_PROFILE, { recursive: true });

    const chromeProcess = spawn(CHROME_PATH, [
        `--remote-debugging-port=${PORT}`,
        `--user-data-dir=${TEMP_PROFILE}`,
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        'about:blank'
    ]);

    await sleep(2500);

    let idSeq = 1;
    async function createTabClient() {
        const res = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' });
        const tab = await res.json();
        const ws = new WebSocket(tab.webSocketDebuggerUrl);
        await new Promise(r => ws.onopen = r);

        function send(method, params = {}) {
            return new Promise((resolve, reject) => {
                const id = idSeq++;
                const handler = (evt) => {
                    const data = JSON.parse(evt.data);
                    if (data.id === id) {
                        ws.removeEventListener('message', handler);
                        if (data.error) reject(new Error(data.error.message));
                        else resolve(data.result);
                    }
                };
                ws.addEventListener('message', handler);
                ws.send(JSON.stringify({ id, method, params }));
            });
        }

        return { ws, send, tabId: tab.id };
    }

    try {
        // STEP 1: INDEPENDENT CANARY VERIFICATION ON ISOLATED PAGE
        console.log("\n[Step 1] Running isolated canary verification on about:blank...");
        const canaryClient = await createTabClient();
        let canaryWarningCaptured = false;
        let canaryErrorCaptured = false;

        canaryClient.ws.addEventListener('message', (evt) => {
            const data = JSON.parse(evt.data);
            if (data.method === "Runtime.consoleAPICalled") {
                const args = data.params?.args || [];
                const txt = args.map(a => a.value || '').join(' ');
                if (txt.includes('__TEST_CANARY_WARNING__')) canaryWarningCaptured = true;
                if (txt.includes('__TEST_CANARY_ERROR__')) canaryErrorCaptured = true;
            }
        });

        await canaryClient.send("Page.enable");
        await canaryClient.send("Runtime.enable");
        await canaryClient.send("Log.enable");

        // Dispatch test messages in isolated context
        await canaryClient.send("Runtime.evaluate", {
            expression: `console.warn("__TEST_CANARY_WARNING__"); console.error("__TEST_CANARY_ERROR__");`
        });
        await sleep(500);

        const canaryPassed = canaryWarningCaptured && canaryErrorCaptured;
        console.log(`Canary verification: ${canaryPassed ? 'PASSED (listeners verified active)' : 'FAILED'}`);
        canaryClient.ws.close();

        const canaryRecord = {
            executedAt: new Date().toISOString(),
            isolatedTarget: "about:blank",
            capturedWarning: canaryWarningCaptured,
            capturedError: canaryErrorCaptured,
            passed: canaryPassed
        };

        // STEP 2: AUDIT 11 PAGES ACROSS 2 VIEWPORTS (22 TOTAL RUNS)
        const pages = [
            { name: "home", url: "http://capability-test.local/" },
            { name: "shop", url: "http://capability-test.local/shop/" },
            { name: "category_men", url: "http://capability-test.local/product-category/men/" },
            { name: "category_kids", url: "http://capability-test.local/product-category/kids/" },
            { name: "product_simple", url: "http://capability-test.local/?p=44" },
            { name: "product_variable", url: "http://capability-test.local/?p=141" },
            { name: "cart", url: "http://capability-test.local/cart/" },
            { name: "checkout", url: "http://capability-test.local/checkout/" },
            { name: "my_account_logged_out", url: "http://capability-test.local/my-account/" },
            { name: "lost_password", url: "http://capability-test.local/my-account/lost-password/" },
            { name: "search_results", url: "http://capability-test.local/?s=%D9%82%D9%85%D9%8A%D8%B5&post_type=product" }
        ];

        const viewports = [
            { name: "375", width: 375, height: 812, mobile: true },
            { name: "1440", width: 1440, height: 900, mobile: false }
        ];

        const auditRecords = [];
        let totalErrors = 0;
        let totalWarnings = 0;
        let totalExceptions = 0;

        for (const p of pages) {
            for (const vp of viewports) {
                const runKey = `${p.name}_${vp.name}`;
                console.log(`Auditing [${runKey}] -> ${p.url} (${vp.width}x${vp.height})...`);

                const client = await createTabClient();
                const runExceptions = [];
                const runCalls = [];

                // PERMANENT LISTENERS ATTACHED BEFORE ANY NAVIGATION
                client.ws.addEventListener('message', (evt) => {
                    const data = JSON.parse(evt.data);
                    if (data.method === "Runtime.exceptionThrown") {
                        const ex = data.params?.exceptionDetails;
                        runExceptions.push({
                            text: ex?.text || 'Exception',
                            url: ex?.url || '',
                            lineNumber: ex?.lineNumber || 0,
                            columnNumber: ex?.columnNumber || 0
                        });
                    }
                    if (data.method === "Runtime.consoleAPICalled") {
                        const type = data.params?.type;
                        const args = (data.params?.args || []).map(a => a.value ?? a.description ?? '').join(' ');
                        runCalls.push({ type, message: args });
                    }
                    if (data.method === "Log.entryAdded") {
                        const entry = data.params?.entry;
                        if (entry?.level === 'error' || entry?.level === 'warning') {
                            runCalls.push({ type: entry.level, message: entry.text });
                        }
                    }
                });

                await client.send("Page.enable");
                await client.send("Runtime.enable");
                await client.send("Log.enable");

                // Set device metrics BEFORE navigation
                await client.send("Emulation.setDeviceMetricsOverride", {
                    width: vp.width,
                    height: vp.height,
                    deviceScaleFactor: 1,
                    mobile: vp.mobile
                });

                let status = "OK";
                let finalUrl = p.url;

                try {
                    await client.send("Page.navigate", { url: p.url });
                    await sleep(3500);

                    const urlEval = await client.send("Runtime.evaluate", {
                        expression: "window.location.href",
                        returnByValue: true
                    });
                    finalUrl = urlEval.result?.value || p.url;
                } catch (navErr) {
                    status = `NAVIGATION_FAILED: ${navErr.message}`;
                }

                client.ws.close();

                const errorsInRun = runExceptions.length + runCalls.filter(c => c.type === 'error').length;
                const warningsInRun = runCalls.filter(c => c.type === 'warning').length;

                totalExceptions += runExceptions.length;
                totalErrors += errorsInRun;
                totalWarnings += warningsInRun;

                auditRecords.push({
                    runKey,
                    pageName: p.name,
                    requestedUrl: p.url,
                    finalUrl,
                    viewport: { width: vp.width, height: vp.height, mobile: vp.mobile },
                    status,
                    timestamp: new Date().toISOString(),
                    errorCount: errorsInRun,
                    warningCount: warningsInRun,
                    unhandledExceptions: runExceptions,
                    calls: runCalls
                });
            }
        }

        const auditReport = {
            runMetadata: {
                script: "review/madar-v216/scripts/audit_console.mjs",
                timestamp: new Date().toISOString(),
                environment: "capability-test.local",
                methodology: "CDP permanent listeners attached before Emulation and Page.navigate",
                totalRuns: auditRecords.length,
                expectedRuns: 22,
                allRunsSuccessful: auditRecords.every(r => r.status === "OK")
            },
            canaryVerification: canaryRecord,
            summary: {
                totalRuns: auditRecords.length,
                totalUnhandledExceptions: totalExceptions,
                totalErrors,
                totalWarnings,
                overallStatus: (totalErrors === 0 && auditRecords.length === 22 && auditRecords.every(r => r.status === "OK")) ? "CLEAN" : "ISSUES_FOUND"
            },
            runs: auditRecords
        };

        const outPath = path.join(reviewDir, "console_audit_log.json");
        fs.writeFileSync(outPath, JSON.stringify(auditReport, null, 2), "utf8");
        console.log(`\nSaved structured console audit log: ${outPath}`);
        console.log(`Summary: ${auditRecords.length} runs, ${totalExceptions} exceptions, ${totalErrors} errors, ${totalWarnings} warnings.`);

        return auditReport;

    } finally {
        chromeProcess.kill();
        for (let i = 0; i < 6; i++) {
            await sleep(500);
            try {
                if (fs.existsSync(TEMP_PROFILE)) {
                    fs.rmSync(TEMP_PROFILE, { recursive: true, force: true });
                }
                break;
            } catch (_) {}
        }
    }
}

runConsoleAudit().catch(err => {
    console.error("Fatal console audit error:", err);
    process.exitCode = 1;
});
