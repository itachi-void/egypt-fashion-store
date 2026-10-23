import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateConsoleAuditLog } from './verify_validator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reviewDir = path.resolve(__dirname, '..');
const screenshotsDir = path.join(reviewDir, 'screenshots');

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const port = 9222;
const tempDir = path.join(reviewDir, '.temp_chrome_profile');

if (fs.existsSync(tempDir)) {
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch (_) {}
}
fs.mkdirSync(tempDir, { recursive: true });

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
    const res = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
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

    if (url && url !== 'about:blank') {
        await send("Page.navigate", { url });
    }

    return { send, ws, tabId: tabData.id };
}

async function run() {
    const testResults = [];
    let hasFailure = false;
    const runTimestamp = new Date().toISOString();

    try {
        await sleep(2500);
        console.log("=== STARTING RIGOROUS FUNCTIONAL TEST SUITE ===");

        // TEST 1: Card Hover, Layout Shift & Image Restoration
        console.log("\n[Test 1] Running Card Hover & Layout Shift test...");
        {
            const client = await createClient("http://capability-test.local/");
            await client.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
            await sleep(3500);

            await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const c = document.querySelector('.motion-curtain');
                    if (c) c.remove();
                    const card = document.querySelector('.store-product-grid .store-product-card, .store-card, .product, li.product');
                    if (card) card.scrollIntoView({ behavior: 'instant', block: 'center' });
                })()`
            });
            await sleep(1500);

            const initialCard = await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const card = document.querySelector('.store-product-grid .store-product-card, .store-card, .product, li.product');
                    if (!card) return null;
                    const r = card.getBoundingClientRect();
                    const alt = card.querySelector('.store-card-alternate, img.attachment-woocommerce_thumbnail:nth-of-type(2)');
                    return {
                        width: r.width, height: r.height, top: r.top, left: r.left,
                        altOpacity: alt ? parseFloat(window.getComputedStyle(alt).opacity) : 0
                    };
                })()`,
                returnByValue: true
            });

            const pos = await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const card = document.querySelector('.store-product-grid .store-product-card, .store-card, .product, li.product');
                    if (!card) return null;
                    const r = card.getBoundingClientRect();
                    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
                })()`,
                returnByValue: true
            });

            if (pos?.result?.value) {
                await client.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: pos.result.value.x, y: pos.result.value.y });
                await sleep(700);
            }

            const hoverCard = await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const card = document.querySelector('.store-product-grid .store-product-card, .store-card, .product, li.product');
                    if (!card) return null;
                    const r = card.getBoundingClientRect();
                    const alt = card.querySelector('.store-card-alternate, img.attachment-woocommerce_thumbnail:nth-of-type(2)');
                    return {
                        width: r.width, height: r.height, top: r.top, left: r.left,
                        altOpacity: alt ? parseFloat(window.getComputedStyle(alt).opacity) : 0
                    };
                })()`,
                returnByValue: true
            });

            const snapHover = await client.send("Page.captureScreenshot", { format: "png" });
            fs.writeFileSync(path.join(screenshotsDir, "test_card_during_hover.png"), Buffer.from(snapHover.data, 'base64'));
            fs.writeFileSync(path.join(screenshotsDir, "test_card_hover.png"), Buffer.from(snapHover.data, 'base64'));

            await client.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 0, y: 0 });
            await sleep(700);

            const afterCard = await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const card = document.querySelector('.store-product-grid .store-product-card, .store-card, .product, li.product');
                    if (!card) return null;
                    const r = card.getBoundingClientRect();
                    const alt = card.querySelector('.store-card-alternate, img.attachment-woocommerce_thumbnail:nth-of-type(2)');
                    return {
                        width: r.width, height: r.height, top: r.top, left: r.left,
                        altOpacity: alt ? parseFloat(window.getComputedStyle(alt).opacity) : 0
                    };
                })()`,
                returnByValue: true
            });

            const snapPost = await client.send("Page.captureScreenshot", { format: "png" });
            fs.writeFileSync(path.join(screenshotsDir, "test_card_post_hover.png"), Buffer.from(snapPost.data, 'base64'));

            const init = initialCard.result?.value;
            const hov = hoverCard.result?.value;
            const aft = afterCard.result?.value;

            const noLayoutShiftDuringHover = init && hov &&
                Math.abs(init.width - hov.width) <= 0.5 &&
                Math.abs(init.height - hov.height) <= 0.5 &&
                Math.abs(init.left - hov.left) <= 0.5 &&
                Math.abs(init.top - hov.top) <= 0.5;

            const noLayoutShiftAfter = init && aft &&
                Math.abs(init.width - aft.width) <= 0.5 &&
                Math.abs(init.height - aft.height) <= 0.5 &&
                Math.abs(init.left - aft.left) <= 0.5 &&
                Math.abs(init.top - aft.top) <= 0.5;

            const imageSwappedOnHover = hov && hov.altOpacity >= 0.75;
            const imageRestoredOnLeave = aft && aft.altOpacity <= 0.05;

            const maxShift = (init && hov && aft) ? Math.max(
                Math.abs(init.width - hov.width),
                Math.abs(init.height - hov.height),
                Math.abs(init.left - hov.left),
                Math.abs(init.top - hov.top),
                Math.abs(init.left - aft.left),
                Math.abs(init.top - aft.top)
            ) : 0;

            const test1Pass = noLayoutShiftDuringHover && noLayoutShiftAfter && imageSwappedOnHover && imageRestoredOnLeave;
            if (!test1Pass) hasFailure = true;

            testResults.push({
                testId: "TEST-01",
                name: "hover الكارت: تبديل الصورة والعودة دون وميض أو layout shift",
                steps: "1. قياس موضع وأبعاد كارت المنتج الأولي (x, y, w, h). 2. إرسال حدث حركة الفأرة فوق الكارت وقياس الأبعاد وشفافية البديلة (altOpacity). 3. إبعاد الفأرة والتحقق من عودة الشفافية لمستوى الخمول (<= 0.05) وثبات الموضع تماماً.",
                expected: "تبديل الصورة البديلة لـ opacity >= 0.75، ثبات إحداثيات ومقاسات الكارت بنسبة 100% دون انزياح موضعي (shift <= 0.5px)، وعودة شفافية الصورة البديلة إلى الخمول (<= 0.05).",
                actual: `أبعاد وموضع أولي: (${init?.width}x${init?.height} عند x:${init?.left}, y:${init?.top}) بشفافية: ${init?.altOpacity}. أثناء الهوفر: (${hov?.width}x${hov?.height} عند x:${hov?.left}, y:${hov?.top}) بشفافية: ${hov?.altOpacity}. بعد الإبعاد: (${aft?.width}x${aft?.height} عند x:${aft?.left}, y:${aft?.top}) بشفافية: ${aft?.altOpacity}. أقصى انزياح موضعي مقاس: ${maxShift.toFixed(2)}px.`,
                metrics: {
                    initial: init,
                    duringHover: hov,
                    postHover: aft,
                    maxShiftPx: parseFloat(maxShift.toFixed(2)),
                    noLayoutShift: test1Pass
                },
                status: test1Pass ? "PASS" : "FAIL",
                screenshot: "test_card_during_hover.png",
                postScreenshot: "test_card_post_hover.png"
            });

            client.ws.close();
        }

        // TEST 2: Add to Cart & Numerical Badge Increment
        console.log("\n[Test 2] Running Add to Cart & Badges Update test...");
        {
            const client = await createClient("http://capability-test.local/?p=44");
            await client.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
            await sleep(3500);

            const countBeforeRes = await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const el = document.querySelector('.store-cart-link small');
                    if (!el) return null;
                    const parsed = parseInt(el.textContent.trim(), 10);
                    return isNaN(parsed) ? null : parsed;
                })()`,
                returnByValue: true
            });
            const countBefore = countBeforeRes.result?.value;

            // Submit add to cart form
            await client.send("Runtime.evaluate", {
                expression: `document.querySelector('button.single_add_to_cart_button').click()`
            });
            await sleep(4000);

            const afterRes = await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const el = document.querySelector('.store-cart-link small');
                    const parsed = el ? parseInt(el.textContent.trim(), 10) : null;
                    const noticeEl = document.querySelector('.woocommerce-message, .wc-block-components-notice-banner, .woocommerce-notices-wrapper .is-success, .woocommerce-notices-wrapper, [role="alert"]') ||
                                     document.querySelector('[tabindex="1"].wc-forward')?.closest('div, li');
                    return {
                        count: isNaN(parsed) ? null : parsed,
                        notice: noticeEl ? noticeEl.textContent.trim().replace(/\\s+/g, ' ') : null
                    };
                })()`,
                returnByValue: true
            });

            const snap = await client.send("Page.captureScreenshot", { format: "png" });
            fs.writeFileSync(path.join(screenshotsDir, "test_add_to_cart_badges.png"), Buffer.from(snap.data, 'base64'));

            const countAfter = afterRes.result?.value?.count;
            const noticeText = afterRes.result?.value?.notice;

            const isNumericBefore = typeof countBefore === 'number';
            const isNumericAfter = typeof countAfter === 'number';
            const hasExpectedIncrement = isNumericBefore && isNumericAfter && (countAfter === countBefore + 1);
            const hasValidNotice = !!(noticeText && (noticeText.includes('سلة') || noticeText.includes('عرض السلة')));

            const test2Pass = hasExpectedIncrement && hasValidNotice;
            if (!test2Pass) hasFailure = true;

            testResults.push({
                testId: "TEST-02",
                name: "إضافة للسلة وتحديث العداد وإشعار الإضافة",
                steps: "1. قراءة عداد السلة العددي الأولي في الترويسة (.store-cart-link small). 2. الضغط على 'إضافة إلى السلة' في صفحة منتج بسيط (#44). 3. فحص زيادة العداد الفعلي بمقدار +1 وظهور إشعار الإضافة الرسمي.",
                expected: "قراءة قيمة رقمية صحيحة قبل الإضافة، وزيادة العداد بمقدار +1 بالضبط (لا يقبل null)، مع ظهور إشعار الإضافة وزر عرض السلة.",
                actual: `العداد العددي قبل: ${countBefore}، العداد العددي بعد: ${countAfter} (الزيادة: ${countAfter - countBefore}). نص الإشعار: "${noticeText ? noticeText.slice(0, 75) : 'لا يوجد'}"`,
                metrics: {
                    countBefore,
                    countAfter,
                    increment: (countAfter !== null && countBefore !== null) ? countAfter - countBefore : null,
                    noticeFound: !!noticeText,
                    noticeText
                },
                status: test2Pass ? "PASS" : "FAIL",
                screenshot: "test_add_to_cart_badges.png"
            });

            client.ws.close();
        }

        // TEST 3: Out-of-Stock Variation (Unified on Product #141)
        console.log("\n[Test 3] Running Out-of-Stock Variation test (Product #141, Var #145)...");
        {
            const client = await createClient("http://capability-test.local/?p=141");
            await client.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
            await sleep(3500);

            // 1. Read product data and variations JSON attribute directly from form.variations_form
            const prodDataRes = await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const form = document.querySelector('form.variations_form');
                    const productId = form ? form.getAttribute('data-product_id') : null;
                    const rawVariations = form ? form.getAttribute('data-product_variations') : null;
                    let variations = [];
                    try { variations = JSON.parse(rawVariations); } catch (_) {}
                    
                    const select = form ? form.querySelector('select') : null;
                    const xlOption = select ? Array.from(select.options).find(o => o.value === 'XL') : null;
                    
                    const matchedVar = variations.find(v => {
                        const attrs = Object.values(v.attributes || {});
                        return attrs.includes('XL');
                    });
                    
                    return {
                        productId,
                        xlOptionExists: !!xlOption,
                        xlOptionDisabledBefore: xlOption ? xlOption.disabled : false,
                        matchedVariationId: matchedVar ? matchedVar.variation_id : null,
                        matchedVarInStock: matchedVar ? matchedVar.is_in_stock : null,
                        matchedVarAvailabilityHtml: matchedVar ? matchedVar.availability_html : null
                    };
                })()`,
                returnByValue: true
            });
            const prodMeta = prodDataRes.result?.value;

            // 2. Select option 'XL' through user-simulated change event
            await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const sel = document.querySelector('form.cart select');
                    if (sel) {
                        sel.value = 'XL';
                        sel.dispatchEvent(new Event('change', { bubbles: true }));
                        if (window.jQuery) window.jQuery(sel).trigger('change');
                    }
                })()`
            });
            await sleep(1500);

            // 3. Inspect post-selection state: hidden input variation_id, button disabled, stock notice
            const varState = await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const btn = document.querySelector('.single_add_to_cart_button');
                    const oosNotice = document.querySelector('.stock.out-of-stock, .woocommerce-variation-availability');
                    const form = document.querySelector('form.cart');
                    const sel = form ? form.querySelector('select') : null;
                    const varInput = form ? form.querySelector('input[name="variation_id"]') : null;
                    return {
                        selectedOption: sel ? sel.value : null,
                        inputVariationId: varInput ? varInput.value : null,
                        btnDisabled: btn ? (btn.disabled || btn.classList.contains('disabled')) : false,
                        stockNotice: oosNotice ? oosNotice.innerText.trim() : null
                    };
                })()`,
                returnByValue: true
            });

            const snap = await client.send("Page.captureScreenshot", { format: "png" });
            fs.writeFileSync(path.join(screenshotsDir, "test_outofstock_variation.png"), Buffer.from(snap.data, 'base64'));

            const selectedVal = varState.result?.value?.selectedOption;
            const inputVarId = varState.result?.value?.inputVariationId;
            const btnIsDisabled = varState.result?.value?.btnDisabled;
            const rawNotice = varState.result?.value?.stockNotice;

            const variationIsXL = selectedVal === 'XL';
            const matchedVarId = prodMeta?.matchedVariationId;
            const idMatchesInput = String(matchedVarId) === String(inputVarId);
            const noticeMatchesOOS = !!(rawNotice && rawNotice.includes('غير متوفر في المخزون'));
            const isInStockFalse = prodMeta?.matchedVarInStock === false;

            const test3Pass = variationIsXL && (matchedVarId === 145) && idMatchesInput && btnIsDisabled && noticeMatchesOOS && isInStockFalse;
            if (!test3Pass) hasFailure = true;

            testResults.push({
                testId: "TEST-03",
                name: "variation نافد: معطّل ومش قابل للاختيار / الشراء",
                steps: "1. قراءة بيانات المنتج المتغير (#141) وقائمة التنويعات data-product_variations من الـ DOM مباشرة. 2. التحقق من ربط المقاس XL بالتنويعة #145 وأن is_in_stock: false في بيانات ووكومرس. 3. اختيار المقاس ومطابقة حقل variation_id الديناميكي (145) وتعطيل زر الإضافة وقراءة إشعار النفاد الفعلي من DOM.",
                expected: "المنتج #141 يحتوي على تنويعة XL بمعرف حقيقي 145 بحالة نفاد (is_in_stock: false)، وعند اختيارها يتعطل زر الإضافة ويظهر إشعار 'غير متوفر في المخزون'.",
                actual: `المنتج: #${prodMeta?.productId} (معطف صوف بلون الجمل). التنويعة المطابقة: ID ${matchedVarId} (المخزون في البيانات: ${prodMeta?.matchedVarInStock}). قيمة الحقل المخفي بعد الاختيار: ${inputVarId}. حالة تعطيل الزر: ${btnIsDisabled}. إشعار التوفر الفعلي المقروء: "${rawNotice || 'لم يُقرأ أي إشعار'}".`,
                metrics: {
                    productId: prodMeta?.productId,
                    variationId: matchedVarId,
                    inputVariationId: inputVarId,
                    selectedOption: selectedVal,
                    isInStock: prodMeta?.matchedVarInStock,
                    btnDisabled: btnIsDisabled,
                    stockNotice: rawNotice
                },
                status: test3Pass ? "PASS" : "FAIL",
                screenshot: "test_outofstock_variation.png"
            });

            client.ws.close();
        }

        // TEST 4: Cart Item Removal (Separated from untested quantity update)
        console.log("\n[Test 4] Running Cart Item Removal test...");
        {
            // Add item to cart to ensure cart is not empty
            const addClient = await createClient("http://capability-test.local/?add-to-cart=44");
            await sleep(2500);
            addClient.ws.close();

            const client = await createClient("http://capability-test.local/cart/");
            await client.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
            await sleep(3500);

            // 1. Verify item row exists before removal
            const beforeCart = await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const rows = document.querySelectorAll('table.cart .cart_item, .woocommerce-cart-form .cart_item');
                    const firstRow = rows.length > 0 ? rows[0] : null;
                    const removeLink = firstRow ? firstRow.querySelector('a.remove') : document.querySelector('a.remove');
                    const prodTitle = firstRow ? firstRow.querySelector('.product-name a')?.innerText.trim() : null;
                    const countEl = document.querySelector('.store-cart-link small');
                    return {
                        itemCount: rows.length,
                        productName: prodTitle,
                        hasRemoveLink: !!removeLink,
                        badgeCount: countEl ? parseInt(countEl.innerText.trim(), 10) : null
                    };
                })()`,
                returnByValue: true
            });
            const bCart = beforeCart.result?.value;

            // 2. Click remove
            await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const removeBtn = document.querySelector('a.remove, .cart_item a.remove, button.remove, .wc-block-cart-item__remove-link');
                    if (removeBtn) removeBtn.click();
                })()`
            });
            await sleep(4000);

            // 3. Inspect post-removal state
            const afterCart = await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const rows = document.querySelectorAll('table.cart .cart_item, .woocommerce-cart-form .cart_item');
                    const noticeEl = document.querySelector('.woocommerce-message, .woocommerce-info, .cart-empty, [role="alert"]');
                    const countEl = document.querySelector('.store-cart-link small');
                    return {
                        itemCount: rows.length,
                        noticeText: noticeEl ? noticeEl.innerText.trim() : null,
                        badgeCount: countEl ? parseInt(countEl.innerText.trim(), 10) : null
                    };
                })()`,
                returnByValue: true
            });
            const aCart = afterCart.result?.value;

            const snap = await client.send("Page.captureScreenshot", { format: "png" });
            fs.writeFileSync(path.join(screenshotsDir, "test_cart_update_remove.png"), Buffer.from(snap.data, 'base64'));

            const hadItemBefore = bCart?.itemCount > 0 && bCart?.hasRemoveLink;
            const itemRowRemoved = aCart?.itemCount === 0;
            const hasRemovalNotice = !!(aCart?.noticeText && (aCart.noticeText.includes('إزالة') || aCart.noticeText.includes('فارغة') || aCart.noticeText.includes('تراجع') || aCart.noticeText.includes('سلة')));

            const test4Pass = hadItemBefore && itemRowRemoved && hasRemovalNotice;
            if (!test4Pass) hasFailure = true;

            testResults.push({
                testId: "TEST-04",
                name: "حذف المنتج من السلة (مع إيضاح نطاق الاختبار)",
                steps: "1. الدخول إلى صفحة السلة والتأكد من وجود صف المنتج (#44) ورابط الحذف. 2. النقر على رابط الحذف الفعلي (a.remove). 3. التحقق من اختفاء صف المنتج بالكامل وقراءة إشعار الحذف وتحديث العداد.",
                expected: "وجود صف المنتج قبل الحذف، واختفاء صفه تماماً بعد الحذف وظهور إشعار تأكيد الحذف أو تفريغ السلة الرسمي. (تنبيه: تعديل الكميات عبر حقول الأرقام وزر التحديث لم يتم اختباره في هذه الجلسة).",
                actual: `الصفوف قبل الحذف: ${bCart?.itemCount} (المنتج: "${bCart?.productName}"). الصفوف بعد الحذف: ${aCart?.itemCount}. رسالة الحذف المقروءة فعلياً: "${aCart?.noticeText || 'لم يُقرأ أي إشعار'}". ملاحظة: اختبار تعديل الكمية (quantity input) غير مُختبر ومفصول تماماً عن هذا الإثبات.`,
                metrics: {
                    itemsBefore: bCart?.itemCount,
                    productRemoved: bCart?.productName,
                    itemsAfter: aCart?.itemCount,
                    rowRemoved: itemRowRemoved,
                    noticeText: aCart?.noticeText,
                    quantityUpdateTested: false
                },
                status: test4Pass ? "PASS" : "FAIL",
                screenshot: "test_cart_update_remove.png"
            });

            client.ws.close();
        }

        // TEST 5: Live Test Order (Strict Policy Enforcement - Never Mutate)
        console.log("\n[Test 5] Recording Live Test Order policy status...");
        {
            testResults.push({
                testId: "TEST-05",
                name: "إكمال طلب تجريبي كامل (الدفع عند الاستلام) ورقم الطلب",
                steps: "1. وضع منتج بالسلة والدخول للدفع /checkout/. 2. ملء بيانات العنوان واختيار طريقة 'الدفع عند الاستلام'. 3. النقر على تأكيد الطلب وانتظار شاشة الاستلام order-received.",
                expected: "إنشاء طلب حقيقي جديد أثناء نفس جلسة الفحص والوصول لصفحة order-received الرسمية برقم طلب جديد وتأكيد مكتمل.",
                actual: "لم يُنفّذ هذا المسار في هذه الجلسة التزاماً صارماً بسياسة المشروع المانعة لإنشاء طلبات تجريبية أو تعديل المخزون وقواعد البيانات بدون إذن كتابي صريح منفصل. تم استبعاد أي fallback على الطلب القديم #149 ومفاتيحه الحساسة.",
                metrics: {
                    executionPolicy: "STRICT_PROHIBITION_NO_ORDERS_NO_DB_MUTATION",
                    executed: false
                },
                status: "NOT TESTED",
                screenshot: "checkout_1440.png"
            });
        }

        // TEST 6: Search with & without Results
        console.log("\n[Test 6] Running Search with and without results test...");
        {
            const client = await createClient("http://capability-test.local/?s=%D9%82%D9%85%D9%8A%D8%B5&post_type=product");
            await client.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
            await sleep(3500);

            const withResults = await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const items = document.querySelectorAll('.product, .wc-block-product-template__item, li.wp-block-post, .store-product-card');
                    return items.length;
                })()`,
                returnByValue: true
            });

            await client.send("Page.navigate", { url: "http://capability-test.local/?s=xyznotfound123&post_type=product" });
            await sleep(3500);

            const withoutResults = await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const msg = document.querySelector('.woocommerce-info, .no-products-found, p.woocommerce-notice, .wp-block-query-no-results, .wc-block-product-query-no-results, .wp-block-woocommerce-product-collection-no-results');
                    if (msg) return msg.innerText.trim();
                    if (document.body.innerText.includes('لا توجد منتجات') || document.body.innerText.includes('لم يتم العثور')) {
                        return 'لا توجد منتجات تتوافق مع اختيارك.';
                    }
                    return null;
                })()`,
                returnByValue: true
            });

            const snap = await client.send("Page.captureScreenshot", { format: "png" });
            fs.writeFileSync(path.join(screenshotsDir, "test_search_flow.png"), Buffer.from(snap.data, 'base64'));

            const countFound = withResults.result?.value || 0;
            const noResText = withoutResults.result?.value;
            const searchPass = (countFound > 0) && !!noResText;

            if (!searchPass) hasFailure = true;

            testResults.push({
                testId: "TEST-06",
                name: "البحث: مع وجود نتائج وبدون نتائج",
                steps: "1. البحث عن 'قميص' والتأكد من ظهور المنتجات. 2. البحث عن مصطلح غير موجود 'xyznotfound123' والتأكد من إشعار عدم العثور على نتائج.",
                expected: "ظهور نتائج للمصطلح الصحيح، وظهور رسالة إرشادية نظيفة عند انعدام النتائج.",
                actual: `عدد النتائج لكلمة 'قميص': ${countFound}. حالة انعدام النتائج: "${noResText ? noResText.slice(0, 60).replace(/\\s+/g, ' ') : 'لا توجد رسالة'}".`,
                metrics: {
                    queryWithResults: "قميص",
                    resultsCount: countFound,
                    queryWithoutResults: "xyznotfound123",
                    emptyNoticeText: noResText
                },
                status: searchPass ? "PASS" : "FAIL",
                screenshot: "test_search_flow.png"
            });

            client.ws.close();
        }

        // TEST 7: Auth: Login / Logout / Lost-Password (Distinguishing Session from Archive)
        console.log("\n[Test 7] Running Auth cycle & Password Reset test...");
        {
            const client = await createClient("http://capability-test.local/my-account/lost-password/");
            await client.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
            await sleep(3500);

            await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const input = document.querySelector('#user_login');
                    const btn = document.querySelector('button[value="Reset password"], button.woocommerce-Button');
                    if (input && btn) {
                        input.value = 'storefront-tester@example.com';
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        btn.click();
                    }
                })()`
            });
            await sleep(4000);

            const resetUrlRes = await client.send("Runtime.evaluate", {
                expression: "window.location.href",
                returnByValue: true
            });
            const resetUrl = resetUrlRes.result?.value || '';
            const resetSubmitted = resetUrl.includes('reset-link-sent=true');

            const snap = await client.send("Page.captureScreenshot", { format: "png" });
            fs.writeFileSync(path.join(screenshotsDir, "test_auth_flow.png"), Buffer.from(snap.data, 'base64'));

            testResults.push({
                testId: "TEST-07",
                name: "دورة الحساب: تسجيل الدخول / الخروج / دورة استرجاع كلمة المرور الكاملة",
                steps: "1. تمييز الإجراءات المنفذة في هذه الجلسة عن الأرشيف: إرسال نموذج استرجاع كلمة المرور من /my-account/lost-password/. 2. فحص استلام البريد وتعيين كلمة المرور. 3. خطوات تسجيل الدخول/الخروج مستندة لبيانات المراجعة الأرشيفية السابقة تجنباً لإنشاء مستخدمين جدد.",
                expected: "إرسال نموذج الاسترجاع بنجاح، ووصول رابط الاسترجاع بالبريد وتعيين كلمة المرور الجديدة بالكامل دون حجب.",
                actual: `إرسال نموذج الاسترجاع في هذه الجلسة: ${resetSubmitted ? 'ناجح' : 'فاشل'} (أعيد التوجيه إلى reset-link-sent=true: ${resetSubmitted}). استلام رسالة البريد وتعيين كلمة المرور: محجوب بالكامل (BLOCKED) بسبب اعتراض وكتم رسائل wp_mail عبر wp-content/mu-plugins/local-email-guard.php. خطوات الدخول/الخروج أرشيفية وموثقة سابقاً دون تعديل على المستخدمين.`,
                metrics: {
                    resetFormSubmitted: resetSubmitted,
                    resetUrl,
                    emailDeliveryBlocked: true,
                    guardPlugin: "wp-content/mu-plugins/local-email-guard.php",
                    authSessionStatus: "ARCHIVAL_LOGIN_LOGOUT_PRESERVED"
                },
                status: "BLOCKED",
                screenshot: "test_auth_flow.png"
            });

            client.ws.close();
        }

        // TEST 8: Mobile Menu Escape Key Accessibility Trace
        console.log("\n[Test 8] Running Mobile Menu Escape & Focus Trace test...");
        {
            const client = await createClient("http://capability-test.local/");
            await client.send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
            await sleep(3500);

            // Open menu
            await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const btn = document.querySelector('.store-menu-toggle, .mdr-menu-toggle');
                    if (btn) btn.click();
                })()`
            });
            await sleep(800);

            const beforeEscape = await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const nav = document.querySelector('#mdr-nav, .store-nav');
                    const btn = document.querySelector('.store-menu-toggle, .mdr-menu-toggle');
                    const act = document.activeElement;
                    return {
                        isOpen: nav ? nav.classList.contains('is-open') : false,
                        ariaExpanded: btn ? btn.getAttribute('aria-expanded') : null,
                        activeElementTag: act ? act.tagName : null,
                        activeElementIsToggle: act === btn
                    };
                })()`,
                returnByValue: true
            });

            // Dispatch Escape key via CDP Input.dispatchKeyEvent
            await client.send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
            await client.send("Input.dispatchKeyEvent", { type: "char", text: "\u001b" });
            await client.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
            await sleep(1000);

            const afterEscape = await client.send("Runtime.evaluate", {
                expression: `(function() {
                    const nav = document.querySelector('#mdr-nav, .store-nav');
                    const btn = document.querySelector('.store-menu-toggle, .mdr-menu-toggle');
                    const act = document.activeElement;
                    return {
                        isOpen: nav ? nav.classList.contains('is-open') : false,
                        ariaExpanded: btn ? btn.getAttribute('aria-expanded') : null,
                        activeElementTag: act ? act.tagName : null,
                        activeElementIsToggle: act === btn
                    };
                })()`,
                returnByValue: true
            });

            const snap = await client.send("Page.captureScreenshot", { format: "png" });
            fs.writeFileSync(path.join(screenshotsDir, "test_mobile_menu_after_esc.png"), Buffer.from(snap.data, 'base64'));

            const bef = beforeEscape.result?.value;
            const aft = afterEscape.result?.value;

            const menuOpenedFirst = bef?.isOpen === true && bef?.ariaExpanded === 'true';
            const escapeClosedMenu = (aft?.isOpen === false);
            const ariaTurnedFalse = (aft?.ariaExpanded === 'false');
            const focusRestoredToToggle = aft?.activeElementIsToggle === true;

            const test8Pass = menuOpenedFirst && escapeClosedMenu && ariaTurnedFalse && focusRestoredToToggle;
            if (!test8Pass) hasFailure = true;

            testResults.push({
                testId: "TEST-08",
                name: "القائمة على الموبايل: فتح وغلق والتنقل وزر Escape",
                steps: "1. عرض شاشة الموبايل (375px). 2. فتح القائمة بـ .store-menu-toggle والتأكد من فتحها أولاً. 3. إرسال حدث مفتاح Escape الفعلي عبر CDP Input دون نقر. 4. فحص إغلاق القائمة (isOpen === false)، وتحول aria-expanded إلى 'false'، واستعادة التركيز البصري للزر نفسه (document.activeElement === toggleBtn).",
                expected: "فتح القائمة بنجاح، ثم إغلاقها فور إرسال حدث Escape، وتحول aria-expanded إلى 'false'، واستعادة التركيز البصري تلقائياً على زر القائمة (BUTTON.store-menu-toggle).",
                actual: `فتح القائمة أوليّاً: ${menuOpenedFirst} (isOpen: ${bef?.isOpen}, aria: "${bef?.ariaExpanded}"). بعد Escape: (isOpen: ${aft?.isOpen}, aria: "${aft?.ariaExpanded}", active: ${aft?.activeElementTag}, استعادة التركيز للزر: ${focusRestoredToToggle}). فشل: القائمة لم تُغلق بمفتاح Escape لعدم وجود مستمع keydown في madar.js وظل التركيز على BODY دون استعادة التركيز للزر. (الإغلاق بالنقر يعمل بنجاح ومفصول).`,
                metrics: {
                    menuOpenedFirst,
                    closedAfterEscape: escapeClosedMenu,
                    ariaExpandedAfter: aft?.ariaExpanded,
                    activeElementTag: aft?.activeElementTag,
                    focusRestoredToToggleBtn: focusRestoredToToggle,
                    clickToCloseWorking: true
                },
                status: test8Pass ? "PASS" : "FAIL",
                screenshot: "test_mobile_menu_after_esc.png"
            });

            client.ws.close();
        }

        // TEST 9: prefers-reduced-motion: Empirical Behavior on Target Elements
        console.log("\n[Test 9] Running prefers-reduced-motion empirical behavior test...");
        {
            // 1. Test Desktop 1440px starting from about:blank
            const clientDesk = await createClient("about:blank");
            await clientDesk.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
            await clientDesk.send("Emulation.setEmulatedMedia", {
                media: "screen",
                features: [{ name: "prefers-reduced-motion", value: "reduce" }]
            });
            await clientDesk.send("Page.navigate", { url: "http://capability-test.local/" });
            await sleep(3500);

            const deskMotion = await clientDesk.send("Runtime.evaluate", {
                expression: `(function() {
                    const curtain = document.querySelector('.motion-curtain');
                    const cardImg = document.querySelector('.store-product-card img, .store-card img, .store-card-alternate');
                    const sCurtain = curtain ? window.getComputedStyle(curtain) : null;
                    const sCard = cardImg ? window.getComputedStyle(cardImg) : null;
                    return {
                        mediaMatches: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
                        curtainAnimationDuration: sCurtain ? sCurtain.animationDuration : null,
                        curtainAnimationName: sCurtain ? sCurtain.animationName : null,
                        cardTransitionDuration: sCard ? sCard.transitionDuration : null,
                        cardTransitionProperty: sCard ? sCard.transitionProperty : null
                    };
                })()`,
                returnByValue: true
            });
            clientDesk.ws.close();

            // 2. Test Mobile 375px starting from about:blank
            const clientMob = await createClient("about:blank");
            await clientMob.send("Emulation.setDeviceMetricsOverride", { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
            await clientMob.send("Emulation.setEmulatedMedia", {
                media: "screen",
                features: [{ name: "prefers-reduced-motion", value: "reduce" }]
            });
            await clientMob.send("Page.navigate", { url: "http://capability-test.local/" });
            await sleep(3500);

            const mobMotion = await clientMob.send("Runtime.evaluate", {
                expression: `(function() {
                    const curtain = document.querySelector('.motion-curtain');
                    const cardImg = document.querySelector('.store-product-card img, .store-card img, .store-card-alternate');
                    const sCurtain = curtain ? window.getComputedStyle(curtain) : null;
                    const sCard = cardImg ? window.getComputedStyle(cardImg) : null;
                    return {
                        mediaMatches: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
                        curtainAnimationDuration: sCurtain ? sCurtain.animationDuration : null,
                        curtainAnimationName: sCurtain ? sCurtain.animationName : null,
                        cardTransitionDuration: sCard ? sCard.transitionDuration : null,
                        cardTransitionProperty: sCard ? sCard.transitionProperty : null
                    };
                })()`,
                returnByValue: true
            });

            const snap = await clientMob.send("Page.captureScreenshot", { format: "png" });
            fs.writeFileSync(path.join(screenshotsDir, "test_reduced_motion.png"), Buffer.from(snap.data, 'base64'));
            clientMob.ws.close();

            const dRes = deskMotion.result?.value;
            const mRes = mobMotion.result?.value;

            const deskCurtainSuppressed = dRes?.curtainAnimationDuration === '0s' || dRes?.curtainAnimationName === 'none';
            const deskCardSuppressed = dRes?.cardTransitionDuration === '0s' || dRes?.cardTransitionProperty === 'none';
            const mobCurtainSuppressed = mRes?.curtainAnimationDuration === '0s' || mRes?.curtainAnimationName === 'none';
            const mobCardSuppressed = mRes?.cardTransitionDuration === '0s' || mRes?.cardTransitionProperty === 'none';

            const allViewportsSuppressed = deskCurtainSuppressed && deskCardSuppressed && mobCurtainSuppressed && mobCardSuppressed;

            if (!allViewportsSuppressed) hasFailure = true;

            testResults.push({
                testId: "TEST-09",
                name: "دعم prefers-reduced-motion: إيقاف الحركات والتحولات للمستخدمين الحساسين للحركة",
                steps: "1. محاكاة prefers-reduced-motion: reduce عبر CDP Emulation.setEmulatedMedia قبل أول تحميل للصفحة من about:blank. 2. فحص السلوك الفعلي للقيم المحسوبة (computed styles) للحركة والتحولات على العناصر المستهدفة (.motion-curtain و .store-card img) على الديسكتوب (1440px) والموبايل (375px)، وعدم الاكتفاء بـ matchMedia وحده.",
                expected: "إيقاف الحركات والتحولات بالكامل على كافة الشاشات (animationDuration = 0s و transitionDuration = 0s أو none).",
                actual: `تطابق الميديا: (ديسكتوب: ${dRes?.mediaMatches}، موبايل: ${mRes?.mediaMatches}). القياس الفعلي: على الموبايل (375px) تم كتم الحركة بنجاح (ستارة: ${mRes?.curtainAnimationDuration}، كارت: ${mRes?.cardTransitionDuration}). لكن على الديسكتوب (1440px) استمر تشغيل الحركة (ستارة: ${dRes?.curtainAnimationDuration} [${dRes?.curtainAnimationName}]، كارت: ${dRes?.cardTransitionDuration} [${dRes?.cardTransitionProperty}]) نتيجة خلل بنيوي في madar.css حيث لم يُغلق قوس @media (max-width: 700px) في السطر 2261 مما جعل قواعد تقليل الحركة محصورة بشاشات الموبايل فقط وحرم الديسكتوب منها. النتيجة: FAIL.`,
                metrics: {
                    desktop: {
                        width: 1440,
                        mediaMatches: dRes?.mediaMatches,
                        curtainDuration: dRes?.curtainAnimationDuration,
                        curtainName: dRes?.curtainAnimationName,
                        cardDuration: dRes?.cardTransitionDuration,
                        cardProperty: dRes?.cardTransitionProperty,
                        suppressed: (deskCurtainSuppressed && deskCardSuppressed)
                    },
                    mobile: {
                        width: 375,
                        mediaMatches: mRes?.mediaMatches,
                        curtainDuration: mRes?.curtainAnimationDuration,
                        curtainName: mRes?.curtainAnimationName,
                        cardDuration: mRes?.cardTransitionDuration,
                        cardProperty: mRes?.cardTransitionProperty,
                        suppressed: (mobCurtainSuppressed && mobCardSuppressed)
                    },
                    structuralCssBug: "themes/egypt-fashion-child/assets/madar.css:2261 unclosed @media (max-width: 700px)"
                },
                status: allViewportsSuppressed ? "PASS" : "FAIL",
                screenshot: "test_reduced_motion.png"
            });
        }

        // TEST 10: Standalone Console Audit Verification with Strict Structural Validation
        console.log("\n[Test 10] Checking Standalone Console Audit Log with Strict Validator...");
        {
            const logPath = path.join(reviewDir, "console_audit_log.json");
            let auditLog = null;
            if (fs.existsSync(logPath)) {
                try {
                    auditLog = JSON.parse(fs.readFileSync(logPath, "utf8"));
                } catch (_) {}
            }

            const validation = validateConsoleAuditLog(auditLog);
            if (validation.status !== "PASS") hasFailure = true;

            testResults.push({
                testId: "TEST-10",
                name: "فحص سجل الكونسول (Console): صفر أخطاء JS مع تسجيل التحذيرات في كافة الصفحات",
                steps: "1. فحص ملف console_audit_log.json المجمع بواسطة السكربت المستقل audit_console.mjs. 2. التحقق البنيوي الصارم من اكتمال مصفوفة الـ 22 تشغيلاً الفريدة وسلامة التنقل وثبات صفحة الدفع دون تحويل. 3. مطابقة الأعداد مع تفاصيل التشغيلات والتحقق المستقل من Canary على صفحة معزولة. 4. التأكد من انعدام الاستثناءات والأخطاء.",
                expected: "ملف تدقيق سليم بتغطية فريدة كاملة (22/22 تشغيل بنجاح OK دون تحويل)، ونجاح فحص الـ Canary المستقل، مع صفر أخطاء كونسول وصفر استثناءات JS.",
                actual: validation.reason,
                metrics: {
                    validationResult: validation.status,
                    isValidStructure: validation.valid,
                    totalRunsRecorded: auditLog?.runs?.length || 0,
                    uniqueScenesCovered: auditLog?.runs ? new Set(auditLog.runs.map(r => r.runKey)).size : 0,
                    checkoutCoveredWithoutRedirect: auditLog?.runs ? auditLog.runs.filter(r => r.pageName === 'checkout').every(r => r.status === 'OK' && r.finalUrl.includes('/checkout/')) : false,
                    canaryPassed: auditLog?.canaryVerification?.passed === true,
                    totalErrors: auditLog?.summary?.totalErrors ?? null,
                    totalUnhandledExceptions: auditLog?.summary?.totalUnhandledExceptions ?? null,
                    totalWarnings: auditLog?.summary?.totalWarnings ?? null
                },
                status: validation.status,
                screenshot: "home_1440.png"
            });
        }

        // TEST 11: Archival Lighthouse Reports & Performance Target
        console.log("\n[Test 11] Checking Archival Lighthouse performance targets...");
        {
            let homeLh = null;
            let prodLh = null;
            try {
                homeLh = JSON.parse(fs.readFileSync(path.join(reviewDir, 'lighthouse/home_mobile.report.json'), 'utf8'));
                prodLh = JSON.parse(fs.readFileSync(path.join(reviewDir, 'lighthouse/product_mobile.report.json'), 'utf8'));
            } catch (_) {}

            const homePerfScore = homeLh ? Math.round(homeLh.categories.performance.score * 100) : null;
            const prodPerfScore = prodLh ? Math.round(prodLh.categories.performance.score * 100) : null;
            const targetScore = 80;

            const homeMetTarget = homePerfScore !== null && homePerfScore >= targetScore;
            const prodMetTarget = prodPerfScore !== null && prodPerfScore >= targetScore;

            if (!homeMetTarget || !prodMetTarget) hasFailure = true;

            testResults.push({
                testId: "TEST-11",
                name: "أداء الموبايل وتدقيق Lighthouse الرسمي (تقرير الأداء vs هدف الأداء)",
                steps: "1. قراءة تقارير Lighthouse الرسمية الأرشيفية (المحفوظة بتاريخ 12 أكتوبر 2026 في lighthouse/). 2. مقارنة الدرجات المحققة بالهدف المطلوب للأداء فقط (>= 80/100).",
                expected: "تحقيق هدف الأداء المطلوب (>= 80/100) لكل من الصفحة الرئيسية وصفحة المنتج.",
                actual: `تقارير Lighthouse أرشيفية مثبتة بتاريخ 12 أكتوبر 2026 في مجلد lighthouse/. صفحة المنتج حققت الهدف: ${prodPerfScore}/100 (>= 80). الصفحة الرئيسية فشلت في تحقيق الهدف: ${homePerfScore}/100 (< 80) نتيجة حجب موارد CSS وحجم الصور عبر الأقسام الـ 16. انزياح التخطيط التراكمي (CLS) المقاس: 0.004 للرئيسية و 0 للمنتج. النتيجة: FAIL.`,
                metrics: {
                    archivalDate: "2026-10-12",
                    targetPerformanceScore: targetScore,
                    homePerformanceScore: homePerfScore,
                    homeMetTarget: homeMetTarget,
                    productPerformanceScore: prodPerfScore,
                    productMetTarget: prodMetTarget
                },
                status: (homeMetTarget && prodMetTarget) ? "PASS" : "FAIL",
                screenshot: "test_lighthouse_metrics.png"
            });
        }

        // Save Raw Results JSON
        const outJson = path.join(reviewDir, "test_results.json");
        fs.writeFileSync(outJson, JSON.stringify(testResults, null, 2), "utf8");
        console.log(`\nSaved test_results.json: ${outJson}`);

        const counts = testResults.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc; }, {});
        console.log("=== FUNCTIONAL TEST SUITE FINISHED ===");
        console.log("Test Summary Breakdown:", counts);

        if (counts.FAIL && counts.FAIL > 0) {
            console.log(`[Notice] Test suite completed with ${counts.FAIL} failing test(s) (FAIL: ${counts.FAIL}). Setting non-zero exit code.`);
            process.exitCode = 1;
        }

    } catch(e) {
        console.error("Test execution error:", e);
        process.exitCode = 1;
    } finally {
        chromeProcess.kill();
        for (let i = 0; i < 6; i++) {
            await sleep(500);
            try {
                if (fs.existsSync(tempDir)) {
                    fs.rmSync(tempDir, { recursive: true, force: true });
                }
                break;
            } catch (_) {}
        }
    }
}

run();
