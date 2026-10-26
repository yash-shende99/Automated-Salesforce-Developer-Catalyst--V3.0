const fs = require('fs');
const { solveQuizDirect } = require('./direct_quiz_solver');

function extractContentId(htmlPath) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    const matches = [...html.matchAll(/data-react-props="([^"]+)"/g)];
    for (const m of matches) {
        try {
            const raw = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
            const p = JSON.parse(raw);
            if (p.challenge && p.challenge.content_uid) {
                return p.challenge.content_uid;
            }
        } catch(e) {}
    }
    return null;
}

const UNITS = [
    {
        name: 'Get Started with Event Monitoring',
        html: 'scripts/event_monitoring_event_monitoring_intro.html',
        answers: [
            'Monitoring which IP addresses users are logging in from',
            'Developer Edition'
        ]
    },
    {
        name: 'Query Event Log Files',
        html: 'scripts/event_monitoring_event_monitoring_query.html',
        answers: [
            'Execute',
            'Access and download event log files.'
        ]
    },
    {
        name: 'Download and Visualize Event Log Files',
        html: 'scripts/event_monitoring_event_monitoring_download.html',
        answers: [
            '.csv',
            'Scripts help you automate your downloads.'
        ]
    }
];

async function main() {
    console.log('=== SOLVING MODULE: Event Monitoring ===');
    for (const unit of UNITS) {
        const contentId = extractContentId(unit.html);
        console.log(`\nSolving ${unit.name} (Content ID: ${contentId})...`);
        if (!contentId) {
            console.error(`Could not extract content ID for ${unit.name}`);
            continue;
        }

        await solveQuizDirect(contentId, unit.answers);
        // Rate limit buffer between checks
        await new Promise(r => setTimeout(r, 6000));
    }
    console.log('\n=== EVENT MONITORING COMPLETE ===');
}

main().catch(console.error);
