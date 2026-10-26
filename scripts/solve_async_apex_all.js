const https = require('https');
const fs = require('fs');
const path = require('path');
const { solveQuizDirect } = require('./direct_quiz_solver');
const { directCheckChallenge } = require('./direct_api_verifier');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'Cookie': cookieHeader, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function getContentId(slug) {
    const url = `https://trailhead.salesforce.com/content/learn/modules/asynchronous_apex/${slug}`;
    const html = await fetchUrl(url);
    const matches = [...html.matchAll(/data-react-props="([^"]+)"/g)];
    for (const m of matches) {
        try {
            const raw = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
            const p = JSON.parse(raw);
            if (p.challenge) return p.challenge.content_uid;
        } catch(e) {}
    }
    return null;
}

async function main() {
    console.log('=== SOLVING MODULE: Asynchronous Apex (asynchronous_apex) ===\n');

    // Unit 1: Quiz async_apex_introduction
    console.log('[1/6] Solving Quiz: async_apex_introduction...');
    const cid1 = await getContentId('async_apex_introduction');
    console.log(`Content ID: ${cid1}`);
    if (cid1) {
        await solveQuizDirect(cid1, [
            'Higher governor and execution limits',
            'Update all records in your org.'
        ]);
    }
    await new Promise(r => setTimeout(r, 6000));

    // Unit 2: Assessment async_apex_future_methods
    console.log('\n[2/6] Verifying Hands-on: async_apex_future_methods...');
    const res2 = await directCheckChallenge('async_apex_future_methods', 'asynchronous_apex', true);
    console.log('Result 2:', res2.status, res2.message);
    await new Promise(r => setTimeout(r, 6000));

    // Unit 3: Assessment async_apex_batch
    console.log('\n[3/6] Verifying Hands-on: async_apex_batch...');
    const res3 = await directCheckChallenge('async_apex_batch', 'asynchronous_apex', true);
    console.log('Result 3:', res3.status, res3.message);
    await new Promise(r => setTimeout(r, 6000));

    // Unit 4: Assessment async_apex_queueable
    console.log('\n[4/6] Verifying Hands-on: async_apex_queueable...');
    const res4 = await directCheckChallenge('async_apex_queueable', 'asynchronous_apex', true);
    console.log('Result 4:', res4.status, res4.message);
    await new Promise(r => setTimeout(r, 6000));

    // Unit 5: Assessment async_apex_scheduled
    console.log('\n[5/6] Verifying Hands-on: async_apex_scheduled...');
    const res5 = await directCheckChallenge('async_apex_scheduled', 'asynchronous_apex', true);
    console.log('Result 5:', res5.status, res5.message);
    await new Promise(r => setTimeout(r, 6000));

    // Unit 6: Quiz async_apex_monitoring
    console.log('\n[6/6] Solving Quiz: async_apex_monitoring...');
    const cid6 = await getContentId('async_apex_monitoring');
    console.log(`Content ID: ${cid6}`);
    if (cid6) {
        await solveQuizDirect(cid6, [
            'Future Method Jobs',
            'Jobs are processed first-in first-out.'
        ]);
    }

    console.log('\n=== ASYNCHRONOUS APEX COMPLETE ===');
}

main().catch(console.error);
