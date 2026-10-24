const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function check() {
    const out = execSync('sf org open -r -o friend_org --path "/p/own/OrgSharingDetail?setupid=SecuritySharing" --json', { encoding: 'utf8' });
    const { url } = JSON.parse(out).result;

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
    await page.goto(url, { waitUntil: 'networkidle' });
    const editBtn = page.locator('input[value="Edit"], input[name="edit"]').first();
    await editBtn.click();
    await page.waitForLoadState('networkidle');

    await page.selectOption('#p15___01IdM00000I48sg', '0');
    const saveBtn = page.locator('input[value="Save"], input[name="save"]').first();
    await saveBtn.click();
    await page.waitForTimeout(4000);

    const rowsWithErrors = await page.evaluate(() => {
        const trs = Array.from(document.querySelectorAll('tr'));
        return trs.filter(tr => tr.innerHTML.includes('errorMsg') || tr.innerHTML.includes('color: red') || tr.innerHTML.includes('Error:')).map(tr => tr.innerText);
    });
    console.log('Rows with errors:', rowsWithErrors);

    // Also find any element with style containing red or class error
    const anyErrors = await page.evaluate(() => {
        const all = Array.from(document.querySelectorAll('*'));
        return all.filter(el => {
            const style = el.getAttribute('style') || '';
            const cls = el.className || '';
            return (cls.includes('error') || style.includes('red') || cls.includes('Error')) && el.children.length === 0 && el.innerText.trim();
        }).map(el => ({ tag: el.tagName, class: el.className, text: el.innerText }));
    });
    console.log('Any errors:', anyErrors);

    await browser.close();
}

check().catch(console.error);
