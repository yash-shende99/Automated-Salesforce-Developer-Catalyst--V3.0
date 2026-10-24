const { chromium } = require('playwright');
const { execSync } = require('child_process');

async function cloneStandardUserToHRRecruiter() {
  const urlRes = execSync('sf org open -r -o trailhead --json', { encoding: 'utf8' });
  const frontdoorUrl = JSON.parse(urlRes).result.url;
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto(frontdoorUrl, { waitUntil: 'load' });
  await page.waitForTimeout(3000);

  // 1. Get Standard User Profile Id
  const stdUserQuery = execSync('sf data query -q "SELECT Id FROM Profile WHERE Name = \'Standard User\'" -o trailhead --json', { encoding: 'utf8' });
  const stdUserId = JSON.parse(stdUserQuery).result.records[0].Id;
  console.log('Standard User Profile Id:', stdUserId);

  // 2. Open clone URL in Classic setup
  const cloneUrl = `https://creative-badger-i5mqnc-dev-ed.trailblaze.my.salesforce.com/00e/e?clone=1&clonename=Standard%20User&clonedId=${stdUserId}`;
  await page.goto(cloneUrl, { waitUntil: 'load' });
  await page.waitForTimeout(3000);

  console.log('Filling Profile Name with HR Recruiter...');
  // The input field is usually name="ProfileName" or id="ProfileName"
  const input = page.locator('input[name="ProfileName"], input[id*="ProfileName"], input[id*="Name"]').first();
  await input.fill('HR Recruiter');

  const saveBtn = page.locator('input[name="save"], input[value="Save"]').first();
  await saveBtn.click();
  console.log('Clicked Save!');
  await page.waitForTimeout(5000);

  console.log('Post-save URL:', page.url());
  await browser.close();
}

cloneStandardUserToHRRecruiter().catch(console.error);
