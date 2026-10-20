const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function main() {
    const orgUrl = execSync('sf org open -r -o trailhead --json', { encoding: 'utf8' });
    const { url } = JSON.parse(orgUrl).result;

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    console.log('Navigating to Org...');
    await page.goto(url, { waitUntil: 'load' });
    await page.waitForTimeout(4000);

    console.log('Navigating to Sharing Settings Edit page...');
    await page.goto('https://creative-badger-i5mqnc-dev-ed.trailblaze.my.salesforce.com/p/own/OrgSharingDetail?setupid=SecuritySharing', { waitUntil: 'load' });
    await page.waitForTimeout(4000);

    // Look for Edit button
    const editBtn = page.locator('input[value="Edit"], input[name="edit"]').first();
    if (await editBtn.count() > 0) {
        console.log('Clicking Edit...');
        await editBtn.click();
        await page.waitForTimeout(5000);
    }

    console.log('Finding Interviewer select dropdown...');
    // Dump all selects and labels
    const selects = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('tr'));
        const matches = [];
        for (const r of rows) {
            if (r.innerText.includes('Interviewer')) {
                const s = r.querySelector('select');
                if (s) {
                    matches.push({ id: s.id, name: s.name, value: s.value, options: Array.from(s.options).map(o => ({ text: o.text, value: o.value })) });
                }
            }
        }
        return matches;
    });

    console.log('Restoring Lead to Public Read/Write/Transfer (value 8)...');
    await page.selectOption('#p3', '8');

    const targetSelect = selects.find(s => s.id.startsWith('p15')) || selects[selects.length - 1];
    if (targetSelect) {
        console.log(`Setting Interviewer select #${targetSelect.id} to Private (value 0)...`);
        await page.selectOption(`#${targetSelect.id}`, '0');
        await page.waitForTimeout(1000);

        console.log('Saving sharing settings...');
        const saveBtn = page.locator('input[value="Save"], input[name="save"]').first();
        await saveBtn.click();
        await page.waitForTimeout(8000);
        console.log('Saved successfully!');
    } else {
        await page.screenshot({ path: 'scratch_sharing_edit.png', fullPage: true });
        console.log('No select found, screenshot saved.');
    }

    await browser.close();
}

main().catch(console.error);
