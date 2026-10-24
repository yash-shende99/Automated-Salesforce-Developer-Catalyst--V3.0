const fs = require('fs');

async function getUnitDetails(moduleSlug, unitSlug, isProject = false) {
    const authData = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
    const cookies = authData.cookies.map(c => `${c.name}=${c.value}`).join('; ');
    const folder = (isProject || moduleSlug.includes('-')) ? 'projects' : 'modules';
    const url = `https://trailhead.salesforce.com/content/learn/${folder}/${moduleSlug}/${unitSlug}`;
    console.log(`[Inspector] Fetching: ${url}`);
    
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Cookie': cookies
        }
    });
    const html = await res.text();
    const match = html.match(/data-react-class="challenge\/Challenge"\s+data-react-props="([^"]+)"/) ||
                  html.match(/data-react-props="([^"]+)"\s+data-react-class="challenge\/Challenge"/);
    if (!match) {
        console.error('Could not find challenge react props');
        return;
    }
    const decoded = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'");
    const data = JSON.parse(decoded);
    console.log('--- UNIT DETAILS ---');
    console.log('Keys:', Object.keys(data.challenge));
    console.log('Title:', data.challenge.title);
    console.log('Type:', data.challenge.type);
    console.log('Points:', data.challenge.points);
    console.log('Completed:', data.challenge.completed);
    console.log('Points Earned:', data.challenge.points_earned);
    if (data.challenge.body) console.log('Body:', data.challenge.body.slice(0, 500));
    if (data.challenge.rubric) console.log('Rubric:', data.challenge.rubric);
    if (data.challenge.criteria) console.log('Criteria:', data.challenge.criteria);
    if (data.challenge.description) console.log('Description:', data.challenge.description.slice(0, 500));
    if (data.challenge.instructions) console.log('Instructions:', data.challenge.instructions.slice(0, 500));
}

const mod = process.argv[2] || 'lex_customization';
const unit = process.argv[3] || 'lex_customization_page_layouts';
getUnitDetails(mod, unit).catch(console.error);
