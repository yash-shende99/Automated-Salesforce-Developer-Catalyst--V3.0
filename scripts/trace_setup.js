const fs = require('fs');

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
    console.log(`SID obtained!`);

    const setupHost = 'curious-moose-vbdewg-dev-ed.trailblaze.my.salesforce-setup.com';
    console.log(`Sending GET request to https://${setupHost}/setup/ui/tabcustomname.apexp...`);
    const pageRes = await fetch(`https://${setupHost}/setup/ui/tabcustomname.apexp`, {
        headers: {
            'Cookie': `sid=${sid}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        redirect: 'manual'
    });

    console.log('Status:', pageRes.status);
    console.log('Location:', pageRes.headers.get('location'));

    if (pageRes.status === 200) {
        const text = await pageRes.text();
        console.log('Success! Response length:', text.length);
        console.log('Contains Account?', text.includes('Account'));
        fs.writeFileSync('scripts/scratch/tab_node.html', text);
    } else if (pageRes.status === 302) {
        const nextLoc = pageRes.headers.get('location');
        console.log('Redirecting to:', nextLoc);
        const res2 = await fetch(nextLoc, {
            headers: {
                'Cookie': `sid=${sid}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            },
            redirect: 'manual'
        });
        console.log('Hop 2 Status:', res2.status);
        console.log('Hop 2 Location:', res2.headers.get('location'));
        if (res2.status === 200) {
            const text2 = await res2.text();
            console.log('Hop 2 length:', text2.length);
            console.log('Contains Account?', text2.includes('Account'));
            fs.writeFileSync('scripts/scratch/tab_node.html', text2);
        }
    }
}

main().catch(console.error);
