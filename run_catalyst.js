/**
 * Master Runner for Automated Salesforce Developer Catalyst - V3.0
 * Turnkey CLI tool for completing all 32 badges.
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const AUTH_FILE = path.join(__dirname, 'scripts', 'trailhead_auth.json');
const { syncOrgWithSalesforceCli } = require('./scripts/get_active_org');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = query => new Promise(resolve => rl.question(query, resolve));

function banner() {
    console.log('\n================================================================');
    console.log(' 🌟 AUTOMATED SALESFORCE DEVELOPER CATALYST - V3.0 (32 BADGES)   ');
    console.log('================================================================\n');
}

async function ensureAuth() {
    if (!fs.existsSync(AUTH_FILE)) {
        console.log('[!] No Trailhead session found at scripts/trailhead_auth.json');
        console.log('[*] Launching browser login helper...\n');
        execSync('node scripts/save_trailhead_session.js', { stdio: 'inherit' });
    }

    if (!fs.existsSync(AUTH_FILE)) {
        throw new Error('Authentication cancelled or failed. Please run npm run auth to log in.');
    }
}

async function auditTrailmix() {
    console.log('\n[*] Auditing Trailmix progress directly from Trailhead API...\n');
    const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
    const cookieHeader = (auth.cookies || []).map(c => `${c.name}=${c.value}`).join('; ');

    const res = await fetch('https://trailhead.salesforce.com/users/trjha3/trailmixes/salesforce-developer-catalyst-v-3-0', {
        headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await res.text();
    const matches = html.match(/data-react-props="([^"]+)"/g) || [];

    if (matches.length < 33) {
        console.log('[!] Warning: Could not parse all Trailmix items. Session may be expired.');
        return null;
    }

    const results = [];
    for (let i = 1; i <= 32; i++) {
        const raw = matches[i].replace('data-react-props="', '').slice(0, -1).replace(/&quot;/g, '"').replace(/&amp;/g, '&');
        try {
            const data = JSON.parse(raw);
            const isDone = data.content.nextIncompleteUnitUrl === null;
            results.push({
                num: i,
                title: data.content.title,
                type: data.content.type,
                status: isDone ? '✅ Completed' : '⏳ Pending',
                isDone,
                nextUrl: data.content.nextIncompleteUnitUrl
            });
        } catch (e) {}
    }

    console.table(results.map(r => ({ '#': r.num, Title: r.title, Type: r.type, Status: r.status })));
    const pending = results.filter(r => !r.isDone);
    console.log(`\nProgress: ${results.length - pending.length} / ${results.length} Completed (${Math.round(((results.length - pending.length)/results.length)*100)}%)\n`);
    return { results, pending };
}

async function runAllPending(pending) {
    if (!pending || pending.length === 0) {
        console.log('🎉 All 32 badges are already 100% completed!');
        return;
    }

    console.log(`\n[*] Starting automated completion for ${pending.length} pending badges...\n`);
    
    // Ensure org is connected
    try {
        await syncOrgWithSalesforceCli('trailhead');
    } catch (e) {
        console.warn('[!] Note on org sync:', e.message);
    }

    // Deploy project metadata if any project is pending
    const hasPendingProject = pending.some(p => p.type === 'project');
    if (hasPendingProject) {
        console.log('[*] Deploying pre-configured metadata to hands-on org...');
        try {
            execSync('sf project deploy start -d force-app -o trailhead', { stdio: 'inherit' });
            console.log('[*] Metadata deployment complete.');
        } catch (e) {
            console.warn('[!] Deployment notice:', e.message);
        }
    }

    // Solve modules sequentially
    for (const item of pending) {
        console.log(`\n========================================================`);
        console.log(` Processing [${item.num}/32]: ${item.title}`);
        console.log(`========================================================`);
        
        // Find matching solve script
        const safeName = item.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const scriptFiles = fs.readdirSync('./scripts');
        const matchedScript = scriptFiles.find(f => f.startsWith('solve_') && f.includes(safeName.slice(0, 15)));

        if (matchedScript) {
            console.log(`[*] Executing solver: scripts/${matchedScript}...`);
            try {
                execSync(`node scripts/${matchedScript}`, { stdio: 'inherit' });
            } catch (err) {
                console.error(`[!] Error solving ${item.title}:`, err.message);
            }
        } else {
            console.log(`[*] Checking challenge directly via direct verifier...`);
            try {
                const slug = item.nextUrl ? item.nextUrl.split('/').pop().split('?')[0] : safeName;
                execSync(`node -e "const { directCheckChallenge } = require('./scripts/direct_api_verifier'); directCheckChallenge('${slug}').then(console.log);"`, { stdio: 'inherit' });
            } catch (err) {
                console.warn(`[!] Direct check notice:`, err.message);
            }
        }

        console.log('[*] Waiting 6 seconds to respect rate limits...');
        await new Promise(r => setTimeout(r, 6000));
    }

    console.log('\n[✓] Automation run finished! Re-auditing Trailmix...');
    await auditTrailmix();
}

async function main() {
    banner();
    await ensureAuth();

    let exit = false;
    while (!exit) {
        console.log('\n--- MAIN MENU ---');
        console.log('1. Audit Trailmix Progress (Live 32 Badges)');
        console.log('2. Complete All Pending Badges Automatically');
        console.log('3. Re-Sync Trailhead Playground to SF CLI');
        console.log('4. Re-Login to Trailhead (Refresh Session)');
        console.log('5. Exit');

        const choice = await ask('\nEnter choice (1-5): ');
        switch (choice.trim()) {
            case '1':
                await auditTrailmix();
                break;
            case '2': {
                const audit = await auditTrailmix();
                if (audit && audit.pending) {
                    await runAllPending(audit.pending);
                }
                break;
            }
            case '3':
                await syncOrgWithSalesforceCli('trailhead');
                break;
            case '4':
                execSync('node scripts/save_trailhead_session.js', { stdio: 'inherit' });
                break;
            case '5':
                exit = true;
                break;
            default:
                console.log('Invalid choice. Please enter 1-5.');
        }
    }

    console.log('\nGoodbye! Happy Trailblazing! 🚀\n');
    rl.close();
}

if (require.main === module) {
    main().catch(err => {
        console.error('\nFatal error:', err.message);
        rl.close();
    });
}

module.exports = { auditTrailmix, runAllPending };
