const fs = require('fs');

async function main() {
    const slug = process.argv[2] || 'create-object-specific-quick-action';
    const parentSlug = process.argv[3] || 'customize-the-ui-for-a-recruiting-app';
    const isModule = process.argv[4] === 'true';
    const type = isModule ? 'modules' : 'projects';
    const url = `https://trailhead.salesforce.com/content/learn/${type}/${parentSlug}/${slug}`;
    console.log(`Fetching requirements from ${url}...`);

    const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
    const cookieHeader = (auth.cookies || []).map(c => `${c.name}=${c.value}`).join('; ');
    const res = await fetch(url, { headers: { 'Cookie': cookieHeader } });
    const html = await res.text();

    const matches = [...html.matchAll(/data-react-props="([^"]+)"/g)];
    for (const match of matches) {
        const raw = match[1].replace(/&quot;/g, '"');
        try {
            const p = JSON.parse(raw);
            if (p.challenge) {
                console.log('\n--- Challenge Info ---');
                console.log('Title:', p.challenge.title);
                console.log('Type:', p.challenge.type);
                if (p.challenge.questions) {
                    console.log('Quiz completed:', p.challenge.completed);
                    console.log('Content UID:', p.challenge.content_uid);
                    for (const q of p.challenge.questions) {
                        console.log('Q:', q.title || q.question, 'ID:', q.id);
                        for (const opt of (q.answers || q.options || [])) {
                            console.log('  Opt:', opt.title || opt.name || opt, 'ID:', opt.id);
                        }
                    }
                }
                return;
            }
        } catch(e) {}
    }
    const mainMatch = html.match(/<article[\s\S]*?<\/article>/i) || html.match(/<main[\s\S]*?<\/main>/i);
    if (mainMatch) {
        const text = mainMatch[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
        const cIdx = text.lastIndexOf('Challenge');
        if (cIdx !== -1) {
            console.log('\n--- Challenge Section from Page ---');
            console.log(text.slice(cIdx, cIdx + 2000));
        } else {
            console.log('\n--- End of Article ---');
            console.log(text.slice(-2000));
        }
    }
}

main().catch(console.error);
