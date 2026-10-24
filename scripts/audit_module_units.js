const fs = require('fs');

async function checkModule(moduleSlug, isProject = false) {
    const auth = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
    const cookieHeader = (auth.cookies || []).map(c => `${c.name}=${c.value}`).join('; ');
    const type = isProject ? 'projects' : 'modules';
    const mainUrl = `https://trailhead.salesforce.com/content/learn/${type}/${moduleSlug}`;
    const res = await fetch(mainUrl, { headers: { 'Cookie': cookieHeader } });
    const html = await res.text();
    
    const regex = new RegExp(`/${type}/${moduleSlug}/([a-zA-Z0-9_-]+)`, 'g');
    const matches = [...html.matchAll(regex)];
    const slugs = [...new Set(matches.map(x => x[1]))].filter(s => !s.includes('badge'));
    
    console.log(`\n=== Checking: ${moduleSlug} (${slugs.length} units) ===`);
    for (const slug of slugs) {
        const uUrl = `https://trailhead.salesforce.com/content/learn/${type}/${moduleSlug}/${slug}`;
        const uRes = await fetch(uUrl, { headers: { 'Cookie': cookieHeader } });
        const uHtml = await uRes.text();
        const completed = uHtml.includes('&quot;completed&quot;:true') || uHtml.includes('"completed":true') || uHtml.includes('Challenge Completed') || uHtml.includes('c-badge--success');
        const isQuiz = uHtml.includes('&quot;type&quot;:&quot;quiz&quot;') || uHtml.includes('"type":"quiz"') || uHtml.includes('th-enhanced-quiz');
        console.log(`  - [${completed ? 'DONE' : 'PENDING'}] ${slug} (${isQuiz ? 'Quiz' : 'Hands-on'})`);
    }
}

const target = process.argv[2] || 'screen-flows';
const isProj = process.argv[3] === 'true';
checkModule(target, isProj).catch(console.error);
