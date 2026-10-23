import assert from 'node:assert/strict';

export const EXPECTED_RUN_KEYS = [
    "home_375", "home_1440",
    "shop_375", "shop_1440",
    "category_men_375", "category_men_1440",
    "category_kids_375", "category_kids_1440",
    "product_simple_375", "product_simple_1440",
    "product_variable_375", "product_variable_1440",
    "cart_375", "cart_1440",
    "checkout_375", "checkout_1440",
    "my_account_logged_out_375", "my_account_logged_out_1440",
    "lost_password_375", "lost_password_1440",
    "search_results_375", "search_results_1440"
];

export function validateConsoleAuditLog(auditLog) {
    if (!auditLog || typeof auditLog !== 'object') {
        return { valid: false, status: "NOT TESTED", reason: "سجل الكونسول مفقود أو ليس كائناً صالحاً" };
    }
    const meta = auditLog.runMetadata;
    if (!meta || meta.totalRuns !== 22 || meta.expectedRuns !== 22 || meta.allRunsSuccessful !== true || !meta.timestamp) {
        return { valid: false, status: "NOT TESTED", reason: "بيانات وصف التشغيل (runMetadata) ناقصة أو غير مكتملة" };
    }
    const canary = auditLog.canaryVerification;
    if (!canary || canary.passed !== true || canary.capturedWarning !== true || canary.capturedError !== true) {
        return { valid: false, status: "FAIL", reason: "فشل التحقق المستقل من Canary على صفحة معزولة" };
    }
    const runs = auditLog.runs;
    if (!Array.isArray(runs) || runs.length !== 22) {
        return { valid: false, status: "NOT TESTED", reason: `عدد التشغيلات المسجلة (${runs?.length}) لا يطابق المطلوب (22)` };
    }

    const seenKeys = new Set();
    let computedErrors = 0;
    let computedWarnings = 0;
    let computedExceptions = 0;

    for (const r of runs) {
        if (!r.runKey || typeof r.runKey !== 'string') {
            return { valid: false, status: "NOT TESTED", reason: "مفتاح تشغيل مفقود أو غير نصي" };
        }
        if (seenKeys.has(r.runKey)) {
            return { valid: false, status: "NOT TESTED", reason: `تكرار غير صالح لنفس المشهد: ${r.runKey}` };
        }
        seenKeys.add(r.runKey);

        if (!EXPECTED_RUN_KEYS.includes(r.runKey)) {
            return { valid: false, status: "NOT TESTED", reason: `مفتاح تشغيل غير متوقع: ${r.runKey}` };
        }

        if (r.status !== "OK") {
            return { valid: false, status: "NOT TESTED", reason: `فشل التنقل في المشهد ${r.runKey}: ${r.status}` };
        }

        if (!r.finalUrl || typeof r.finalUrl !== 'string' || r.finalUrl.startsWith('chrome-error://')) {
            return { valid: false, status: "NOT TESTED", reason: `رابط نهائي غير صالح في المشهد ${r.runKey}: ${r.finalUrl}` };
        }

        // Checkout coverage proof: must stay on /checkout/ and not redirect to /cart/
        if (r.pageName === 'checkout') {
            if (r.finalUrl.includes('/cart/')) {
                return { valid: false, status: "NOT TESTED", reason: `صفحة الدفع ${r.runKey} تم تحويلها إلى السلة ولم تُغطَّ فعلياً: ${r.finalUrl}` };
            }
            if (!r.finalUrl.includes('/checkout/')) {
                return { valid: false, status: "NOT TESTED", reason: `صفحة الدفع ${r.runKey} لم تستقر على رابط الدفع: ${r.finalUrl}` };
            }
        }

        if (!Number.isInteger(r.errorCount) || r.errorCount < 0 ||
            !Number.isInteger(r.warningCount) || r.warningCount < 0 ||
            !Array.isArray(r.unhandledExceptions) || !Array.isArray(r.calls)) {
            return { valid: false, status: "NOT TESTED", reason: `حقول غير صالحة أو أعداد سالبة في المشهد ${r.runKey}` };
        }

        computedErrors += r.errorCount;
        computedWarnings += r.warningCount;
        computedExceptions += r.unhandledExceptions.length;
    }

    if (seenKeys.size !== EXPECTED_RUN_KEYS.length) {
        return { valid: false, status: "NOT TESTED", reason: `نقص في تغطية المشاهد الفريدة (${seenKeys.size}/22)` };
    }

    const summary = auditLog.summary;
    if (!summary || typeof summary !== 'object') {
        return { valid: false, status: "NOT TESTED", reason: "ملخص الإحصاءات (summary) مفقود في السجل" };
    }

    if (summary.totalErrors !== computedErrors ||
        summary.totalUnhandledExceptions !== computedExceptions ||
        summary.totalWarnings !== computedWarnings) {
        return { valid: false, status: "NOT TESTED", reason: `تناقض بين الملخص والأعداد المحسوبة من التشغيلات (أخطاء: ${summary.totalErrors} vs ${computedErrors})` };
    }

    if (computedErrors > 0 || computedExceptions > 0) {
        return { valid: true, status: "FAIL", reason: `رصدت أخطاء أو استثناءات في المتجر: ${computedExceptions} استثناءات و ${computedErrors} أخطاء كونسول`, details: { computedErrors, computedExceptions, computedWarnings } };
    }

    return {
        valid: true,
        status: "PASS",
        reason: "سجل تدقيق سليم بتغطية فريدة كاملة (22/22 تشغيل بنجاح OK بما فيها صفحة الدفع دون تحويل)، ونجاح فحص Canary المستقل، مع صفر أخطاء وصفر استثناءات",
        details: { computedErrors: 0, computedExceptions: 0, computedWarnings }
    };
}

