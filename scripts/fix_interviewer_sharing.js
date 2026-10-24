const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function fixInterviewerSharing() {
    const out = execSync('sf org open -r -o friend_org --path "/p/own/OrgSharingDetail?setupid=SecuritySharing" --json', { encoding: 'utf8' });
    const { url } = JSON.parse(out).result;

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
    const page = await context.newPage();

    page.on('dialog', async dialog => {
        console.log('[DIALOG]', dialog.message());
        await dialog.accept();
    });

    console.log('Navigating to OrgSharingDetail...');
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    
    // Click Edit
    const editBtn = page.locator('input[value="Edit"], input[name="edit"]').first();
    await editBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find all selects in the Interviewer row
    const interviewerSelects = await page.evaluate(() => {
        const trs = Array.from(document.querySelectorAll('tr'));
        for (const tr of trs) {
            if (tr.innerText.includes('Interviewer') && tr.querySelector('select')) {
                const selects = Array.from(tr.querySelectorAll('select'));
                return selects.map(s => ({ id: s.id, name: s.name, value: s.value }));
            }
        }
        return [];
    });

    console.log('Interviewer selects in row:', interviewerSelects);

    for (const sel of interviewerSelects) {
        console.log(`Setting #${sel.id} to Private ('0')...`);
        await page.selectOption(`#${sel.id}`, '0');
    }
    await page.waitForTimeout(1000);

    console.log('Clicking Save...');
    const saveBtn = page.locator('input[value="Save"], input[name="save"]').first();
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 40000 }).catch(e => console.log('Navigation:', e.message)),
        saveBtn.click()
    ]);
    await page.waitForTimeout(4000);

    console.log('Saved! Current URL:', page.url());
    await page.screenshot({ path: './scripts/interviewer_saved.png' });
    await browser.close();
}

fixInterviewerSharing().catch(console.error);
