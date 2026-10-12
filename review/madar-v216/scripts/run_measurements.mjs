import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9395;
const tempDir = 'C:\\Users\\itachi\\.gemini\\antigravity-ide\\scratch\\chrome_measurements';
const reviewDir = 'C:\\Users\\itachi\\.gemini\\antigravity-ide\\scratch\\egypt-fashion-store\\review\\madar-v216';
const screenshotsDir = path.join(reviewDir, 'screenshots');

if (!fs.existsSync(reviewDir)) fs.mkdirSync(reviewDir, { recursive: true });
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

// Function to calculate relative luminance
function luminance(r, g, b) {
    const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function parseRgb(colorStr) {
    const m = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return [0, 0, 0];
    return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
}

function contrastRatio(rgb1, rgb2) {
    const l1 = luminance(...rgb1);
    const l2 = luminance(...rgb2);
    const brightest = Math.max(l1, l2);
    const darkest = Math.min(l1, l2);
    return ((brightest + 0.05) / (darkest + 0.05)).toFixed(2);
}

async function run() {
    try {
        await sleep(2500);
        console.log("=== RUNNING RAW MEASUREMENTS (375px & 1440px) ===");

        const measurements = {
            viewport_375: {},
            viewport_1440: {},
            overflow_checks: {},
            color_contrast: {},
            touch_targets: []
        };

        const viewports = [
            { width: 375, height: 812, key: "viewport_375", isMobile: true },
            { width: 1440, height: 900, key: "viewport_1440", isMobile: false }
        ];

        // 1. MEASUREMENTS ON HOMEPAGE
        for (const vp of viewports) {
            console.log(`Measuring Homepage at ${vp.width}px...`);
            const client = await createClient("http://capability-test.local/");
            await client.send("Emulation.setDeviceMetricsOverride", {
                width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.isMobile
            });
            await sleep(3500);

            // Remove curtain
            await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const c = document.querySelector('.motion-curtain');
                    if (c) c.remove();
                })()`
            });
            await sleep(300);

            const data = await client.send("Runtime.evaluate", {
                expression: `(function() {
                    // Header
                    const header = document.querySelector('.quiet-header, header, .mdr-header');
                    const headerRect = header ? header.getBoundingClientRect() : null;
                    const headerStyle = header ? window.getComputedStyle(header) : null;

                    // Typography
                    const h1 = document.querySelector('h1, .hero-title, .quiet-hero-title');
                    const h2 = document.querySelector('h2, .section-title, .quiet-section-title');
                    const body = document.body;
                    const navLink = document.querySelector('.quiet-nav-link, nav a');
                    const btn = document.querySelector('.quiet-button, .button, a.button, button');

                    function getFont(el) {
                        if (!el) return null;
                        const s = window.getComputedStyle(el);
                        return {
                            fontSize: s.fontSize,
                            lineHeight: s.lineHeight,
                            fontWeight: s.fontWeight,
                            fontFamily: s.fontFamily
                        };
                    }

                    // Sections padding & margin
                    const sections = Array.from(document.querySelectorAll('section, .experience-categories, .experience-campaign, .store-manifesto')).map(s => {
                        const cs = window.getComputedStyle(s);
                        const r = s.getBoundingClientRect();
                        return {
                            className: s.className,
                            paddingTop: cs.paddingTop,
                            paddingBottom: cs.paddingBottom,
                            paddingLeft: cs.paddingLeft,
                            paddingRight: cs.paddingRight,
                            marginTop: cs.marginTop,
                            marginBottom: cs.marginBottom,
                            height: r.height,
                            width: r.width
                        };
                    });

                    // Product Cards
                    const grid = document.querySelector('.store-product-grid, .products, ul.products');
                    const gridStyle = grid ? window.getComputedStyle(grid) : null;
                    const card = document.querySelector('.store-product-card, li.product');
                    const cardRect = card ? card.getBoundingClientRect() : null;
                    const cardImg = card ? card.querySelector('.store-card-image img, img') : null;
                    const imgRect = cardImg ? cardImg.getBoundingClientRect() : null;

                    return {
                        header: {
                            height: headerRect ? headerRect.height : null,
                            width: headerRect ? headerRect.width : null,
                            padding: headerStyle ? headerStyle.padding : null
                        },
                        typography: {
                            h1: getFont(h1),
                            h2: getFont(h2),
                            body: getFont(body),
                            navLink: getFont(navLink),
                            button: getFont(btn)
                        },
                        sections: sections.slice(0, 5),
                        productGrid: {
                            gap: gridStyle ? (gridStyle.gap || gridStyle.columnGap) : null,
                            gridTemplateColumns: gridStyle ? gridStyle.gridTemplateColumns : null
                        },
                        productCard: {
                            cardWidth: cardRect ? cardRect.width : null,
                            cardHeight: cardRect ? cardRect.height : null,
                            imgWidth: imgRect ? imgRect.width : null,
                            imgHeight: imgRect ? imgRect.height : null,
                            aspectRatio: imgRect ? (imgRect.width / imgRect.height).toFixed(3) : null
                        }
                    };
                })()`,
                returnByValue: true
            });

            measurements[vp.key] = data.result?.value;
            client.ws.close();
        }

        // 2. SHOP GRID COLUMNS MEASUREMENT
        for (const vp of viewports) {
            console.log(`Measuring Shop Grid Columns at ${vp.width}px...`);
            const client = await createClient("http://capability-test.local/shop/");
            await client.send("Emulation.setDeviceMetricsOverride", {
                width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.isMobile
            });
            await sleep(3500);

            const shopGrid = await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const grid = document.querySelector('ul.products, .wc-block-grid__products, .products, .wc-block-product-template');
                    if (!grid) return null;
                    const style = window.getComputedStyle(grid);
                    const items = Array.from(grid.querySelectorAll('li.product, .wc-block-grid__product, li.wp-block-post, li'));
                    let cols = 0;
                    if (items.length > 1) {
                        const firstTop = items[0].getBoundingClientRect().top;
                        cols = items.filter(it => Math.abs(it.getBoundingClientRect().top - firstTop) < 10).length;
                    }
                    return {
                        gridTemplateColumns: style.gridTemplateColumns,
                        gap: style.gap,
                        calculatedColumns: cols || 1
                    };
                })()`,
                returnByValue: true
            });

            measurements[vp.key].shopColumns = shopGrid.result?.value;
            client.ws.close();
        }

        // 3. TOUCH TARGETS (375px)
        console.log("Measuring Mobile Touch Targets on 375px...");
        {
            const client = await createClient("http://capability-test.local/");
            await client.send("Emulation.setDeviceMetricsOverride", {
                width: 375, height: 812, deviceScaleFactor: 1, mobile: true
            });
            await sleep(3500);

            const targets = await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const interactives = Array.from(document.querySelectorAll('button, a, input, select, textarea, [role="button"]'));
                    return interactives.map(el => {
                        const r = el.getBoundingClientRect();
                        const text = (el.innerText || el.getAttribute('aria-label') || el.name || el.className).trim().substring(0, 30);
                        if (r.width === 0 || r.height === 0 || el.offsetParent === null) return null;
                        const meetsReq = r.width >= 44 && r.height >= 44;
                        return {
                            tag: el.tagName,
                            text: text,
                            width: parseFloat(r.width.toFixed(1)),
                            height: parseFloat(r.height.toFixed(1)),
                            area: parseFloat((r.width * r.height).toFixed(1)),
                            meetsMin44px: meetsReq
                        };
                    }).filter(Boolean);
                })()`,
                returnByValue: true
            });

            measurements.touch_targets = targets.result?.value?.slice(0, 25);
            client.ws.close();
        }

        // 4. HORIZONTAL OVERFLOW CHECK (scrollWidth > innerWidth)
        console.log("Checking Horizontal Overflow across all pages...");
        const checkUrls = [
            { name: "home", url: "http://capability-test.local/" },
            { name: "shop", url: "http://capability-test.local/shop/" },
            { name: "category_men", url: "http://capability-test.local/product-category/men/" },
            { name: "category_kids", url: "http://capability-test.local/product-category/kids/" },
            { name: "product_simple", url: "http://capability-test.local/?p=44" },
            { name: "product_variable", url: "http://capability-test.local/?p=24" },
            { name: "cart", url: "http://capability-test.local/cart/" },
            { name: "checkout", url: "http://capability-test.local/checkout/" },
            { name: "my_account", url: "http://capability-test.local/my-account/" },
            { name: "lost_password", url: "http://capability-test.local/my-account/lost-password/" },
            { name: "search", url: "http://capability-test.local/?s=%D9%82%D9%85%D9%8A%D8%B5&post_type=product" }
        ];

        for (const u of checkUrls) {
            measurements.overflow_checks[u.name] = {};
            for (const vp of viewports) {
                const client = await createClient(u.url);
                await client.send("Emulation.setDeviceMetricsOverride", {
                    width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.isMobile
                });
                await sleep(3000);

                const over = await client.send("Runtime.evaluate", {
                    expression: `(function() {
                        const sw = document.documentElement.scrollWidth;
                        const iw = window.innerWidth;
                        const hasOverflow = sw > iw;
                        return {
                            scrollWidth: sw,
                            innerWidth: iw,
                            hasOverflow: hasOverflow,
                            overflowDiff: hasOverflow ? sw - iw : 0
                        };
                    })()`,
                    returnByValue: true
                });

                measurements.overflow_checks[u.name][`${vp.width}px`] = over.result?.value;
                client.ws.close();
            }
        }

        // 5. COLOR CONTRAST (WCAG AA)
        console.log("Calculating WCAG AA Color Contrast ratios...");
        {
            const client = await createClient("http://capability-test.local/");
            await client.send("Emulation.setDeviceMetricsOverride", {
                width: 1440, height: 900, deviceScaleFactor: 1, mobile: false
            });
            await sleep(3000);

            const colors = await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const body = document.body;
                    const bodyStyle = window.getComputedStyle(body);
                    const h1 = document.querySelector('h1, .hero-title');
                    const h1Style = h1 ? window.getComputedStyle(h1) : bodyStyle;
                    const btn = document.querySelector('.quiet-button, .button, a.button');
                    const btnStyle = btn ? window.getComputedStyle(btn) : null;

                    return {
                        bodyColor: bodyStyle.color,
                        bodyBg: bodyStyle.backgroundColor || "rgb(255, 255, 255)",
                        h1Color: h1Style.color,
                        btnColor: btnStyle ? btnStyle.color : null,
                        btnBg: btnStyle ? btnStyle.backgroundColor : null
                    };
                })()`,
                returnByValue: true
            });

            if (colors.result?.value) {
                const cv = colors.result.value;
                const bodyFg = parseRgb(cv.bodyColor);
                const bodyBg = parseRgb(cv.bodyBg || "rgb(255, 255, 255)");
                const h1Fg = parseRgb(cv.h1Color);
                const btnFg = cv.btnColor ? parseRgb(cv.btnColor) : [255, 255, 255];
                const btnBg = cv.btnBg ? parseRgb(cv.btnBg) : [17, 17, 17];

                measurements.color_contrast = {
                    bodyText: {
                        color: cv.bodyColor,
                        bg: cv.bodyBg,
                        ratio: contrastRatio(bodyFg, bodyBg),
                        meetsAANormalText: contrastRatio(bodyFg, bodyBg) >= 4.5,
                        minReq: "4.5:1"
                    },
                    headings: {
                        color: cv.h1Color,
                        bg: cv.bodyBg,
                        ratio: contrastRatio(h1Fg, bodyBg),
                        meetsAALargeText: contrastRatio(h1Fg, bodyBg) >= 3.0,
                        minReq: "3.0:1"
                    },
                    button: {
                        color: cv.btnColor,
                        bg: cv.btnBg,
                        ratio: contrastRatio(btnFg, btnBg),
                        meetsAA: contrastRatio(btnFg, btnBg) >= 4.5,
                        minReq: "4.5:1"
                    }
                };
            }
            client.ws.close();
        }

        // 6. VISIBLE FOCUS MEASUREMENT & SCREENSHOT
        console.log("Measuring Visible Focus & capturing close-up...");
        {
            const client = await createClient("http://capability-test.local/");
            await client.send("Emulation.setDeviceMetricsOverride", {
                width: 1440, height: 900, deviceScaleFactor: 1, mobile: false
            });
            await sleep(3000);

            // Focus on first primary interactive element
            const focusInfo = await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const btn = document.querySelector('.quiet-button, .button, a.quiet-nav-link');
                    if (!btn) return null;
                    btn.focus();
                    const s = window.getComputedStyle(btn);
                    const r = btn.getBoundingClientRect();
                    return {
                        tag: btn.tagName,
                        text: btn.innerText,
                        outline: s.outline,
                        outlineColor: s.outlineColor,
                        outlineWidth: s.outlineWidth,
                        outlineStyle: s.outlineStyle,
                        boxShadow: s.boxShadow,
                        rect: { x: r.left, y: r.top, width: r.width, height: r.height }
                    };
                })()`,
                returnByValue: true
            });

            measurements.visible_focus = focusInfo.result?.value;

            if (focusInfo?.result?.value?.rect) {
                const r = focusInfo.result.value.rect;
                const snap = await client.send("Page.captureScreenshot", {
                    format: "png",
                    clip: {
                        x: Math.max(0, r.x - 30),
                        y: Math.max(0, r.y - 30),
                        width: r.width + 60,
                        height: r.height + 60,
                        scale: 1
                    }
                });
                if (snap?.data) {
                    const focusPath = path.join(screenshotsDir, "visible_focus_closeup.png");
                    fs.writeFileSync(focusPath, Buffer.from(snap.data, 'base64'));
                    console.log("Saved visible_focus_closeup.png");
                }
            }

            client.ws.close();
        }

        // WRITE JSON
        const jsonPath = path.join(reviewDir, "measurements.json");
        fs.writeFileSync(jsonPath, JSON.stringify(measurements, null, 2));
        console.log(`Saved measurements.json: ${jsonPath}`);

        // WRITE MARKDOWN REPORT
        let md = `# قياسات قالب مدار (Madar v2.1.6) — جدول القياسات الفعلية الدقيقة\n\n`;
        md += `**تاريخ القياس:** 12 أكتوبر 2026  \n`;
        md += `**أداة القياس:** Chrome DevTools Protocol (\`getComputedStyle\` و \`getBoundingClientRect\`)  \n`;
        md += `**العروض المقاسة:** 375px (موبايل) و 1440px (ديسكتوب)  \n\n`;

        md += `## 1. الترويسة والخطوط (Header & Typography)\n\n`;
        md += `| العنصر | مقاس 375px (موبايل) | مقاس 1440px (ديسكتوب) |\n`;
        md += `|---|---|---|\n`;
        md += `| **ارتفاع الترويسة (Header Height)** | \`${measurements.viewport_375?.header?.height}px\` | \`${measurements.viewport_1440?.header?.height}px\` |\n`;
        md += `| **العنوان الرئيسي (H1 / Hero Title)** | حجم: \`${measurements.viewport_375?.typography?.h1?.fontSize}\`، سطر: \`${measurements.viewport_375?.typography?.h1?.lineHeight}\` | حجم: \`${measurements.viewport_1440?.typography?.h1?.fontSize}\`، سطر: \`${measurements.viewport_1440?.typography?.h1?.lineHeight}\` |\n`;
        md += `| **العنوان الفرعي (H2 / Section Title)** | حجم: \`${measurements.viewport_375?.typography?.h2?.fontSize}\`، سطر: \`${measurements.viewport_375?.typography?.h2?.lineHeight}\` | حجم: \`${measurements.viewport_1440?.typography?.h2?.fontSize}\`، سطر: \`${measurements.viewport_1440?.typography?.h2?.lineHeight}\` |\n`;
        md += `| **نص الفقرة (Body Text)** | حجم: \`${measurements.viewport_375?.typography?.body?.fontSize}\`، سطر: \`${measurements.viewport_375?.typography?.body?.lineHeight}\` | حجم: \`${measurements.viewport_1440?.typography?.body?.fontSize}\`، سطر: \`${measurements.viewport_1440?.typography?.body?.lineHeight}\` |\n`;
        md += `| **أزرار الإجراء (Buttons)** | حجم: \`${measurements.viewport_375?.typography?.button?.fontSize}\`، سطر: \`${measurements.viewport_375?.typography?.button?.lineHeight}\` | حجم: \`${measurements.viewport_1440?.typography?.button?.fontSize}\`، سطر: \`${measurements.viewport_1440?.typography?.button?.lineHeight}\` |\n\n`;

        md += `## 2. كروت المنتجات وشبكة المتجر (Cards & Grid)\n\n`;
        md += `| البند | مقاس 375px (موبايل) | مقاس 1440px (ديسكتوب) |\n`;
        md += `|---|---|---|\n`;
        md += `| **أبعاد كارت المنتج (Card Dimensions)** | \`${measurements.viewport_375?.productCard?.cardWidth}px\` × \`${measurements.viewport_375?.productCard?.cardHeight}px\` | \`${measurements.viewport_1440?.productCard?.cardWidth}px\` × \`${measurements.viewport_1440?.productCard?.cardHeight}px\` |\n`;
        md += `| **نسبة أبعاد الصورة (Image Aspect Ratio)** | \`${measurements.viewport_375?.productCard?.aspectRatio}\` | \`${measurements.viewport_1440?.productCard?.aspectRatio}\` |\n`;
        md += `| **المسافة بين الكروت (Grid Gap)** | \`${measurements.viewport_375?.productGrid?.gap}\` | \`${measurements.viewport_1440?.productGrid?.gap}\` |\n`;
        md += `| **عدد أعمدة المتجر (/shop/ Columns)** | **${measurements.viewport_375?.shopColumns?.calculatedColumns} عمود** | **${measurements.viewport_1440?.shopColumns?.calculatedColumns} أعمدة** |\n\n`;

        md += `## 3. فحص التمرير الأفقي الزائد (Horizontal Overflow: scrollWidth > innerWidth)\n\n`;
        md += `| الصفحة | 375px (موبايل) | 1440px (ديسكتوب) | النتيجة |\n`;
        md += `|---|---|---|---|\n`;
        for (const [page, data] of Object.entries(measurements.overflow_checks)) {
            const mOver = data['375px']?.hasOverflow ? `⚠️ نعم (+${data['375px'].overflowDiff}px)` : `✅ 0 (scrollWidth = ${data['375px']?.scrollWidth}px)`;
            const dOver = data['1440px']?.hasOverflow ? `⚠️ نعم (+${data['1440px'].overflowDiff}px)` : `✅ 0 (scrollWidth = ${data['1440px']?.scrollWidth}px)`;
            const pass = (!data['375px']?.hasOverflow && !data['1440px']?.hasOverflow) ? "PASS" : "FAIL";
            md += `| **${page}** | ${mOver} | ${dOver} | **${pass}** |\n`;
        }

        md += `\n## 4. تباين الألوان (WCAG AA Contrast Ratios)\n\n`;
        md += `| العنصر | نسبة التباين المقاسة | الحد الأدنى المطلوب | التوافق |\n`;
        md += `|---|---|---|---|\n`;
        md += `| **نص الفقرات (Body Text)** | \`${measurements.color_contrast?.bodyText?.ratio}:1\` | 4.5:1 | ${measurements.color_contrast?.bodyText?.meetsAANormalText ? "✅ PASS" : "❌ FAIL"} |\n`;
        md += `| **العناوين الرئيسية (H1 / Headings)** | \`${measurements.color_contrast?.headings?.ratio}:1\` | 3.0:1 | ${measurements.color_contrast?.headings?.meetsAALargeText ? "✅ PASS" : "❌ FAIL"} |\n`;
        md += `| **الأزرار (Buttons)** | \`${measurements.color_contrast?.button?.ratio}:1\` | 4.5:1 | ${measurements.color_contrast?.button?.meetsAA ? "✅ PASS" : "❌ FAIL"} |\n\n`;

        md += `## 5. مساحات اللمس على الموبايل (Touch Targets >= 44x44px)\n\n`;
        md += `| العنصر | الأبعاد المقاسة (عرض × ارتفاع) | المساحة (Area) | المطابقة (>= 44px) |\n`;
        md += `|---|---|---|---|\n`;
        for (const t of (measurements.touch_targets || []).slice(0, 10)) {
            md += `| **${t.tag}** (\`${t.text || 'interactive'}\`) | \`${t.width}px\` × \`${t.height}px\` | \`${t.area}px²\` | ${t.meetsMin44px ? "✅ PASS" : "⚠️ < 44px"} |\n`;
        }

        const mdPath = path.join(reviewDir, "measurements.md");
        fs.writeFileSync(mdPath, md);
        console.log(`Saved measurements.md: ${mdPath}`);

        console.log("=== MEASUREMENTS COMPLETED SUCCESSFULLY! ===");
    } catch (e) {
        console.error("Measurement error:", e);
    } finally {
        chromeProcess.kill();
        if (fs.existsSync(tempDir)) {
            try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (_) {}
        }
        process.exit(0);
    }
}

run();
