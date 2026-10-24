const fs = require('fs');

async function getUnitReqs(url) {
    const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
    const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

    const res = await fetch(url, { headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();

    const match = html.match(/data-react-class="challenge\/Challenge"\s+data-react-props="([^"]+)"/) ||
                  html.match(/data-react-props="([^"]+)"\s+data-react-class="challenge\/Challenge"/);
    if (match) {
        const decoded = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'");
        try {
            const data = JSON.parse(decoded);
            console.log('=== CHALLENGE PROPS ===');
            console.log('Title:', data.challenge?.title);
            console.log('Description:', data.challenge?.description);
            console.log('Type:', data.challenge?.type);
            console.log('Completed:', data.challenge?.completed);
            console.log('Assessment Context:', JSON.stringify(data.challenge?.assessment_evaluation_context, null, 2));
        } catch (e) {
            console.error('Parse error:', e.message);
        }
    } else {
        console.log('No challenge/Challenge react class found');
    }

    // Also extract main article text
    const textMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) || html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (textMatch) {
        const cleanText = textMatch[1]
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        console.log('=== ARTICLE PREVIEW ===');
        console.log(cleanText.slice(0, 1500));
        fs.writeFileSync('./scripts/last_unit_article.txt', cleanText, 'utf8');
    }
}

const target = process.argv[2] || 'https://trailhead.salesforce.com/content/learn/projects/customize-a-salesforce-object/standard-custom-fields';
getUnitReqs(target);
