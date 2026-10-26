const fs = require('fs');
const https = require('https');
const path = require('path');
const { solveQuizDirect } = require('./direct_quiz_solver');

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

const UNITS = [
    {
        slug: 'spe_admins_get_started',
        answers: [
            'Tenant secrets',
            'In memory'
        ]
    },
    {
        slug: 'spe_admins_set_up_hoc',
        answers: [
            'Customize Application and Manage Encryption Keys',
            'Search and reporting performance might be slightly affected.'
        ]
    },
    {
        slug: 'use-database-encryption-with-files-and-attachments-encryption',
        answers: [
            'The existing tenant secret is archived, and new encryption keys are generated from the new secret.',
            'Field values are encrypted only in records created or updated after encryption is enabled. Calvin can click sync to encrypt the remaining records.'
        ]
    },
    {
        slug: 'spe_admins_deploy',
        answers: [
            'Field values are encrypted only in records created or updated after encryption is enabled.',
            'The search index holds a readily accessible summary of the data, which could expose snippets of sensitive information through search results.'
        ]
    }
];

async function main() {
    console.log('=== SOLVING MODULE: Shield Platform Encryption (spe_admins) ===');
    for (const unit of UNITS) {
        const url = `https://trailhead.salesforce.com/content/learn/modules/spe_admins/${unit.slug}`;
        console.log(`\nFetching ${url}...`);
        const html = await fetchUrl(url);

        const m = html.match(/data-react-class="challenge\/Challenge"\s+data-react-props="([^"]+)"/) || html.match(/data-react-props="([^"]+)"/);
        if (!m) {
            console.log('No react props found for', unit.slug);
            continue;
        }

        const matches = [...html.matchAll(/data-react-props="([^"]+)"/g)];
        let p = null;
        for (const match of matches) {
            try {
                const raw = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
                const parsed = JSON.parse(raw);
                if (parsed.challenge) {
                    p = parsed;
                    break;
                }
            } catch(e) {}
        }

        if (!p) {
            console.log('Could not find challenge data in props for', unit.slug);
            continue;
        }

        const contentId = p.challenge?.content_uid;
        const isCompleted = p.challenge?.completed;
        console.log(`Unit: ${unit.slug}, Content ID: ${contentId}, Already Completed: ${isCompleted}`);

        if (isCompleted) {
            console.log('Unit is already completed! Skipping.');
            continue;
        }

        if (contentId) {
            await solveQuizDirect(contentId, unit.answers);
            await new Promise(r => setTimeout(r, 6000));
        }
    }
    console.log('\n=== SHIELD PLATFORM ENCRYPTION COMPLETE ===');
}

main().catch(console.error);
