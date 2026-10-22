const fs = require('fs');

const units = [
    'collect-contact-info-from-your-user',
    'check-for-a-matching-contact-in-your-org',
    'branch-the-flow',
    'create-or-update-a-contact',
    'present-confirmation-screens'
];

for (const unit of units) {
    const html = fs.readFileSync(`scripts/unit_${unit}.html`, 'utf8');
    // Extract everything inside <main ...> ... </main> or between "Time Estimate" and "Resources"
    console.log(`\n================================================================`);
    console.log(`UNIT: ${unit}`);
    console.log(`================================================================`);
    
    // Find instructions
    const ols = [...html.matchAll(/<ol[^>]*>([\s\S]*?)<\/ol>/gi)].map(m => m[1]);
    for (let i = 0; i < ols.length; i++) {
        const lis = [...ols[i].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(m => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
        console.log(`\n--- Step ${i + 1} (${lis.length} items) ---`);
        lis.forEach((li, idx) => {
            if (li.length > 20) console.log(`  ${idx + 1}. ${li.slice(0, 160)}...`);
        });
    }

    // Also look for tables
    const tables = [...html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi)].map(m => m[1].replace(/<tr[^>]*>/gi, '\nTR: ').replace(/<[^>]+>/g, ' | ').replace(/\s+/g, ' '));
    if (tables.length > 0) {
        console.log('\n--- Tables ---');
        tables.forEach(t => console.log(t.slice(0, 300)));
    }
}
