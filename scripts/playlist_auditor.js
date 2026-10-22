const { chromium } = require('playwright');

async function auditPlaylist(url = 'https://trailhead.salesforce.com/users/trjha3/trailmixes/salesforce-developer-catalyst-v-3-0') {
    console.log(`[Auditor] Loading playlist text from: ${url}`);
    const browser = await chromium.launch({ headless: true });
    const fs = require('fs');
    const path = require('path');
    const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
    let contextOptions = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    };
    if (fs.existsSync(AUTH_FILE)) {
        console.log(`[Auditor] Loading logged-in session: ${AUTH_FILE}`);
        contextOptions.storageState = AUTH_FILE;
    }
    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        // Give 5 seconds for client-side hydration
        await page.waitForTimeout(5000);

        // Get full page text (the programmatic equivalent of Ctrl+A + Ctrl+C)
        const fullText = await page.evaluate(() => document.body.innerText);
        console.log(`[Auditor] Extracted full page text (${fullText.length} characters)`);

        // Parse overall trailmix progress
        const overallMatch = fullText.match(/(\d+)%\s*completed|(\d+)%\s*left|\b(\d+)%\b/i);

        // Parse individual items cleanly by Project/Module header
        const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);
        const moduleProgress = [];
        
        let currentItem = null;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line === 'Module' || line === 'Project' || line === 'Superbadge' || line === 'Trail') {
                if (currentItem) {
                    moduleProgress.push(currentItem);
                }
                const title = lines[i + 1] || 'Unknown';
                currentItem = {
                    type: line,
                    title: title,
                    status: '0%'
                };
            } else if (currentItem) {
                if (line.startsWith('Completed ')) {
                    currentItem.status = '100% (Completed)';
                    currentItem.completedDate = line.replace('Completed ', '');
                } else {
                    const progMatch = line.match(/^Progress:\s*(\d+%)/i);
                    if (progMatch) {
                        currentItem.status = progMatch[1];
                    }
                }
            }
        }
        if (currentItem) {
            moduleProgress.push(currentItem);
        }

        return {
            timestamp: new Date().toISOString(),
            totalItems: moduleProgress.length,
            completedCount: moduleProgress.filter(m => m.status.includes('100%') || m.status.includes('Completed')).length,
            moduleProgress
        };
    } catch (err) {
        console.error(`[Auditor Error]: ${err.message}`);
        return { error: err.message };
    } finally {
        await browser.close();
    }
}

if (require.main === module) {
    auditPlaylist().then(res => {
        console.log(JSON.stringify(res, null, 2));
    });
}

module.exports = { auditPlaylist };
