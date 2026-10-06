const fs = require('fs');
const { chromium } = require('playwright');

async function main() {
    const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
    const cookies = auth.cookies || [];
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    const orgId = 23983359;
    const res = await fetch(`https://trailhead.salesforce.com/launch_org/${orgId}`, {
        headers: {
            'Cookie': cookieHeader,
            'User-Agent': 'Mozilla/5.0'
        },
        redirect: 'manual'
    });

    const location = res.headers.get('location');
    const parsedUrl = new URL(location);
    const sid = parsedUrl.searchParams.get('sid').trim();
    const domain = parsedUrl.hostname;
    console.log(`SID obtained! Domain: ${domain}`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    });

    // Add cookie
    await context.addCookies([
        { name: 'sid', value: sid, domain: domain, path: '/', httpOnly: false, secure: true }
    ]);

    const page = await context.newPage();
    console.log('Navigating directly to /setup/ui/tabcustomname.apexp...');
    await page.goto(`https://${domain}/setup/ui/tabcustomname.apexp`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Landed on URL:', page.url());
    console.log('Title:', await page.title());

    const content = await page.content();
    fs.writeFileSync('scripts/scratch/direct_tab.html', content);
    console.log('Saved direct_tab.html (length:', content.length, ')');

    if (content.includes('Accounts') || content.includes('Account')) {
        console.log('Contains Account!');
        const editLink = page.locator('tr:has-text("Accounts") a:has-text("Edit"), tr:has-text("Account") a:has-text("Edit")').first();
        if (await editLink.count() > 0) {
            console.log('Found edit link! Clicking...');
            await editLink.click();
            await page.waitForTimeout(3000);
            console.log('Page after edit:', page.url(), await page.title());

            const nextBtn = page.locator('input[value="Next"], input[title="Next"], input[name="goNext"]').first();
            if (await nextBtn.count() > 0) {
                console.log('Clicking Next...');
                await nextBtn.click();
                await page.waitForTimeout(3000);
            }

            console.log('Looking for Rating row...');
            const ratingRow = page.locator('tr:has-text("Rating")').first();
            if (await ratingRow.count() > 0) {
                console.log('Found Rating row!');
                const input = ratingRow.locator('input[type="text"]').first();
                console.log('Current val:', await input.inputValue());
                await input.fill('Prospect Rating');
                console.log('Filled Prospect Rating!');

                const saveBtn = page.locator('input[value="Save"], input[title="Save"], input[name="save"]').first();
                await saveBtn.click();
                await page.waitForTimeout(5000);
                console.log('SAVED SUCCESSFULLY!');
            }
        }
    }

    await browser.close();
    console.log('Done test!');
}

main().catch(console.error);
