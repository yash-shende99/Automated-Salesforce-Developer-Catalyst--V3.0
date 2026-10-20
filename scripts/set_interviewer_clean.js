const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function main() {
    console.log('Getting frontdoor URL for friend_org OrgSharingDetail...');
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

    // Find ONLY selects belonging to Interviewer (01IdM00000I48sg)
    const interviewerSelectIds = await page.evaluate(() => {
        const selects = Array.from(document.querySelectorAll('select[id*="01IdM00000I48sg"]'));
        return selects.map(s => ({ id: s.id, name: s.name, value: s.value, options: Array.from(s.options).map(o => ({ text: o.text, value: o.value })) }));
    });

    console.log('Found Interviewer selects:', JSON.stringify(interviewerSelectIds, null, 2));

    for (const sel of interviewerSelectIds) {
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
    await page.waitForTimeout(5000);

    console.log('Final URL:', page.url());
    await page.screenshot({ path: './scripts/interviewer_clean_saved.png' });
    await browser.close();
}

main().catch(console.error);
