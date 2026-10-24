const fs = require('fs');
const authData = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
const cookieHeader = authData.cookies.map(c => `${c.name}=${c.value}`).join('; ');

(async () => {
  const pageRes = await fetch('https://trailhead.salesforce.com/content/learn/modules/data_security/data_security_fields', {
    headers: { 'Cookie': cookieHeader }
  });
  const html = await pageRes.text();
  const csrfMatch = html.match(/name="csrf-token"\s+content="([^"]+)"/);
  const csrf = csrfMatch ? csrfMatch[1] : '';

  const checkRes = await fetch('https://trailhead.salesforce.com/check_challenge/data_security_fields', {
    method: 'POST',
    headers: {
      'Cookie': cookieHeader,
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrf,
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: JSON.stringify({ first_time: true, retake: false, is_step: false })
  });
  console.log('Status code:', checkRes.status);
  const data = await checkRes.json();
  console.log('Response body:', JSON.stringify(data, null, 2));
})();
