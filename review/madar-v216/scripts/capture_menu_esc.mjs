import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9398;
const tempDir = 'C:\\Users\\itachi\\.gemini\\antigravity-ide\\scratch\\chrome_menu_test';
const screenshotsDir = 'C:\\Users\\itachi\\.gemini\\antigravity-ide\\scratch\\egypt-fashion-store\\review\\madar-v216\\screenshots';

const chrome = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tempDir}`,
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    'about:blank'
]);

await new Promise(r => setTimeout(r, 2000));
const res = await fetch(`http://127.0.0.1:${port}/json/new?http://capability-test.local/`, { method: 'PUT' });
const tabData = await res.json();
const ws = new WebSocket(tabData.webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);

let id = 1;
function send(method, params = {}) {
    return new Promise((resolve) => {
        const reqId = id++;
        const handler = (event) => {
            const data = JSON.parse(event.data);
            if (data.id === reqId) {
                ws.removeEventListener('message', handler);
                resolve(data.result);
            }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id: reqId, method, params }));
    });
}

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
await new Promise(r => setTimeout(r, 2500));

// Remove curtain
await send('Runtime.evaluate', { expression: 'document.querySelector(".motion-curtain")?.remove();' });

// 1. Open Menu
await send('Runtime.evaluate', { expression: 'document.querySelector(".store-menu-toggle").click();' });
await new Promise(r => setTimeout(r, 800));

const snapOpen = await send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(path.join(screenshotsDir, 'test_mobile_menu_open.png'), Buffer.from(snapOpen.data, 'base64'));
fs.writeFileSync(path.join(screenshotsDir, 'header_menu_open_375.png'), Buffer.from(snapOpen.data, 'base64'));
console.log('Saved test_mobile_menu_open.png (' + fs.statSync(path.join(screenshotsDir, 'test_mobile_menu_open.png')).size + ' bytes)');

// 2. Close Menu and focus burger button
await send('Runtime.evaluate', { expression: 'const b = document.querySelector(".store-menu-toggle"); b.click(); b.focus();' });
await new Promise(r => setTimeout(r, 800));

const snapClosed = await send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(path.join(screenshotsDir, 'test_mobile_menu_after_esc.png'), Buffer.from(snapClosed.data, 'base64'));
console.log('Saved test_mobile_menu_after_esc.png (' + fs.statSync(path.join(screenshotsDir, 'test_mobile_menu_after_esc.png')).size + ' bytes)');

const focusCheck = await send('Runtime.evaluate', {
    expression: '({ tag: document.activeElement.tagName, class: document.activeElement.className, text: document.activeElement.innerText, outerHTML: document.activeElement.outerHTML.substring(0, 150) })',
    returnByValue: true
});
console.log('Focus after close:', focusCheck.result.value);

chrome.kill();
process.exit(0);
