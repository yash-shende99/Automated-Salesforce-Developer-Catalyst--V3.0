const fs = require('fs');

async function testPoll() {
    const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
    const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');
    const checkUrl = 'https://trailhead.salesforce.com/check_challenge/fls-perm-sets-sharing';
    
    // Get csrf
    const pageRes = await fetch('https://trailhead.salesforce.com/content/learn/projects/keep-data-secure-in-a-recruiting-app/fls-perm-sets-sharing', {
        headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await pageRes.text();
    const csrfMatch = html.match(/name="csrf-token"\s+content="([^"]+)"/) || html.match(/content="([^"]+)"\s+name="csrf-token"/);
    const csrfToken = csrfMatch ? csrfMatch[1] : '';

    console.log('Starting check_challenge polling with safe parsing...');
    for (let i = 1; i <= 25; i++) {
        const res = await fetch(checkUrl, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken,
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                first_time: i === 1,
                retake: false,
                is_step: true
            })
        });

        const raw = await res.text();
        let data;
        try {
            data = JSON.parse(raw);
            console.log(`Poll ${i}: Status=${data.challenge_status}, Msg=${data.challenge_response}`);
            if (data.challenge_status === 'Success' || (data.challenge_response && data.challenge_response.includes('already been completed'))) {
                console.log('SUCCESS! Challenge is complete:', JSON.stringify(data, null, 2));
                break;
            }
            if (data.challenge_status === 'Error') {
                console.log('FAILED with error:', data.challenge_response);
                break;
            }
        } catch (e) {
            console.log(`Poll ${i}: Non-JSON response (length ${raw.length}): ${raw.slice(0, 100)}...`);
        }
        await new Promise(r => setTimeout(r, 2000));
    }
}

testPoll().catch(console.error);
