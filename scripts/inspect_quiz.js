const fs = require('fs');
const path = require('path');

async function test() {
    const auth = JSON.parse(fs.readFileSync(path.join(__dirname, 'trailhead_auth.json')));
    const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');
    const res = await fetch('https://trailhead.salesforce.com/content/learn/modules/flow-basics/get-started-with-flows', {
        headers: { Cookie: cookieHeader }
    });
    const html = await res.text();
    const match = html.match(/data-react-class="challenge\/Challenge"\s+data-react-props="([^"]+)"/);
    if (match) {
        const rawJson = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
        const parsed = JSON.parse(rawJson);
        console.log('Challenge keys:', Object.keys(parsed.challenge));
        console.log('All questions:', JSON.stringify(parsed.challenge.questions, null, 2));
    } else {
        console.log('Not found');
    }
}

test().catch(console.error);
