const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function main() {
    console.log('Getting authenticated org URL for Salesforce Navigation setup...');
    const out = execSync('sf org open --url-only --path "/lightning/setup/MobileAppsSFNav/home" --json').toString();
    const loginUrl = JSON.parse(out).result.url;

    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    console.log('Navigating to Salesforce Navigation Setup...');
    await page.goto(loginUrl, { waitUntil: 'load', timeout: 60000 });
    
    // Wait until iframe appears or page finishes loading
    console.log('Waiting for setup frame...');
    let setupFrame = null;
    for (let i = 0; i < 30; i++) {
        await page.waitForTimeout(2000);
        const frames = page.frames();
        for (const f of frames) {
            const u = f.url();
            if (u.includes('mobilenav') || u.includes('appmenu') || u.includes('servlet') || u.includes('setup') && f !== page.mainFrame()) {
                setupFrame = f;
                break;
            }
        }
        if (setupFrame) break;
        console.log(`Waiting... attempt ${i+1}, frames count: ${frames.length}`);
    }

    await page.screenshot({ path: 'scripts/mobilenav_setup_loaded.png' });

    if (!setupFrame) {
        console.log('No specific setup frame found, checking all frames...');
        for (const f of page.frames()) {
            console.log(`Frame URL: ${f.url()}`);
        }
        setupFrame = page;
    } else {
        console.log(`Found target frame: ${setupFrame.url()}`);
    }

    // Check selects in setupFrame
    const selects = await setupFrame.evaluate(() => {
        return Array.from(document.querySelectorAll('select')).map(s => ({
            id: s.id,
            name: s.name,
            options: Array.from(s.options).map(o => ({ value: o.value, text: o.text }))
        }));
    });
    console.log('Selects:', JSON.stringify(selects, null, 2));

    const avail = setupFrame.locator('select[id*="duel_select_0"]');
    if (await avail.isVisible({ timeout: 10000 }).catch(() => false)) {
        console.log('Selecting Field Sales App from Available...');
        await avail.selectOption({ label: 'Field Sales App' });
        await page.waitForTimeout(500);

        console.log('Clicking Add arrow...');
        await setupFrame.locator('a[id*="duel_select_0_right"], img.rightArrowIcon, [title="Add"]').first().click();
        await page.waitForTimeout(1000);

        // Move below Today:
        // Find Today index in duel_select_1
        const selOptions = await setupFrame.evaluate(() => {
            const s = document.querySelector('select[id*="duel_select_1"]');
            return Array.from(s ? s.options : []).map((o, idx) => ({ idx, text: o.text, val: o.value }));
        });
        console.log('Current Selected options:', selOptions);

        // If Field Sales App is at the bottom, select it and click up arrow until it is right below Today
        const todayIdx = selOptions.findIndex(o => o.text.toLowerCase().includes('today'));
        console.log(`Today index: ${todayIdx}`);

        const selBox = setupFrame.locator('select[id*="duel_select_1"]');
        await selBox.selectOption({ label: 'Field Sales App' });
        await page.waitForTimeout(500);

        const upArrow = setupFrame.locator('a[id*="duel_select_0_up"], img.upArrowIcon, [title="Up"]').first();
        // Click up arrow until right below Today
        for (let k = 0; k < 15; k++) {
            const currOptions = await setupFrame.evaluate(() => {
                const s = document.querySelector('select[id*="duel_select_1"]');
                return Array.from(s ? s.options : []).map((o, idx) => ({ idx, text: o.text }));
            });
            const fieldIdx = currOptions.findIndex(o => o.text.includes('Field Sales App'));
            const tIdx = currOptions.findIndex(o => o.text.toLowerCase().includes('today'));
            console.log(`Current: Today=${tIdx}, FieldSalesApp=${fieldIdx}`);
            if (fieldIdx === tIdx + 1) {
                console.log('Field Sales App is now directly below Today!');
                break;
            }
            if (fieldIdx > tIdx + 1) {
                await upArrow.click();
                await page.waitForTimeout(300);
            } else {
                break;
            }
        }

        console.log('Clicking Save...');
        await setupFrame.locator('input[type="submit"][value="Save"], button:has-text("Save"), input[name="save"]').first().click();
        await page.waitForTimeout(5000);
        console.log('Saved successfully!');
    } else {
        console.log('duel_select_0 was not found.');
    }

    await page.screenshot({ path: 'scripts/mobilenav_setup_done.png' });
    await browser.close();
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
