const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');

async function main() {
    const out = execSync('sf org open -r -o friend_org --path "/p/own/OrgSharingDetail?setupid=SecuritySharing" --json', { encoding: 'utf8' });
    const { url } = JSON.parse(out).result;

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(3000);

    // Click Edit
    const editBtn = page.locator('input[value="Edit"], input[name="edit"]').first();
    await editBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const html = await page.content();
    fs.writeFileSync('./scripts/sharing_edit.html', html, 'utf8');
    await page.screenshot({ path: './scripts/sharing_edit.png', fullPage: true });

    // Look for all occurrences of Interviewer in the page
    const interviewerRows = await page.evaluate(() => {
        const trs = Array.from(document.querySelectorAll('tr'));
        return trs.filter(tr => tr.innerText.includes('Interviewer')).map(tr => tr.innerHTML);
    });

    console.log('Interviewer rows count:', interviewerRows.length);
    if (interviewerRows.length > 0) {
        console.log('Interviewer row HTML:', interviewerRows[0]);
    }
    await browser.close();
}

main().catch(console.error);
