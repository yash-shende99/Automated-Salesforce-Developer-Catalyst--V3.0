const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');

let cachedCsrfToken = null;
let cachedCsrfTokenTime = 0;
const CSRF_CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

function clearCsrfCache() {
    cachedCsrfToken = null;
    cachedCsrfTokenTime = 0;
}

async function getCsrfToken(unitUrl, cookieHeader, forceRefresh = false) {
    if (!forceRefresh && cachedCsrfToken && (Date.now() - cachedCsrfTokenTime < CSRF_CACHE_TTL_MS)) {
        return cachedCsrfToken;
    }

    console.log(`[DirectAPI] Fetching new CSRF token from: ${unitUrl}`);
    const pageRes = await fetch(unitUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Cookie': cookieHeader
        }
    });

    const html = await pageRes.text();
    const csrfMatch = html.match(/name="csrf-token"\s+content="([^"]+)"/) || html.match(/content="([^"]+)"\s+name="csrf-token"/);
    const csrfToken = csrfMatch ? csrfMatch[1] : null;

    if (csrfToken) {
        cachedCsrfToken = csrfToken;
        cachedCsrfTokenTime = Date.now();
        console.log(`[DirectAPI] Cached CSRF Token: ${csrfToken.slice(0, 15)}...`);
    } else {
        console.warn('[DirectAPI] Warning: Could not find csrf-token in HTML');
    }
    return csrfToken;
}

async function directCheckChallenge(unitSlug, parentSlug = 'improve-data-quality-for-a-recruiting-app', isModule = false) {
    if (!fs.existsSync(AUTH_FILE)) {
        throw new Error('trailhead_auth.json not found');
    }

    const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const cookies = authData.cookies || [];
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    const folderType = isModule ? 'modules' : 'projects';
    const unitUrl = unitSlug.startsWith('http') 
        ? unitSlug 
        : `https://trailhead.salesforce.com/content/learn/${folderType}/${parentSlug}/${unitSlug}`;

    let csrfToken = await getCsrfToken(unitUrl, cookieHeader);

    const cleanSlug = unitSlug.includes('/') ? unitSlug.split('/').filter(Boolean).pop() : unitSlug;
    const checkUrl = `https://trailhead.salesforce.com/check_challenge/${cleanSlug}`;
    console.log(`[DirectAPI] Polling direct check: ${checkUrl} (500ms intervals)`);

    const startTime = Date.now();
    for (let attempt = 1; attempt <= 40; attempt++) {
        const checkRes = await fetch(checkUrl, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Cookie': cookieHeader,
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken || '',
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                first_time: attempt === 1,
                retake: false,
                is_step: true
            })
        });

        if (checkRes.status === 403 && attempt === 1) {
            console.log('[DirectAPI] 403 received, refreshing CSRF token...');
            csrfToken = await getCsrfToken(unitUrl, cookieHeader, true);
            continue;
        }

        let data;
        try {
            const rawText = await checkRes.text();
            try {
                data = JSON.parse(rawText);
            } catch (jsonErr) {
                data = { rawText };
            }
        } catch (e) {
            console.error('[DirectAPI] Error reading response body:', e.message);
        }

        const elapsed = Date.now() - startTime;
        if (data && data.challenge_status && data.challenge_status !== 'Processing') {
            const isSuccess = data.challenge_status === 'Success' || data.challenge_status === 'Pass' || (data.challenge_response && data.challenge_response.includes('already been completed'));
            console.log(`[DirectAPI] Resolved in ${elapsed}ms: Status=${data.challenge_status}, Msg=${data.challenge_response}`);
            return {
                success: isSuccess,
                status: data.challenge_status,
                message: data.challenge_response,
                durationMs: elapsed,
                raw: data
            };
        }

        if (attempt % 4 === 0) {
            console.log(`[DirectAPI] Attempt ${attempt} (${elapsed}ms): Processing...`);
        }
        await new Promise(r => setTimeout(r, 500));
    }

    return { success: false, error: 'Verification timed out', durationMs: Date.now() - startTime };
}

if (require.main === module) {
    const slug = process.argv[2] || 'create-lookup-filters';
    directCheckChallenge(slug).catch(console.error);
}

module.exports = { directCheckChallenge, clearCsrfCache };
