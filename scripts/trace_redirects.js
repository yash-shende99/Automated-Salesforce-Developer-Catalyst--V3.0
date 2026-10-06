const fs = require('fs');

async function test() {
    const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
    const cookies = auth.cookies || [];
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    const orgId = 23980024;
    const res = await fetch('https://trailhead.salesforce.com/launch_org/' + orgId, {
        headers: { 'Cookie': cookieHeader, 'User-Agent': 'Mozilla/5.0' },
        redirect: 'manual'
    });
    const frontdoorUrl = res.headers.get('location');
    console.log('frontdoor URL:', frontdoorUrl);

    let currentUrl = frontdoorUrl;
    let cookieJar = [];
    for (let step = 1; step <= 8; step++) {
        console.log(`\n[Step ${step}] GET ${currentUrl}`);
        const stepRes = await fetch(currentUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Cookie': cookieJar.join('; ')
            },
            redirect: 'manual'
        });
        console.log('Status:', stepRes.status);
        const setCookies = stepRes.headers.getSetCookie ? stepRes.headers.getSetCookie() : [stepRes.headers.get('set-cookie')].filter(Boolean);
        for (const sc of setCookies) {
            const cNameVal = sc.split(';')[0];
            cookieJar.push(cNameVal);
            console.log('Set-Cookie:', cNameVal.split('=')[0]);
        }
        const nextLoc = stepRes.headers.get('location');
        console.log('Location:', nextLoc);
        if (!nextLoc) {
            const body = await stepRes.text();
            console.log('Final page body length:', body.length, 'preview:', body.slice(0, 300));
            break;
        }
        currentUrl = nextLoc.startsWith('http') ? nextLoc : new URL(nextLoc, currentUrl).href;
    }
}
test().catch(console.error);
