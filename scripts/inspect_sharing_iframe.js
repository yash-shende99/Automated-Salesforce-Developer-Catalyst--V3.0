const { chromium } = require('playwright');
const { execSync } = require('child_process');

(async () => {
  const urlRes = execSync('sf org open -r -p /lightning/setup/SecuritySharing/home -o trailhead --json', { encoding: 'utf8' });
  const frontdoorUrl = JSON.parse(urlRes).result.url;
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto(frontdoorUrl, { waitUntil: 'load' });
  await page.waitForTimeout(8000);

  const frames = page.frames();
  console.log('Frames count:', frames.length);
  for (const f of frames) {
    const url = f.url();
    console.log('Frame URL:', url);
    try {
      const text = await f.evaluate(() => document.body.innerText);
      const idx = text.indexOf('Program Sharing Rules');
      if (idx !== -1) {
        console.log('FOUND Program Sharing Rules in frame:\n', text.slice(idx, idx + 800));
      }
    } catch (e) {
      // cross-origin frame ignore
    }
  }
  await browser.close();
})();
