const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');

async function getActiveTrailheadOrg() {
    if (!fs.existsSync(AUTH_FILE)) {
        throw new Error('Please log in first using: npm run auth (or node scripts/save_trailhead_session.js)');
    }

    const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const cookieHeader = (auth.cookies || []).map(c => `${c.name}=${c.value}`).join('; ');

    console.log('[OrgDetector] Detecting active hands-on org from Trailhead...');
    const res = await fetch('https://trailhead.salesforce.com/content/learn/projects/customize-a-salesforce-object/standard-custom-fields', {
        headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0' }
    });

    const html = await res.text();
    const reactMatches = html.match(/data-react-props="([^"]+)"/g) || [];

    let activeAccount = null;
    for (const match of reactMatches) {
        const raw = match.replace('data-react-props="', '').slice(0, -1);
        const decoded = raw.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
        try {
            const data = JSON.parse(decoded);
            const accounts = data?.challenge?.assessment_evaluation_context?.authorized_accounts;
            if (Array.isArray(accounts) && accounts.length > 0) {
                activeAccount = accounts.find(a => a.active_org) || accounts[0];
                break;
            }
        } catch (e) {}
    }

    if (!activeAccount) {
        throw new Error('No hands-on Trailhead Playground found in your account. Please create or connect one on Trailhead.');
    }

    console.log(`[OrgDetector] Found active org: ${activeAccount.name} (${activeAccount.username}) [ID: ${activeAccount.id}]`);
    return activeAccount;
}

async function syncOrgWithSalesforceCli(alias = 'trailhead') {
    const org = await getActiveTrailheadOrg();
    const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const cookieHeader = (auth.cookies || []).map(c => `${c.name}=${c.value}`).join('; ');

    console.log(`[OrgDetector] Obtaining live session from /launch_org/${org.id}...`);
    const launchRes = await fetch(`https://trailhead.salesforce.com/launch_org/${org.id}`, {
        headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0' },
        redirect: 'manual'
    });

    const location = launchRes.headers.get('location');
    if (!location) {
        throw new Error('Failed to obtain launch session. Your Trailhead cookies might be expired. Run npm run auth to refresh.');
    }

    const parsedUrl = new URL(location);
    const sid = parsedUrl.searchParams.get('sid').trim();
    const instanceUrl = parsedUrl.origin;

    console.log(`[OrgDetector] Live session obtained! Authorizing SF CLI for alias: ${alias}...`);
    const env = { ...process.env, SF_ACCESS_TOKEN: sid };
    execSync(`sf org login access-token --instance-url ${instanceUrl} --alias ${alias} --no-prompt --set-default`, { env, stdio: 'pipe' });

    console.log(`[OrgDetector] SF CLI successfully connected to: ${org.username} (Alias: ${alias})`);
    return { org, instanceUrl, alias };
}

if (require.main === module) {
    syncOrgWithSalesforceCli().then(res => {
        console.log('Sync complete:', res);
    }).catch(err => {
        console.error('Error:', err.message);
    });
}

module.exports = { getActiveTrailheadOrg, syncOrgWithSalesforceCli };
