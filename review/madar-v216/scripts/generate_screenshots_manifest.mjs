import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reviewDir = path.resolve(__dirname, '..');
const screenshotsDir = path.join(reviewDir, 'screenshots');

const SCREENSHOT_METADATA_RULES = {
    // 1. Natural page renders (pure browser rendering, no synthetic DOM modification)
    "home_375.png": { targetUrl: "http://capability-test.local/", viewport: { width: 375, height: 812 }, category: "natural", interventions: [], provenance: "commit:e364bb7 (2026-10-22)" },
    "home_375_full.png": { targetUrl: "http://capability-test.local/", viewport: { width: 375, height: 11672 }, category: "intervened", interventions: ["removed .motion-curtain", "forced .is-visible to capture full lazy content"], provenance: "commit:e364bb7 (2026-10-22)" },
    "home_1440.png": { targetUrl: "http://capability-test.local/", viewport: { width: 1440, height: 900 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "home_1440_full.png": { targetUrl: "http://capability-test.local/", viewport: { width: 1440, height: 10939 }, category: "intervened", interventions: ["removed .motion-curtain", "forced .is-visible to capture full lazy content"], provenance: "commit:e364bb7 (2026-10-22)" },

    "shop_375.png": { targetUrl: "http://capability-test.local/shop/", viewport: { width: 375, height: 812 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "shop_375_full.png": { targetUrl: "http://capability-test.local/shop/", viewport: { width: 375, height: 1680 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "shop_1440.png": { targetUrl: "http://capability-test.local/shop/", viewport: { width: 1440, height: 900 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "shop_1440_full.png": { targetUrl: "http://capability-test.local/shop/", viewport: { width: 1440, height: 1540 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },

    "category_men_375.png": { targetUrl: "http://capability-test.local/product-category/men/", viewport: { width: 375, height: 812 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "category_men_375_full.png": { targetUrl: "http://capability-test.local/product-category/men/", viewport: { width: 375, height: 1680 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "category_men_1440.png": { targetUrl: "http://capability-test.local/product-category/men/", viewport: { width: 1440, height: 900 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "category_men_1440_full.png": { targetUrl: "http://capability-test.local/product-category/men/", viewport: { width: 1440, height: 1540 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },

    "category_kids_375.png": { targetUrl: "http://capability-test.local/product-category/kids/", viewport: { width: 375, height: 812 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "category_kids_375_full.png": { targetUrl: "http://capability-test.local/product-category/kids/", viewport: { width: 375, height: 1680 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "category_kids_1440.png": { targetUrl: "http://capability-test.local/product-category/kids/", viewport: { width: 1440, height: 900 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "category_kids_1440_full.png": { targetUrl: "http://capability-test.local/product-category/kids/", viewport: { width: 1440, height: 1540 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },

    "product_simple_375.png": { targetUrl: "http://capability-test.local/?p=44", viewport: { width: 375, height: 812 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "product_simple_375_full.png": { targetUrl: "http://capability-test.local/?p=44", viewport: { width: 375, height: 2100 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "product_simple_1440.png": { targetUrl: "http://capability-test.local/?p=44", viewport: { width: 1440, height: 900 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "product_simple_1440_full.png": { targetUrl: "http://capability-test.local/?p=44", viewport: { width: 1440, height: 1800 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },

    "product_variable_375.png": { targetUrl: "http://capability-test.local/?p=141", viewport: { width: 375, height: 812 }, category: "intervened", interventions: ["simulated dropdown option selection"], provenance: "commit:c04b79d (2026-10-12)" },
    "product_variable_375_full.png": { targetUrl: "http://capability-test.local/?p=141", viewport: { width: 375, height: 2200 }, category: "intervened", interventions: ["simulated dropdown option selection"], provenance: "commit:c04b79d (2026-10-12)" },
    "product_variable_1440.png": { targetUrl: "http://capability-test.local/?p=141", viewport: { width: 1440, height: 900 }, category: "intervened", interventions: ["simulated dropdown option selection"], provenance: "commit:c04b79d (2026-10-12)" },
    "product_variable_1440_full.png": { targetUrl: "http://capability-test.local/?p=141", viewport: { width: 1440, height: 1900 }, category: "intervened", interventions: ["simulated dropdown option selection"], provenance: "commit:c04b79d (2026-10-12)" },

    "cart_375.png": { targetUrl: "http://capability-test.local/cart/", viewport: { width: 375, height: 812 }, category: "natural", interventions: ["cart populated via ?add-to-cart=44"], provenance: "commit:c04b79d (2026-10-12)" },
    "cart_375_full.png": { targetUrl: "http://capability-test.local/cart/", viewport: { width: 375, height: 1200 }, category: "natural", interventions: ["cart populated via ?add-to-cart=44"], provenance: "commit:c04b79d (2026-10-12)" },
    "cart_1440.png": { targetUrl: "http://capability-test.local/cart/", viewport: { width: 1440, height: 900 }, category: "natural", interventions: ["cart populated via ?add-to-cart=44"], provenance: "commit:c04b79d (2026-10-12)" },
    "cart_1440_full.png": { targetUrl: "http://capability-test.local/cart/", viewport: { width: 1440, height: 1100 }, category: "natural", interventions: ["cart populated via ?add-to-cart=44"], provenance: "commit:c04b79d (2026-10-12)" },

    "checkout_375.png": { targetUrl: "http://capability-test.local/checkout/", viewport: { width: 375, height: 812 }, category: "natural", interventions: ["session cart populated with item"], provenance: "commit:e364bb7 (2026-10-22)" },
    "checkout_375_full.png": { targetUrl: "http://capability-test.local/checkout/", viewport: { width: 375, height: 1900 }, category: "natural", interventions: ["session cart populated with item"], provenance: "commit:e364bb7 (2026-10-22)" },
    "checkout_1440.png": { targetUrl: "http://capability-test.local/checkout/", viewport: { width: 1440, height: 900 }, category: "natural", interventions: ["session cart populated with item"], provenance: "commit:e364bb7 (2026-10-22)" },
    "checkout_1440_full.png": { targetUrl: "http://capability-test.local/checkout/", viewport: { width: 1440, height: 1600 }, category: "natural", interventions: ["session cart populated with item"], provenance: "commit:e364bb7 (2026-10-22)" },

    "my_account_logged_out_375.png": { targetUrl: "http://capability-test.local/my-account/", viewport: { width: 375, height: 812 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "my_account_logged_out_375_full.png": { targetUrl: "http://capability-test.local/my-account/", viewport: { width: 375, height: 1100 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "my_account_logged_out_1440.png": { targetUrl: "http://capability-test.local/my-account/", viewport: { width: 1440, height: 900 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "my_account_logged_out_1440_full.png": { targetUrl: "http://capability-test.local/my-account/", viewport: { width: 1440, height: 1000 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },

    "lost_password_375.png": { targetUrl: "http://capability-test.local/my-account/lost-password/", viewport: { width: 375, height: 812 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "lost_password_375_full.png": { targetUrl: "http://capability-test.local/my-account/lost-password/", viewport: { width: 375, height: 1000 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "lost_password_1440.png": { targetUrl: "http://capability-test.local/my-account/lost-password/", viewport: { width: 1440, height: 900 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "lost_password_1440_full.png": { targetUrl: "http://capability-test.local/my-account/lost-password/", viewport: { width: 1440, height: 900 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },

    "search_results_375.png": { targetUrl: "http://capability-test.local/?s=%D9%82%D9%85%D9%8A%D8%B5&post_type=product", viewport: { width: 375, height: 812 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "search_results_375_full.png": { targetUrl: "http://capability-test.local/?s=%D9%82%D9%85%D9%8A%D8%B5&post_type=product", viewport: { width: 375, height: 1500 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "search_results_1440.png": { targetUrl: "http://capability-test.local/?s=%D9%82%D9%85%D9%8A%D8%B5&post_type=product", viewport: { width: 1440, height: 900 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "search_results_1440_full.png": { targetUrl: "http://capability-test.local/?s=%D9%82%D9%85%D9%8A%D8%B5&post_type=product", viewport: { width: 1440, height: 1400 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },

    "search_empty_375.png": { targetUrl: "http://capability-test.local/?s=xyznotfound123&post_type=product", viewport: { width: 375, height: 812 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "search_empty_375_full.png": { targetUrl: "http://capability-test.local/?s=xyznotfound123&post_type=product", viewport: { width: 375, height: 900 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "search_empty_1440.png": { targetUrl: "http://capability-test.local/?s=xyznotfound123&post_type=product", viewport: { width: 1440, height: 900 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },
    "search_empty_1440_full.png": { targetUrl: "http://capability-test.local/?s=xyznotfound123&post_type=product", viewport: { width: 1440, height: 900 }, category: "natural", interventions: [], provenance: "commit:c04b79d (2026-10-12)" },

    // 2. Intervened UI States
    "mini_cart_open_375.png": { targetUrl: "http://capability-test.local/", viewport: { width: 375, height: 812 }, category: "intervened", interventions: ["forced class .is-open on mini-cart drawer"], provenance: "commit:c04b79d (2026-10-12)" },
    "mini_cart_open_375_full.png": { targetUrl: "http://capability-test.local/", viewport: { width: 375, height: 812 }, category: "intervened", interventions: ["forced class .is-open on mini-cart drawer"], provenance: "commit:c04b79d (2026-10-12)" },
    "mini_cart_open_1440.png": { targetUrl: "http://capability-test.local/", viewport: { width: 1440, height: 900 }, category: "intervened", interventions: ["forced class .is-open on mini-cart drawer"], provenance: "commit:c04b79d (2026-10-12)" },

    "header_menu_open_375.png": { targetUrl: "http://capability-test.local/", viewport: { width: 375, height: 812 }, category: "intervened", interventions: ["clicked .store-menu-toggle button"], provenance: "commit:c04b79d (2026-10-12)" },
    "test_mobile_menu_open.png": { targetUrl: "http://capability-test.local/", viewport: { width: 375, height: 812 }, category: "intervened", interventions: ["clicked .store-menu-toggle button"], provenance: "commit:e364bb7 (2026-10-22)" },
    "test_mobile_menu_esc.png": { targetUrl: "http://capability-test.local/", viewport: { width: 375, height: 812 }, category: "intervened", interventions: ["clicked menu toggle, dispatched Escape (remained open)"], provenance: "commit:e364bb7 (2026-10-22)" },
    "test_mobile_menu_after_esc.png": { targetUrl: "http://capability-test.local/", viewport: { width: 375, height: 812 }, category: "intervened", interventions: ["opened menu via toggle, dispatched CDP Escape event"], provenance: "session:current (2026-10-23)" },

    // Card hover interaction captures
    "card_tap_before_375.png": { targetUrl: "http://capability-test.local/", viewport: { width: 375, height: 812 }, category: "intervened", interventions: ["removed .motion-curtain, scrolled card into view"], provenance: "commit:c04b79d (2026-10-12)" },
    "card_tap_after_375.png": { targetUrl: "http://capability-test.local/", viewport: { width: 375, height: 812 }, category: "intervened", interventions: ["removed .motion-curtain, simulated tap on mobile card"], provenance: "commit:c04b79d (2026-10-12)" },
    "card_before_hover_1440.png": { targetUrl: "http://capability-test.local/", viewport: { width: 1440, height: 900 }, category: "intervened", interventions: ["removed .motion-curtain, scrolled card into view"], provenance: "commit:c04b79d (2026-10-12)" },
    "card_after_hover_1440.png": { targetUrl: "http://capability-test.local/", viewport: { width: 1440, height: 900 }, category: "intervened", interventions: ["removed .motion-curtain, simulated hover on desktop card"], provenance: "commit:c04b79d (2026-10-12)" },

    // Session functional test artifacts
    "test_card_during_hover.png": { targetUrl: "http://capability-test.local/", viewport: { width: 1440, height: 900 }, category: "intervened", interventions: ["removed .motion-curtain, mouseMoved onto card center"], provenance: "session:current (2026-10-23)" },
    "test_card_post_hover.png": { targetUrl: "http://capability-test.local/", viewport: { width: 1440, height: 900 }, category: "intervened", interventions: ["removed .motion-curtain, mouseMoved away to 0,0"], provenance: "session:current (2026-10-23)" },
    "test_card_hover.png": { targetUrl: "http://capability-test.local/", viewport: { width: 1440, height: 900 }, category: "intervened", interventions: ["removed .motion-curtain, mouseMoved onto card center"], provenance: "session:current (2026-10-23)" },
    "test_add_to_cart_badges.png": { targetUrl: "http://capability-test.local/?p=44", viewport: { width: 1440, height: 900 }, category: "intervened", interventions: ["clicked button.single_add_to_cart_button"], provenance: "session:current (2026-10-23)" },
    "test_outofstock_variation.png": { targetUrl: "http://capability-test.local/?p=141", viewport: { width: 1440, height: 900 }, category: "intervened", interventions: ["selected out-of-stock option XL (variation #145)"], provenance: "session:current (2026-10-23)" },
    "test_cart_update_remove.png": { targetUrl: "http://capability-test.local/cart/", viewport: { width: 1440, height: 900 }, category: "intervened", interventions: ["pre-added item, clicked a.remove in cart"], provenance: "session:current (2026-10-23)" },
    "test_search_flow.png": { targetUrl: "http://capability-test.local/?s=xyznotfound123&post_type=product", viewport: { width: 1440, height: 900 }, category: "intervened", interventions: ["executed non-existent search query"], provenance: "session:current (2026-10-23)" },
    "test_auth_flow.png": { targetUrl: "http://capability-test.local/my-account/lost-password/", viewport: { width: 1440, height: 900 }, category: "intervened", interventions: ["submitted lost password form"], provenance: "session:current (2026-10-23)" },
    "test_reduced_motion.png": { targetUrl: "http://capability-test.local/", viewport: { width: 375, height: 812 }, category: "intervened", interventions: ["emulated media feature prefers-reduced-motion: reduce"], provenance: "session:current (2026-10-23)" },

    // 3. Archival artifacts
    "my_account_logged_in_375.png": { targetUrl: "http://capability-test.local/my-account/", viewport: { width: 375, height: 812 }, category: "archival", interventions: ["authenticated customer session in baseline review"], provenance: "commit:c04b79d (2026-10-12)" },
    "my_account_logged_in_375_full.png": { targetUrl: "http://capability-test.local/my-account/", viewport: { width: 375, height: 1100 }, category: "archival", interventions: ["authenticated customer session in baseline review"], provenance: "commit:c04b79d (2026-10-12)" },
    "my_account_logged_in_1440.png": { targetUrl: "http://capability-test.local/my-account/", viewport: { width: 1440, height: 900 }, category: "archival", interventions: ["authenticated customer session in baseline review"], provenance: "commit:c04b79d (2026-10-12)" },
    "my_account_logged_in_1440_full.png": { targetUrl: "http://capability-test.local/my-account/", viewport: { width: 1440, height: 1000 }, category: "archival", interventions: ["authenticated customer session in baseline review"], provenance: "commit:c04b79d (2026-10-12)" },

    "order_received_375.png": { targetUrl: "http://capability-test.local/checkout/order-received/[REDACTED]/", viewport: { width: 375, height: 812 }, category: "archival", interventions: ["historical order confirmation view with sensitive tokens redacted"], provenance: "commit:c04b79d (2026-10-12)" },
    "order_received_375_full.png": { targetUrl: "http://capability-test.local/checkout/order-received/[REDACTED]/", viewport: { width: 375, height: 1200 }, category: "archival", interventions: ["historical order confirmation view with sensitive tokens redacted"], provenance: "commit:c04b79d (2026-10-12)" },
    "order_received_1440.png": { targetUrl: "http://capability-test.local/checkout/order-received/[REDACTED]/", viewport: { width: 1440, height: 900 }, category: "archival", interventions: ["historical order confirmation view with sensitive tokens redacted"], provenance: "commit:c04b79d (2026-10-12)" },
    "order_received_1440_full.png": { targetUrl: "http://capability-test.local/checkout/order-received/[REDACTED]/", viewport: { width: 1440, height: 1100 }, category: "archival", interventions: ["historical order confirmation view with sensitive tokens redacted"], provenance: "commit:c04b79d (2026-10-12)" },
    "test_order_received_complete.png": { targetUrl: "http://capability-test.local/checkout/order-received/[REDACTED]/", viewport: { width: 1440, height: 900 }, category: "archival", interventions: ["historical order confirmation view with sensitive tokens redacted"], provenance: "commit:c04b79d (2026-10-12)" },

    "test_lighthouse_metrics.png": { targetUrl: "http://capability-test.local/", viewport: { width: 1440, height: 900 }, category: "archival", interventions: ["archival capture of Google Lighthouse mobile audit"], provenance: "commit:c04b79d (2026-10-12)" },
    "product_24_single_1440.png": { targetUrl: "http://capability-test.local/?p=24", viewport: { width: 1440, height: 900 }, category: "archival", interventions: ["legacy product #24 view from earlier test suite"], provenance: "commit:b71fc6c (2026-10-12)" }
};

export function generateScreenshotsManifest() {
    const files = fs.readdirSync(screenshotsDir).filter(f => f.endsWith('.png')).sort();
    const manifest = {
        generatedAt: new Date().toISOString(),
        totalScreenshots: files.length,
        screenshots: []
    };

    const duplicateMap = new Map();

    for (const file of files) {
        const fullPath = path.join(screenshotsDir, file);
        const stat = fs.statSync(fullPath);
        const buf = fs.readFileSync(fullPath);
        const sha256 = crypto.createHash('sha256').update(buf).digest('hex');

        if (!duplicateMap.has(sha256)) duplicateMap.set(sha256, []);
        duplicateMap.get(sha256).push(file);

        const rule = SCREENSHOT_METADATA_RULES[file] || {
            targetUrl: "http://capability-test.local/",
            viewport: { width: 0, height: 0 },
            category: "unclassified",
            interventions: [],
            provenance: "unknown"
        };

        manifest.screenshots.push({
            filename: file,
            sha256,
            sizeBytes: stat.size,
            targetUrl: rule.targetUrl,
            viewport: rule.viewport,
            category: rule.category,
            interventions: rule.interventions,
            provenance: rule.provenance
        });
    }

    manifest.duplicateGroups = [...duplicateMap.entries()]
        .filter(([, names]) => names.length > 1)
        .map(([sha256, files]) => ({ sha256, files }));

    const outPath = path.join(reviewDir, "screenshots_manifest.json");
    fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), "utf8");
    console.log(`Generated screenshots manifest: ${outPath} (${manifest.screenshots.length} files, ${manifest.duplicateGroups.length} duplicate groups)`);
    return manifest;
}

if (process.argv[1] && process.argv[1].endsWith('generate_screenshots_manifest.mjs')) {
    generateScreenshotsManifest();
}
