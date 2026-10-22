import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9399;
const tempDir = 'C:\\Users\\itachi\\.gemini\\antigravity-ide\\scratch\\chrome_lh_snap';
const screenshotsDir = 'C:\\Users\\itachi\\.gemini\\antigravity-ide\\scratch\\egypt-fashion-store\\review\\madar-v216\\screenshots';
const htmlPath = 'file:///' + path.resolve('review/madar-v216/lighthouse/home_mobile.report.html').replace(/\\/g, '/');

const chrome = spawn(chromePath, [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tempDir}`,
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    'about:blank'
]);

await new Promise(r => setTimeout(r, 2000));
const res = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(htmlPath)}`, { method: 'PUT' });
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
await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 800, deviceScaleFactor: 1, mobile: false });
await new Promise(r => setTimeout(r, 2500));

const snap = await send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(path.join(screenshotsDir, 'test_lighthouse_metrics.png'), Buffer.from(snap.data, 'base64'));
console.log('Saved authentic test_lighthouse_metrics.png from HTML report! Size: ' + fs.statSync(path.join(screenshotsDir, 'test_lighthouse_metrics.png')).size + ' bytes');

chrome.kill();
process.exit(0);
