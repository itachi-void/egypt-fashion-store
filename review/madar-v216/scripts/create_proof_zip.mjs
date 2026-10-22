import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const stagingDir = 'C:\\Users\\itachi\\.gemini\\antigravity-ide\\scratch\\proof_staging';
const reviewDir = 'C:\\Users\\itachi\\.gemini\\antigravity-ide\\scratch\\egypt-fashion-store\\review\\madar-v216';
const themesDir = 'C:\\Users\\itachi\\.gemini\\antigravity-ide\\scratch\\egypt-fashion-store\\themes\\egypt-fashion-child';
const zipPath = path.join(reviewDir, 'madar-v216-proof.zip');

if (fs.existsSync(stagingDir)) {
    fs.rmSync(stagingDir, { recursive: true, force: true });
}
fs.mkdirSync(stagingDir, { recursive: true });

function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src, { withFileTypes: true }).forEach(entry => {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

console.log('Copying screenshots...');
copyDir(path.join(reviewDir, 'screenshots'), path.join(stagingDir, 'screenshots'));

console.log('Copying scripts...');
copyDir(path.join(reviewDir, 'scripts'), path.join(stagingDir, 'scripts'));

console.log('Copying lighthouse...');
copyDir(path.join(reviewDir, 'lighthouse'), path.join(stagingDir, 'lighthouse'));

console.log('Copying theme...');
copyDir(themesDir, path.join(stagingDir, 'themes', 'egypt-fashion-child'));

console.log('Copying individual report and data files...');
['measurements.json', 'measurements.md', 'test_results.json', 'report.md', 'git_status_and_log.txt', 'touch_targets_table.md', 'recapture_data.json'].forEach(f => {
    const p = path.join(reviewDir, f);
    if (fs.existsSync(p)) fs.copyFileSync(p, path.join(stagingDir, f));
});

if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
}

console.log('Compressing to ' + zipPath + '...');
const psCmd = `powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory('${stagingDir}', '${zipPath}')"`;
execSync(psCmd, { stdio: 'inherit' });

const stat = fs.statSync(zipPath);
console.log(`Zip successfully created! Size: ${stat.size} bytes (${(stat.size / (1024 * 1024)).toFixed(2)} MB)`);
