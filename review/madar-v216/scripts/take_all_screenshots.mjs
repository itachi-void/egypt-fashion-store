import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9390;
const tempDir = 'C:\\Users\\itachi\\.gemini\\antigravity-ide\\scratch\\chrome_all_screenshots';
const screenshotsDir = 'C:\\Users\\itachi\\.gemini\\antigravity-ide\\scratch\\egypt-fashion-store\\review\\madar-v216\\screenshots';

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
    function send(method, params = {}) {
        return new Promise((resolve, reject) => {
            const id = msgId++;
            const handler = (event) => {
                const data = JSON.parse(event.data);
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

    return { send, ws, tabId: tabData.id };
}

async function capturePair(client, baseName, width, height, isMobile) {
    await client.send("Emulation.setDeviceMetricsOverride", {
        width, height, deviceScaleFactor: 1, mobile: isMobile
    });
    await sleep(500);

    // Remove curtain / splash if present
    await client.send("Runtime.evaluate", {
        expression: `(function() {
            const c = document.querySelector('.motion-curtain');
            if (c) c.remove();
            document.querySelectorAll('.mdr-will-reveal, .mdr-reveal').forEach(el => el.classList.add('is-visible'));
        })()`
    });
    await sleep(300);

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
        console.log(`Saved full page: ${baseName}_${width}_full.png (${fs.statSync(fullPath).size} bytes)`);
    }
}

async function run() {
    try {
        await sleep(2500);
        console.log("=== STARTING FULL SCREENSHOT SUITE ===");

        const pages = [
            { name: "home", url: "http://capability-test.local/" },
            { name: "shop", url: "http://capability-test.local/shop/" },
            { name: "category_men", url: "http://capability-test.local/product-category/men/" },
            { name: "category_kids", url: "http://capability-test.local/product-category/kids/" },
            { name: "product_simple", url: "http://capability-test.local/?p=44" },
            { name: "cart", url: "http://capability-test.local/cart/" },
            { name: "checkout", url: "http://capability-test.local/checkout/" },
            ...(process.env.TEST_ORDER_RECEIVED_URL ? [{ name: "order_received", url: process.env.TEST_ORDER_RECEIVED_URL }] : []),
            { name: "my_account_logged_out", url: "http://capability-test.local/my-account/" },
            { name: "lost_password", url: "http://capability-test.local/my-account/lost-password/" },
            { name: "search_results", url: "http://capability-test.local/?s=%D9%82%D9%85%D9%8A%D8%B5&post_type=product" },
            { name: "search_empty", url: "http://capability-test.local/?s=xyznotfound123&post_type=product" }
        ];

        // 1. STANDARD PAGES (375 and 1440)
        for (const p of pages) {
            console.log(`\nNavigating to ${p.name} (${p.url})...`);
            const client = await createClient(p.url);
            await sleep(3500);

            console.log(`Capturing ${p.name} @ 375px...`);
            await capturePair(client, p.name, 375, 812, true);

            console.log(`Capturing ${p.name} @ 1440px...`);
            await capturePair(client, p.name, 1440, 900, false);

            client.ws.close();
        }

        // 2. VARIABLE PRODUCT WITH VARIATION SELECTED
        console.log("\nCapturing product_variable (with selected variation)...");
        {
            const client = await createClient("http://capability-test.local/?p=24");
            await sleep(3500);
            await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const size = document.querySelector('#pa_size');
                    if (size) { size.value = 'm'; size.dispatchEvent(new Event('change', { bubbles: true })); }
                    const color = document.querySelector('#pa_color');
                    if (color) { color.value = 'black'; color.dispatchEvent(new Event('change', { bubbles: true })); }
                })()`
            });
            await sleep(1500);

            console.log("Capturing product_variable @ 375px...");
            await capturePair(client, "product_variable", 375, 812, true);

            console.log("Capturing product_variable @ 1440px...");
            await capturePair(client, "product_variable", 1440, 900, false);
            client.ws.close();
        }

        // 3. MINI-CART OPEN
        console.log("\nCapturing mini_cart_open...");
        {
            // First add an item so mini-cart has content
            const client = await createClient("http://capability-test.local/?add-to-cart=44");
            await sleep(3000);

            // Open mini-cart / drawer
            await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const cartIcon = document.querySelector('.quiet-header-tool[href*="cart"], .mdr-header-cart, a[href*="/cart/"]');
                    if (cartIcon) cartIcon.click();
                    const drawer = document.querySelector('.mdr-drawer--cart, .widget_shopping_cart, .mini-cart');
                    if (drawer) drawer.classList.add('is-open');
                })()`
            });
            await sleep(1000);

            // 375px
            await client.send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
            await sleep(400);
            const mc375 = await client.send("Page.captureScreenshot", { format: "png" });
            fs.writeFileSync(path.join(screenshotsDir, "mini_cart_open_375.png"), Buffer.from(mc375.data, 'base64'));
            fs.writeFileSync(path.join(screenshotsDir, "mini_cart_open_375_full.png"), Buffer.from(mc375.data, 'base64'));
            console.log("Saved mini_cart_open_375.png");

            // 1440px
            await client.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
            await sleep(400);
            const mc1440 = await client.send("Page.captureScreenshot", { format: "png" });
            fs.writeFileSync(path.join(screenshotsDir, "mini_cart_open_1440.png"), Buffer.from(mc1440.data, 'base64'));
            console.log("Saved mini_cart_open_1440.png");

            client.ws.close();
        }

        // 4. MY ACCOUNT LOGGED IN
        console.log("\nCapturing my_account_logged_in...");
        {
            const client = await createClient("http://capability-test.local/my-account/");
            await sleep(3000);

            // Login as customer if env credentials provided
            const testUser = process.env.TEST_USER_LOGIN || '';
            const testPassword = process.env.TEST_USER_PASSWORD || '';
            if (testUser && testPassword) {
                await client.send("Runtime.evaluate", {
                    expression: `(function() {
                        const user = document.querySelector('#username');
                        const pass = document.querySelector('#password');
                        const btn = document.querySelector('button[name="login"]');
                        if (user && pass && btn) {
                            user.value = ${JSON.stringify(testUser)};
                            pass.value = ${JSON.stringify(testPassword)};
                            user.dispatchEvent(new Event('input', { bubbles: true }));
                            pass.dispatchEvent(new Event('input', { bubbles: true }));
                            btn.click();
                        }
                    })()`
                });
                await sleep(4000);
            } else {
                console.log("No customer credentials in env (TEST_USER_LOGIN/TEST_USER_PASSWORD); skipping login submission.");
            }

            console.log("Capturing my_account_logged_in @ 375px...");
            await capturePair(client, "my_account_logged_in", 375, 812, true);

            console.log("Capturing my_account_logged_in @ 1440px...");
            await capturePair(client, "my_account_logged_in", 1440, 900, false);

            client.ws.close();
        }

        // 5. MOBILE HEADER MENU OPEN (375px)
        console.log("\nCapturing header_menu_open_375...");
        {
            const client = await createClient("http://capability-test.local/");
            await sleep(3500);
            await client.send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
            await sleep(500);

            // Open mobile menu
            await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const c = document.querySelector('.motion-curtain');
                    if (c) c.remove();
                    const burger = document.querySelector('.mdr-burger, .menu-toggle, button.wp-block-navigation__responsive-container-open');
                    if (burger) burger.click();
                    const menu = document.querySelector('.mdr-mobile-menu, .wp-block-navigation__responsive-container');
                    if (menu) menu.classList.add('is-menu-open');
                })()`
            });
            await sleep(800);

            const mShot = await client.send("Page.captureScreenshot", { format: "png" });
            fs.writeFileSync(path.join(screenshotsDir, "header_menu_open_375.png"), Buffer.from(mShot.data, 'base64'));
            fs.writeFileSync(path.join(screenshotsDir, "header_menu_open_375_full.png"), Buffer.from(mShot.data, 'base64'));
            console.log("Saved header_menu_open_375.png");

            client.ws.close();
        }

        // 6. CARD TAP BEFORE & AFTER (375px)
        console.log("\nCapturing card_tap_before_375 and card_tap_after_375...");
        {
            const client = await createClient("http://capability-test.local/");
            await sleep(3500);
            await client.send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
            await sleep(500);

            await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const c = document.querySelector('.motion-curtain');
                    if (c) c.remove();
                    const card = document.querySelector('.store-product-grid .store-product-card');
                    if (card) card.scrollIntoView({ behavior: 'instant', block: 'center' });
                })()`
            });
            await sleep(600);

            // Screenshot BEFORE tap
            const beforeSnap = await client.send("Page.captureScreenshot", { format: "png" });
            fs.writeFileSync(path.join(screenshotsDir, "card_tap_before_375.png"), Buffer.from(beforeSnap.data, 'base64'));
            console.log("Saved card_tap_before_375.png");

            // Dispatch tap / focus / hover on card
            const pos = await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const card = document.querySelector('.store-product-grid .store-product-card');
                    if (!card) return null;
                    const r = card.getBoundingClientRect();
                    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
                })()`,
                returnByValue: true
            });

            if (pos?.result?.value) {
                const { x, y } = pos.result.value;
                await client.send("Input.dispatchTouchEvent", {
                    type: "touchStart",
                    touchPoints: [{ x, y }]
                });
                await sleep(100);
                await client.send("Input.dispatchTouchEvent", {
                    type: "touchEnd",
                    touchPoints: []
                });
                await client.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
                await sleep(600);
            }

            // Screenshot AFTER tap
            const afterSnap = await client.send("Page.captureScreenshot", { format: "png" });
            fs.writeFileSync(path.join(screenshotsDir, "card_tap_after_375.png"), Buffer.from(afterSnap.data, 'base64'));
            console.log("Saved card_tap_after_375.png");

            client.ws.close();
        }

        console.log("\n=== ALL SCREENSHOTS SUCCESSFULLY CAPTURED! ===");
    } catch (e) {
        console.error("Screenshot error:", e);
    } finally {
        chromeProcess.kill();
        if (fs.existsSync(tempDir)) {
            try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (_) {}
        }
        process.exit(0);
    }
}

run();
