const fs = require('fs');
const { execSync } = require('child_process');

async function test() {
    const out = JSON.parse(execSync('sf org open -p "/setup/ui/tabcustomname.apexp" -r --json -o friend_org').toString());
    const frontdoorUrl = out.result.url;
    console.log('frontdoor URL obtained!');

    // Follow redirect
    const res1 = await fetch(frontdoorUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        redirect: 'manual'
    });
    const body1 = await res1.text();
    const setCookies1 = res1.headers.getSetCookie ? res1.headers.getSetCookie() : [res1.headers.get('set-cookie')].filter(Boolean);
    const cookies = {};
    for (const sc of setCookies1) {
        const [k, v] = sc.split(';')[0].split('=');
        cookies[k.trim()] = v;
    }

    // Extract contentDoor URL
    const match = body1.match(/window\.location\.replace\("([^"]+)"\)/);
    if (!match) {
        console.log('No contentDoor match found in body:', body1.slice(0, 500));
        return;
    }
    const contentDoorUrl = match[1].replace(/\\/g, '');
    console.log('contentDoor URL:', contentDoorUrl);

    // Hit contentDoor
    const res2 = await fetch(contentDoorUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Cookie': Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ')
        },
        redirect: 'manual'
    });
    console.log('contentDoor status:', res2.status);
    const setCookies2 = res2.headers.getSetCookie ? res2.headers.getSetCookie() : [res2.headers.get('set-cookie')].filter(Boolean);
    for (const sc of setCookies2) {
        const [k, v] = sc.split(';')[0].split('=');
        cookies[k.trim()] = v;
    }

    const body2 = await res2.text();
    console.log('contentDoor body preview:', body2.slice(0, 1000));

    if (loc2) {
        const res3 = await fetch(loc2, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cookie': Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ')
            },
            redirect: 'manual'
        });
        console.log('Final status:', res3.status);
        const finalBody = await res3.text();
        console.log('Final body length:', finalBody.length);
        fs.writeFileSync('scripts/scratch/tabcustomname_fetch.html', finalBody);
        console.log('Saved to tabcustomname_fetch.html');
        if (finalBody.includes('Account')) {
            console.log('SUCCESS: Page contains Account!');
        }
    }
}

test().catch(console.error);
