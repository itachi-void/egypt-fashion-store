import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const screenshotsDir = 'C:\\Users\\itachi\\.gemini\\antigravity-ide\\scratch\\egypt-fashion-store\\review\\madar-v216\\screenshots';
const recaptureData = JSON.parse(fs.readFileSync('C:\\Users\\itachi\\.gemini\\antigravity-ide\\scratch\\egypt-fashion-store\\review\\madar-v216\\recapture_data.json', 'utf8'));

// 1. TOUCH TARGETS UNDER 44px
const rawTouch = recaptureData.touchTargetsUnder44 || [];
const uniqueMap = new Map();

rawTouch.forEach(item => {
    // ignore skip links (1x1)
    if (item.selector.includes('skip-link') || (item.width <= 1 && item.height <= 1)) return;
    const key = `${item.selector}|${item.page}|${item.width}x${item.height}`;
    if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
    }
});

const touchList = Array.from(uniqueMap.values());
console.log(`Found ${touchList.length} unique touch target issues under 44px.`);

// Generate Touch Targets Markdown Table
let touchTable = '| العنصر / Selector | العنصر البصري | المقاس الفعلي (عرض × ارتفاع) | الصفحة | معيار الحد الأدنى |\n';
touchTable += '|---|---|---|---|---|\n';
touchList.slice(0, 30).forEach(t => {
    touchTable += `| \`${t.selector}\` | ${t.text || t.tag} | **${t.width}px × ${t.height}px** | \`${t.page}\` | 44px × 44px |\n`;
});
fs.writeFileSync('C:\\Users\\itachi\\.gemini\\antigravity-ide\\scratch\\egypt-fashion-store\\review\\madar-v216\\touch_targets_table.md', touchTable, 'utf8');

// 2. SHA-256 HASHES & DUPLICATE CHECK
const files = fs.readdirSync(screenshotsDir).filter(f => f.endsWith('.png'));
const hashes = {};
const duplicates = {};

files.forEach(f => {
    const data = fs.readFileSync(path.join(screenshotsDir, f));
    const h = crypto.createHash('sha256').update(data).digest('hex');
    if (hashes[h]) {
        if (!duplicates[h]) duplicates[h] = [hashes[h]];
        duplicates[h].push(f);
    } else {
        hashes[h] = f;
    }
});

console.log('\n=== SHA-256 DUPLICATE REPORT ===');
const dupReport = [];
if (Object.keys(duplicates).length === 0) {
    console.log('Zero duplicates found! Every single screenshot has a distinct SHA-256.');
} else {
    for (const [h, list] of Object.entries(duplicates)) {
        console.log(`Duplicate Hash ${h.substring(0, 12)}: ${list.join(' <=> ')}`);
        dupReport.push({ hash: h, files: list });
    }
}

// 3. COMPARE VIEWPORT VS FULL SIZES
console.log('\n=== VIEWPORT VS FULL-PAGE COMPARISON ===');
const pairs = [
    'home_1440', 'shop_1440', 'category_kids_1440', 'category_men_1440',
    'product_simple_1440', 'product_variable_1440', 'cart_1440', 'checkout_1440',
    'my_account_logged_out_1440', 'lost_password_1440', 'search_results_1440', 'search_empty_1440',
    'home_375', 'shop_375', 'category_kids_375', 'category_men_375',
    'product_simple_375', 'product_variable_375', 'cart_375', 'checkout_375'
];

pairs.forEach(p => {
    const vpFile = path.join(screenshotsDir, `${p}.png`);
    const fullFile = path.join(screenshotsDir, `${p}_full.png`);
    if (fs.existsSync(vpFile) && fs.existsSync(fullFile)) {
        const vpBuf = fs.readFileSync(vpFile);
        const fullBuf = fs.readFileSync(fullFile);
        const vpH = vpBuf.readUInt32BE(20);
        const fullH = fullBuf.readUInt32BE(20);
        const vpSize = vpBuf.length;
        const fullSize = fullBuf.length;
        const passHeight = fullH >= vpH;
        console.log(`${p.padEnd(25)}: VP ${vpH}px (${vpSize}B) -> FULL ${fullH}px (${fullSize}B) [Height OK: ${passHeight}]`);
    }
});
