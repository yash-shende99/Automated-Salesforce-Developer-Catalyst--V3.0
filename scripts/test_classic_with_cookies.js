const fs = require('fs');
const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function test() {
    console.log('Getting frontdoor URL from sf org open...');
    const out = JSON.parse(execSync('sf org open -p "/setup/ui/tabcustomname.apexp" -r --json -o friend_org').toString());
    const frontdoorUrl = out.result.url;

    // Fetch frontdoorUrl with redirect: 'manual' to get all cookies
    console.log('Fetching frontdoor URL to collect all auth cookies...');
    const res = await fetch(frontdoorUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' },
        redirect: 'manual'
    });

    const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie')].filter(Boolean);
    const domain = new URL(frontdoorUrl).hostname;
    console.log('Domain:', domain);
    console.log('Collected set-cookie headers:', setCookies.length);

    const cookiesToSet = [];
    for (const sc of setCookies) {
        const parts = sc.split(';');
        const [k, ...vParts] = parts[0].split('=');
        const v = vParts.join('=');
        cookiesToSet.push({
            name: k.trim(),
            value: v.trim(),
            domain: domain,
            path: '/',
            httpOnly: false,
            secure: true
        });
        console.log('Setting cookie:', k.trim());
    }

    console.log('Launching browser with full cookie jar...');
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        viewport: { width: 1440, height: 900 }
    });
    await context.addCookies(cookiesToSet);

    const page = await context.newPage();
    const classicUrl = `https://${domain}/setup/ui/tabcustomname.apexp`;
    console.log('Navigating directly to Classic URL:', classicUrl);

    await page.goto(classicUrl, { waitUntil: 'domcontentloaded', timeout: 35000 }).catch(e => console.log('Goto err:', e.message));
    await page.waitForTimeout(4000);

    console.log('Landed on URL:', page.url());
    console.log('Page Title:', await page.title());

    const content = await page.content();
    fs.writeFileSync('scripts/scratch/classic_full_cookies.html', content);
    console.log('Saved page content (length:', content.length, ')');

    if (content.includes('Account')) {
        console.log('SUCCESS: Page contains Account! Looking for Edit link...');
        const editLink = page.locator('tr:has-text("Accounts") a:has-text("Edit"), tr:has-text("Account") a:has-text("Edit")').first();
        if (await editLink.count() > 0) {
            console.log('Found Account edit link! Clicking...');
            await editLink.click();
            await page.waitForTimeout(4000);
            console.log('Landed on Step 1:', page.url(), await page.title());

            const nextBtn = page.locator('input[value="Next"], input[title="Next"], input[name="goNext"]').first();
            if (await nextBtn.count() > 0) {
                console.log('Clicking Next...');
                await nextBtn.click();
                await page.waitForTimeout(4000);
                console.log('Landed on Step 2:', page.url(), await page.title());

                const ratingRow = page.locator('tr:has-text("Rating")').first();
                if (await ratingRow.count() > 0) {
                    console.log('Found Rating row! Changing to Prospect Rating...');
                    const input = ratingRow.locator('input[type="text"]').first();
                    console.log('Current value:', await input.inputValue());
                    await input.fill('Prospect Rating');
                    console.log('Filled Prospect Rating!');

                    const saveBtn = page.locator('input[value="Save"], input[title="Save"], input[name="save"]').first();
                    await saveBtn.click();
                    await page.waitForTimeout(5000);
                    console.log('SAVED SUCCESSFULLY!');
                }
            }
        }
    }

    await browser.close();
}

test().catch(console.error);
