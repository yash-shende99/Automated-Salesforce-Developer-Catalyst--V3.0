const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

let cachedCsrf = null;
async function getCsrfToken() {
    if (cachedCsrf) return cachedCsrf;
    const res = await fetch('https://trailhead.salesforce.com/today', {
        headers: { 'Cookie': cookieHeader, 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await res.text();
    const match = html.match(/name="csrf-token"\s+content="([^"]+)"/) || html.match(/content="([^"]+)"\s+name="csrf-token"/);
    cachedCsrf = match ? match[1] : null;
    return cachedCsrf;
}

/**
 * Automatically solves any Trailhead quiz via direct API:
 * 1. Fetches questions & options from GET /content_assessments/${contentId}
 * 2. Matches provided answer texts to option IDs
 * 3. Sends PUT /content_assessments/${contentId}
 * 
 * @param {string} contentId - UUID of the unit content assessment
 * @param {Array<string>} targetAnswers - Substrings of correct answer texts
 */
async function solveQuizDirect(contentId, targetAnswers) {
    console.log(`\n=== Direct API Quiz Solver: ${contentId} ===`);
    
    // 1. Fetch Assessment UI
    console.log(`[1] Fetching quiz details from /content_assessments/${contentId}...`);
    const getRes = await fetch(`https://trailhead.salesforce.com/content_assessments/${contentId}`, {
        headers: {
            'Cookie': cookieHeader,
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json'
        }
    });

    if (getRes.status !== 200) {
        throw new Error(`Failed to fetch quiz: HTTP ${getRes.status}`);
    }

    const data = await getRes.json();
    const questions = data.assessment_ui?.questions || [];
    console.log(`[1] Found ${questions.length} questions.`);

    // 2. Map Answers
    const answersPayload = {};
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        console.log(`\nQ${i+1}: ${q.question}`);
        let matched = false;

        for (const opt of q.options) {
            for (const ansText of targetAnswers) {
                if (opt.label.toLowerCase().includes(ansText.toLowerCase()) || 
                    ansText.toLowerCase().includes(opt.label.toLowerCase())) {
                    answersPayload[q.id] = opt.id;
                    matched = true;
                    console.log(`  -> Selected [${opt.id}]: "${opt.label}"`);
                    break;
                }
            }
            if (matched) break;
        }

        if (!matched) {
            console.warn(`[WARN] Could not find match for Q${i+1}. Options were:`, q.options.map(o => o.label));
        }
    }

    // 3. Get CSRF Token
    const csrf = await getCsrfToken();

    // 4. Submit
    console.log(`\n[2] Submitting answers to PUT /content_assessments/${contentId}...`);
    const putRes = await fetch(`https://trailhead.salesforce.com/content_assessments/${contentId}`, {
        method: 'PUT',
        headers: {
            'Cookie': cookieHeader,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-Token': csrf
        },
        body: JSON.stringify({
            answers: answersPayload,
            breadcrumbs: {
                trailmix_creator_id: 'trjha3',
                trailmix_slug: 'salesforce-developer-catalyst-v-3-0'
            }
        })
    });

    const result = await putRes.json();
    const state = result.assessment_state;
    const isCompleted = state?.completed;
    const pts = state?.points_earned || 0;
    const progress = state?.content_progress;
    console.log(`\n>>> RESULT: Status=${putRes.status}, Completed=${isCompleted}, Points Earned=${pts}, Progress=${progress}%`);

    if (result.legacy_rewards && result.legacy_rewards.some(r => r.type === 'Th::ModuleBadge')) {
        console.log(`🎉 MODULE BADGE EARNED: ${state?.content_title || 'Badge'}`);
    }

    return result;
}

module.exports = { solveQuizDirect };

if (require.main === module) {
    const contentId = process.argv[2];
    const answers = JSON.parse(process.argv[3] || '[]');
    solveQuizDirect(contentId, answers).catch(console.error);
}
