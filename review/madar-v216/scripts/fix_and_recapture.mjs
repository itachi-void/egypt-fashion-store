import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9395;
const tempDir = 'C:\\Users\\itachi\\.gemini\\antigravity-ide\\scratch\\chrome_fix_recapture';
const screenshotsDir = 'C:\\Users\\itachi\\.gemini\\antigravity-ide\\scratch\\egypt-fashion-store\\review\\madar-v216\\screenshots';
const reviewDir = 'C:\\Users\\itachi\\.gemini\\antigravity-ide\\scratch\\egypt-fashion-store\\review\\madar-v216';

if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

const chromeProcess = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tempDir}`,
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    'about:blank'
]);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function createClient(url) {
    const res = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' });
    const tabData = await res.json();
    const ws = new WebSocket(tabData.webSocketDebuggerUrl);
    await new Promise(r => ws.onopen = r);

    let msgId = 1;
    const consoleWarnings = [];

    function send(method, params = {}) {
        return new Promise((resolve, reject) => {
            const id = msgId++;
            const handler = (event) => {
                const data = JSON.parse(event.data);
                if (data.method === 'Runtime.consoleAPICalled') {
                    if (data.params.type === 'warning') {
                        const text = data.params.args.map(a => a.value || a.description || '').join(' ');
                        consoleWarnings.push(text);
                    }
                }
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

    await send("Page.enable");
    await send("Runtime.enable");
    await send("DOM.enable");

    return { send, ws, tabId: tabData.id, consoleWarnings };
}

async function preparePageForCapture(client) {
    await client.send("Runtime.evaluate", {
        expression: `(async function() {
            // 1. Remove motion curtain and force reveals
            document.querySelectorAll('.motion-curtain').forEach(el => el.remove());
            document.querySelectorAll('.mdr-will-reveal, .mdr-reveal').forEach(el => el.classList.add('is-visible'));

            // 2. Remove lazy loading on all images to force download
            document.querySelectorAll('img').forEach(img => {
                img.removeAttribute('loading');
                img.decoding = 'sync';
                img.loading = 'eager';
            });

            // 3. Smooth scroll down across entire page
            const totalHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
            for (let y = 0; y < totalHeight; y += 350) {
                window.scrollTo(0, y);
                await new Promise(r => setTimeout(r, 70));
            }
            window.scrollTo(0, totalHeight);
            await new Promise(r => setTimeout(r, 200));

            // 4. Wait for all images to complete loading
            const imgs = Array.from(document.images);
            await Promise.all(imgs.map(img => {
                if (img.complete && img.naturalWidth > 0) return Promise.resolve();
                return new Promise(res => {
                    img.onload = img.onerror = res;
                    setTimeout(res, 1500);
                });
            }));

            // 5. Scroll back to top
            window.scrollTo(0, 0);
            await new Promise(r => setTimeout(r, 200));
        })()`,
        awaitPromise: true
    });
}

async function capturePair(client, baseName, width, height, isMobile) {
    await client.send("Emulation.setDeviceMetricsOverride", {
        width, height, deviceScaleFactor: 1, mobile: isMobile
    });
    await sleep(400);

    await preparePageForCapture(client);
    await sleep(400);

    // 1. Viewport screenshot
    const vpSnap = await client.send("Page.captureScreenshot", { format: "png" });
    if (vpSnap && vpSnap.data) {
        const vpPath = path.join(screenshotsDir, `${baseName}_${width}.png`);
        fs.writeFileSync(vpPath, Buffer.from(vpSnap.data, 'base64'));
        console.log(`Saved viewport: ${baseName}_${width}.png (${fs.statSync(vpPath).size} bytes)`);
    }

    // 2. Full page screenshot
    const metrics = await client.send("Page.getLayoutMetrics");
    const fullHeight = Math.max(height, Math.ceil(metrics.cssContentSize.height));
    const fullSnap = await client.send("Page.captureScreenshot", {
        format: "png",
        clip: { x: 0, y: 0, width, height: fullHeight, scale: 1 },
        captureBeyondViewport: true
    });
    if (fullSnap && fullSnap.data) {
        const fullPath = path.join(screenshotsDir, `${baseName}_${width}_full.png`);
        fs.writeFileSync(fullPath, Buffer.from(fullSnap.data, 'base64'));
        console.log(`Saved full page: ${baseName}_${width}_full.png (height: ${fullHeight}px, ${fs.statSync(fullPath).size} bytes)`);
    }
}

async function findTouchTargetsUnder44(client, pageName) {
    const res = await client.send("Runtime.evaluate", {
        expression: `(function() {
            const interactive = Array.from(document.querySelectorAll('button, a, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])'));
            const results = [];
            interactive.forEach(el => {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                if (rect.width <= 0 || rect.height <= 0) return;
                if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;

                if (rect.width < 44 || rect.height < 44) {
                    let selector = el.tagName.toLowerCase();
                    if (el.id) selector += '#' + el.id;
                    else if (el.className && typeof el.className === 'string') {
                        const firstClass = el.className.trim().split(/\\s+/)[0];
                        if (firstClass) selector += '.' + firstClass;
                    }
                    const text = (el.innerText || el.getAttribute('aria-label') || el.value || el.title || '').trim().replace(/\\s+/g, ' ').substring(0, 30);
                    results.push({
                        selector,
                        tag: el.tagName,
                        text,
                        width: Math.round(rect.width * 10) / 10,
                        height: Math.round(rect.height * 10) / 10
                    });
                }
            });
            return results;
        })()`,
        returnByValue: true
    });
    return (res && res.result && res.result.value) ? res.result.value.map(item => ({ ...item, page: pageName })) : [];
}

async function main() {
    try {
        await sleep(2500);
        console.log("=== STARTING FIX & RECAPTURE SUITE ===");

        const pageWarnings = {};
        const touchTargets = [];

        // 1. FIRST: ADD PRODUCT 44 TO CART VIA HTTP TO GUARANTEE CHECKOUT HAS ITEMS
        console.log("\nPopulating cart with product #44...");
        const cartPrepClient = await createClient("http://capability-test.local/?add-to-cart=44");
        await sleep(3000);

        // 2. RECAPTURE CHECKOUT (Mobile 375 & Desktop 1440)
        console.log("\nNavigating to /checkout/ with items in cart...");
        const checkoutClient = await createClient("http://capability-test.local/checkout/");
        await sleep(3500);

        const checkoutUrlCheck = await checkoutClient.send("Runtime.evaluate", {
            expression: `window.location.href`,
            returnByValue: true
        });
        console.log("Checkout current URL:", checkoutUrlCheck.result.value);

        console.log("Capturing checkout @ 375px...");
        await capturePair(checkoutClient, "checkout", 375, 812, true);
        pageWarnings["checkout_375"] = [...checkoutClient.consoleWarnings];
        const coTouch = await findTouchTargetsUnder44(checkoutClient, "checkout");
        touchTargets.push(...coTouch);

        console.log("Capturing checkout @ 1440px...");
        await capturePair(checkoutClient, "checkout", 1440, 900, false);
        pageWarnings["checkout_1440"] = [...checkoutClient.consoleWarnings];

        // 3. RECAPTURE CATEGORY KIDS & SHOP FULL PAGES + OTHER FULL PAGES
        const fullPagesToFix = [
            { name: "category_kids", url: "http://capability-test.local/product-category/kids/" },
            { name: "shop", url: "http://capability-test.local/shop/" },
            { name: "category_men", url: "http://capability-test.local/product-category/men/" },
            { name: "product_simple", url: "http://capability-test.local/?p=44" },
            { name: "product_variable", url: "http://capability-test.local/?p=24" },
            { name: "home", url: "http://capability-test.local/" },
            { name: "cart", url: "http://capability-test.local/cart/" },
            { name: "my_account_logged_out", url: "http://capability-test.local/my-account/" },
            { name: "lost_password", url: "http://capability-test.local/my-account/lost-password/" },
            { name: "search_results", url: "http://capability-test.local/?s=%D9%82%D9%85%D9%8A%D8%B5&post_type=product" },
            { name: "search_empty", url: "http://capability-test.local/?s=xyznotfound123&post_type=product" }
        ];

        for (const p of fullPagesToFix) {
            console.log(`\nNavigating to ${p.name} (${p.url}) to recapture full images...`);
            const client = await createClient(p.url);
            await sleep(3000);

            // 375
            console.log(`Recapturing ${p.name} @ 375px...`);
            await capturePair(client, p.name, 375, 812, true);
            pageWarnings[`${p.name}_375`] = [...client.consoleWarnings];
            const pTouch = await findTouchTargetsUnder44(client, p.name);
            touchTargets.push(...pTouch);

            // 1440
            console.log(`Recapturing ${p.name} @ 1440px...`);
            await capturePair(client, p.name, 1440, 900, false);
            pageWarnings[`${p.name}_1440`] = [...client.consoleWarnings];
        }

        // 4. MOBILE MENU OPEN & AFTER ESC TEST + FOCUS RECORDING
        console.log("\nExecuting Mobile Menu ESC & Focus Test...");
        const menuClient = await createClient("http://capability-test.local/");
        await sleep(3000);

        await menuClient.send("Emulation.setDeviceMetricsOverride", {
            width: 375, height: 812, deviceScaleFactor: 1, mobile: true
        });
        await sleep(500);

        // Click burger button
        const openResult = await menuClient.send("Runtime.evaluate", {
            expression: `(function() {
                const burger = document.querySelector('.mdr-burger, [aria-controls="mobile-nav"], .mdr-nav-toggle, button[aria-label*="قائمة"]');
                if (burger) {
                    burger.click();
                    return { found: true, tag: burger.tagName, class: burger.className };
                }
                return { found: false };
            })()`,
            returnByValue: true
        });
        console.log("Burger click result:", openResult.result.value);
        await sleep(800);

        // Screenshot: Mobile Menu Open
        const openSnap = await menuClient.send("Page.captureScreenshot", { format: "png" });
        fs.writeFileSync(path.join(screenshotsDir, "test_mobile_menu_open.png"), Buffer.from(openSnap.data, 'base64'));
        fs.writeFileSync(path.join(screenshotsDir, "header_menu_open_375.png"), Buffer.from(openSnap.data, 'base64'));
        fs.writeFileSync(path.join(screenshotsDir, "header_menu_open_375_full.png"), Buffer.from(openSnap.data, 'base64'));
        console.log("Saved test_mobile_menu_open.png & header_menu_open_375.png");

        // Press Escape key
        await menuClient.send("Input.dispatchKeyEvent", {
            type: "rawKeyDown",
            key: "Escape",
            code: "Escape",
            windowsVirtualKeyCode: 27,
            nativeVirtualKeyCode: 27
        });
        await menuClient.send("Input.dispatchKeyEvent", {
            type: "keyUp",
            key: "Escape",
            code: "Escape",
            windowsVirtualKeyCode: 27,
            nativeVirtualKeyCode: 27
        });
        await sleep(800);

        // Screenshot: Mobile Menu After ESC
        const escSnap = await menuClient.send("Page.captureScreenshot", { format: "png" });
        fs.writeFileSync(path.join(screenshotsDir, "test_mobile_menu_after_esc.png"), Buffer.from(escSnap.data, 'base64'));
        console.log("Saved test_mobile_menu_after_esc.png");

        // Focus query after close
        const focusResult = await menuClient.send("Runtime.evaluate", {
            expression: `(function() {
                const el = document.activeElement;
                return {
                    tagName: el ? el.tagName : 'NONE',
                    className: el ? el.className : '',
                    id: el ? el.id : '',
                    ariaLabel: el ? el.getAttribute('aria-label') : null,
                    outerHTML: el ? el.outerHTML.substring(0, 150) : ''
                };
            })()`,
            returnByValue: true
        });
        console.log("Focus after ESC:", focusResult.result.value);

        // 5. SAVE COLLECTED WARNINGS & TOUCH TARGETS & FOCUS INFO
        const outputData = {
            focusAfterEsc: focusResult.result.value,
            consoleWarnings: pageWarnings,
            touchTargetsUnder44: touchTargets
        };

        fs.writeFileSync(path.join(reviewDir, "recapture_data.json"), JSON.stringify(outputData, null, 2), "utf8");
        console.log("\nAll recapture data saved to recapture_data.json!");

    } catch (e) {
        console.error("Error in recapture:", e);
    } finally {
        chromeProcess.kill();
        process.exit(0);
    }
}

main();