// Self-test suite verifying rejection of synthetic invalid cases
function runNegativeValidationTests() {
    console.log("=== RUNNING INDEPENDENT NEGATIVE VALIDATION TESTS ===");

    // Fixture 1: Missing summary and run fields
    const f1 = {
        runMetadata: { totalRuns: 22, expectedRuns: 22, allRunsSuccessful: true, timestamp: "2026-10-23T12:00:00Z" },
        runs: Array.from({ length: 22 }, () => ({ status: 'OK' })),
        canaryVerification: { passed: true, capturedWarning: true, capturedError: true },
    };
    const r1 = validateConsoleAuditLog(f1);
    assert.equal(r1.status, 'NOT TESTED', 'Fixture 1 must be rejected as NOT TESTED');
    console.log("[PASS] Fixture 1 (missing summary/run fields) correctly rejected as NOT TESTED");

    // Fixture 2: Repeated scene
    const f2 = {
        runMetadata: { totalRuns: 22, expectedRuns: 22, allRunsSuccessful: true, timestamp: "2026-10-23T12:00:00Z" },
        runs: Array.from({ length: 22 }, () => ({ runKey: 'home_375', status: 'OK', finalUrl: 'http://capability-test.local/', errorCount: 0, warningCount: 0, unhandledExceptions: [], calls: [] })),
        canaryVerification: { passed: true, capturedWarning: true, capturedError: true },
        summary: { totalErrors: 0, totalUnhandledExceptions: 0, totalWarnings: 0 }
    };
    const r2 = validateConsoleAuditLog(f2);
    assert.equal(r2.status, 'NOT TESTED', 'Fixture 2 must be rejected as NOT TESTED');
    console.log("[PASS] Fixture 2 (repeated home_375 scene) correctly rejected as NOT TESTED");

    // Fixture 3: Raw errors with zero summary
    const f3 = {
        runMetadata: { totalRuns: 22, expectedRuns: 22, allRunsSuccessful: true, timestamp: "2026-10-23T12:00:00Z" },
        runs: EXPECTED_RUN_KEYS.map(key => ({
            runKey: key,
            pageName: key.split('_')[0],
            status: 'OK',
            finalUrl: key.includes('checkout') ? 'http://capability-test.local/checkout/' : 'http://capability-test.local/',
            errorCount: 1,
            warningCount: 0,
            unhandledExceptions: [{ text: 'synthetic error' }],
            calls: []
        })),
        canaryVerification: { passed: true, capturedWarning: true, capturedError: true },
        summary: { totalErrors: 0, totalUnhandledExceptions: 0, totalWarnings: 0 }
    };
    const r3 = validateConsoleAuditLog(f3);
    assert.equal(r3.status, 'NOT TESTED', 'Fixture 3 must be rejected as NOT TESTED (discrepancy)');
    console.log("[PASS] Fixture 3 (raw errors vs zero summary discrepancy) correctly rejected as NOT TESTED");

    // Fixture 4: Checkout redirected to cart
    const f4 = {
        runMetadata: { totalRuns: 22, expectedRuns: 22, allRunsSuccessful: true, timestamp: "2026-10-23T12:00:00Z" },
        runs: EXPECTED_RUN_KEYS.map(key => ({
            runKey: key,
            pageName: key.includes('checkout') ? 'checkout' : key.split('_')[0],
            status: 'OK',
            finalUrl: key.includes('checkout') ? 'http://capability-test.local/cart/' : 'http://capability-test.local/',
            errorCount: 0,
            warningCount: 0,
            unhandledExceptions: [],
            calls: []
        })),
        canaryVerification: { passed: true, capturedWarning: true, capturedError: true },
        summary: { totalErrors: 0, totalUnhandledExceptions: 0, totalWarnings: 0 }
    };
    const r4 = validateConsoleAuditLog(f4);
    assert.equal(r4.status, 'NOT TESTED', 'Fixture 4 (checkout redirected to cart) must be rejected as NOT TESTED');
    console.log("[PASS] Fixture 4 (checkout redirected to cart) correctly rejected as NOT TESTED");

    // Fixture 5: Net connection refused
    const f5 = {
        runMetadata: { totalRuns: 22, expectedRuns: 22, allRunsSuccessful: true, timestamp: "2026-10-23T12:00:00Z" },
        runs: EXPECTED_RUN_KEYS.map((key, i) => ({
            runKey: key,
            pageName: key.split('_')[0],
            status: i === 0 ? 'NAVIGATION_FAILED: net::ERR_CONNECTION_REFUSED' : 'OK',
            finalUrl: i === 0 ? 'chrome-error://chromewebdata/' : 'http://capability-test.local/',
            errorCount: 0,
            warningCount: 0,
            unhandledExceptions: [],
            calls: []
        })),
        canaryVerification: { passed: true, capturedWarning: true, capturedError: true },
        summary: { totalErrors: 0, totalUnhandledExceptions: 0, totalWarnings: 0 }
    };
    const r5 = validateConsoleAuditLog(f5);
    assert.equal(r5.status, 'NOT TESTED', 'Fixture 5 (navigation failed) must be rejected as NOT TESTED');
    console.log("[PASS] Fixture 5 (network connection refused) correctly rejected as NOT TESTED");

    console.log("=== ALL NEGATIVE VALIDATION TESTS PASSED ===");
}

if (process.argv[1] && process.argv[1].endsWith('verify_validator.mjs')) {
    runNegativeValidationTests();
}
