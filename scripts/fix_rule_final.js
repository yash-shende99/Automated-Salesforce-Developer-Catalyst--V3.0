const { chromium } = require('playwright');
const { execSync } = require('child_process');

(async () => {
  const urlRes = execSync('sf org open -r -o trailhead --json', { encoding: 'utf8' });
  const frontdoorUrl = JSON.parse(urlRes).result.url;
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
  await page.goto(frontdoorUrl, { waitUntil: 'load' });
  await page.waitForTimeout(3000);

  page.on('dialog', async dialog => {
    console.log('Dialog:', dialog.message());
    await dialog.accept();
  });

  // 1. Delete the bad rule 03Fg8000001T2FZ
  console.log('1. Deleting old rule...');
  await page.goto('https://creative-badger-i5mqnc-dev-ed.trailblaze.my.salesforce.com/p/own/OrgSharingDetail?setupid=SecuritySharing', { waitUntil: 'load' });
  await page.waitForTimeout(3000);

  await page.evaluate(() => {
    const tables = Array.from(document.querySelectorAll('table.list'));
    for (const t of tables) {
      if (t.innerText.includes('Campus Outreach')) {
        const link = Array.from(t.querySelectorAll('a')).find(a => a.innerText.trim() === 'Del');
        if (link) link.click();
      }
    }
  });
  await page.waitForTimeout(5000);

  // 2. Open new rule form
  console.log('2. Opening new rule form...');
  await page.goto('https://creative-badger-i5mqnc-dev-ed.trailblaze.my.salesforce.com/setup/own/shareRule.jsp?entity=a0A', { waitUntil: 'load' });
  await page.waitForTimeout(3000);

  // 3. Fill Rule Label and clean Rule Dev Name
  console.log('3. Filling Label and Rule Name...');
  await page.locator('#ruleName').fill('Campus Outreach Programs');
  await page.locator('#ruleName').blur();
  await page.waitForTimeout(500);

  // Ensure ruleDevName is EXACTLY Campus_Outreach_Programs
  await page.locator('#ruleDevName').fill('');
  await page.locator('#ruleDevName').fill('Campus_Outreach_Programs');
  const finalDevName = await page.locator('#ruleDevName').inputValue();
  console.log('Verified ruleDevName input value:', finalDevName);

  // 4. Select Criteria
  console.log('4. Selecting Criteria type...');
  await page.locator('#p11criteriaSharingRule').check();
  await page.waitForTimeout(1000);

  // 5. Criteria fields
  console.log('5. Setting Criteria fields...');
  await page.locator('#critfld1').selectOption({ label: 'Type' });
  await page.waitForTimeout(500);
  await page.locator('#critop1').selectOption({ value: 'e' });
  await page.locator('#pVAL1').fill('Campus Outreach');

  // 6. Share with Roles -> Recruiter
  console.log('6. Setting Share with...');
  await page.locator('#sharedwith').selectOption({ label: 'Roles' });
  await page.waitForTimeout(1000);
  await page.locator('#sharedwith_A').selectOption({ label: 'Recruiter' });

  // 7. Access Level: Read/Write
  console.log('7. Setting Access Level...');
  await page.locator('#p3').selectOption({ value: '2' }); // Read/Write

  // 8. Save
  console.log('8. Saving...');
  await page.locator('input[name="save"]').first().click();
  await page.waitForTimeout(6000);

  console.log('Saved! Checking result on OrgSharingDetail...');
  await page.goto('https://creative-badger-i5mqnc-dev-ed.trailblaze.my.salesforce.com/p/own/OrgSharingDetail?setupid=SecuritySharing', { waitUntil: 'load' });
  await page.waitForTimeout(3000);

  const editHref = await page.evaluate(() => {
    const tables = Array.from(document.querySelectorAll('table.list'));
    for (const t of tables) {
      if (t.innerText.includes('Campus Outreach')) {
        const link = Array.from(t.querySelectorAll('a')).find(a => a.innerText.trim() === 'Edit');
        return link ? link.href : null;
      }
    }
    return null;
  });

  console.log('New rule edit link:', editHref);
  if (editHref) {
    await page.goto(editHref, { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    const details = await page.evaluate(() => ({
      label: document.getElementById('ruleName') ? document.getElementById('ruleName').value : null,
      devName: document.getElementById('ruleDevName') ? document.getElementById('ruleDevName').value : null
    }));
    console.log('VERIFIED SAVED RULE DETAILS IN SALESFORCE:', details);
  }

  await browser.close();
})();
