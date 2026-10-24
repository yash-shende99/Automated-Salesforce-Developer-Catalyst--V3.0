const fs = require('fs');

const manifest = JSON.parse(fs.readFileSync('scripts/playlist_manifest.json', 'utf8'));
const scripts = fs.readdirSync('scripts');

console.log('=== TRAILMIX 32 ITEMS vs PRE-BUILT SCRIPTS AUDIT ===\n');

manifest.forEach((item, idx) => {
    const slug = item.slug.split('?')[0];
    const itemNumber = idx + 1;
    
    // Look for matching files in scripts
    const normalizedSlug = slug.toLowerCase().replace(/[-_]/g, '');
    const matched = scripts.filter(s => {
        const normS = s.toLowerCase().replace(/[-_.]/g, '');
        return normS.includes(normalizedSlug) || 
               (normalizedSlug.length > 5 && normS.includes(normalizedSlug.slice(0, 10)));
    });

    console.log(`[Item ${itemNumber}] [${item.type}] ${slug}`);
    console.log(`   Title: ${item.title}`);
    console.log(`   Matched Scripts: ${matched.length > 0 ? matched.join(', ') : 'NONE'}\n`);
});
