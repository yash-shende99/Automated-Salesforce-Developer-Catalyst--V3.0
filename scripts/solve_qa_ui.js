const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function main() {
    console.log('[QA-UI] Getting org frontdoor URL...');
    const out = JSON.parse(execSync('sf org open -r --json -o friend_org').toString());
    const loginUrl = out.result.url;
    const origin = new URL(loginUrl).origin;

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    console.log('[QA-UI] Opening frontdoor...');
    await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);

    // Get Candidate__c durableId / object ID from Tooling API
    const objQuery = JSON.parse(execSync('sf data query --query "SELECT DurableId FROM EntityDefinition WHERE QualifiedApiName = \'Candidate__c\'" --use-tooling-api --json').toString());
    const durableId = objQuery.result.records[0].DurableId;
    console.log('[QA-UI] Candidate DurableId:', durableId);

    const classicObjUrl = `${origin}/${durableId}?setupid=CustomObjects`;
    console.log('[QA-UI] Navigating to Classic object page:', classicObjUrl);
    await page.goto(classicObjUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    
    // Wait for table or button
    try {
        await page.waitForSelector('table tbody tr', { timeout: 15000 });
        console.log('[QA-UI] Table rendered successfully!');
    } catch (e) {
        console.log('[QA-UI] Table selector timed out, waiting 5s more...');
        await page.waitForTimeout(5000);
    }

    await page.screenshot({ path: 'scratch/candidate_actions_list.png' });
    console.log('[QA-UI] Saved candidate_actions_list.png');

    const actions = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('table tbody tr')).map(r => r.innerText.replace(/\s+/g, ' ').trim());
    });
    console.log('[QA-UI] Found action rows:', actions);

    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('[QA-UI] Has "New Job App"?', bodyText.includes('New Job App'));

    await browser.close();
}

main().catch(console.error);
