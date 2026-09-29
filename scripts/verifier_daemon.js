const http = require('http');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PORT = 4567;
const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');

let browser = null;
let context = null;
let page = null;

async function initBrowser() {
    console.log('[Daemon] Initializing persistent Chromium worker in memory...');
    browser = await chromium.launch({ headless: true });
    
    let contextOptions = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    };
    if (fs.existsSync(AUTH_FILE)) {
        contextOptions.storageState = AUTH_FILE;
    }
    context = await browser.newContext(contextOptions);
    page = await context.newPage();
    console.log('[Daemon] Chromium worker is warm and standing by.');
}

async function verifyUnit(unitUrl) {
    const startTime = Date.now();
    console.log(`[Daemon] High-speed verifying: ${unitUrl}`);

    if (!page) {
        await initBrowser();
    }

    try {
        await page.goto(unitUrl, { waitUntil: 'domcontentloaded', timeout: 25000 });
        await page.waitForTimeout(3000);

        // Check if already completed
        const pageText = await page.evaluate(() => document.body.innerText);
        if (pageText.includes('Assessment Complete!') || pageText.includes('Retake this Step')) {
            return {
                success: true,
                message: 'Already completed',
                durationMs: Date.now() - startTime
            };
        }

        // Find Check Challenge button
        const checkBtn = page.locator('button:has-text("Verify step to earn"), button:has-text("Check Challenge"), button:has-text("Verify Step"), button:has-text("Verify")').first();
        const isVisible = await checkBtn.isVisible().catch(() => false);

        if (!isVisible) {
            return {
                success: false,
                error: 'Verification button not visible',
                durationMs: Date.now() - startTime
            };
        }

        const btnText = await checkBtn.innerText();
        console.log(`[Daemon] Clicking "${btnText}"...`);
        await checkBtn.click();

        // Poll for response
        for (let i = 0; i < 30; i++) {
            await page.waitForTimeout(1500);
            const currentText = await page.evaluate(() => document.body.innerText);

            if (currentText.includes('Assessment Complete!') || currentText.includes('Next step:')) {
                const durationMs = Date.now() - startTime;
                console.log(`[Daemon] VERIFIED in ${durationMs}ms!`);
                return { success: true, message: 'Challenge passed!', durationMs };
            }

            const errorMatch = currentText.match(/Step not yet complete in[^\n]+\n([^\n]+)/i) ||
                               currentText.match(/We couldn['’]t find[^\n]+/i) ||
                               currentText.match(/We can['’]t find[^\n]+/i);
            if (errorMatch) {
                const durationMs = Date.now() - startTime;
                console.log(`[Daemon] FAILED in ${durationMs}ms: ${errorMatch[0]}`);
                return { success: false, error: errorMatch[0], durationMs };
            }
        }

        return { success: false, error: 'Verification timed out', durationMs: Date.now() - startTime };
    } catch (err) {
        return { success: false, error: err.message, durationMs: Date.now() - startTime };
    }
}

const server = http.createServer(async (req, res) => {
    const reqUrl = new URL(req.url, `http://127.0.0.1:${PORT}`);

    if (reqUrl.pathname === '/verify') {
        const unitUrl = reqUrl.searchParams.get('url');
        if (!unitUrl) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Missing url parameter' }));
        }

        const result = await verifyUnit(unitUrl);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(result));
    }

    if (reqUrl.pathname === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ status: 'running', browserWarm: page !== null }));
    }

    res.writeHead(404);
    res.end();
});

server.listen(PORT, '127.0.0.1', async () => {
    console.log(`[Daemon] Verifier Daemon listening on http://127.0.0.1:${PORT}`);
    await initBrowser();
});
