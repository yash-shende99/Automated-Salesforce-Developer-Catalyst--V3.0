const fs = require('fs');

const units = [
    'build-process-interview-records',
    'groundwork-approval-process',
    'create-approval-process-rec-app',
    'process-submitting-positions-approval'
];

for (const unit of units) {
    console.log(`\n================================================================`);
    console.log(`UNIT: ${unit}`);
    console.log(`================================================================`);
    const html = fs.readFileSync(`scripts/proj16_${unit}.html`, 'utf8');

    // Find tables
    const tables = [...html.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi)].map(m => m[1].replace(/<tr[^>]*>/gi, '\nTR: ').replace(/<[^>]+>/g, ' | ').replace(/\s+/g, ' '));
    if (tables.length > 0) {
        console.log('\n--- Tables ---');
        tables.forEach(t => console.log(t));
    }

    // Find ordered lists (steps)
    const ols = [...html.matchAll(/<ol[^>]*>([\s\S]*?)<\/ol>/gi)].map(m => m[1]);
    for (let i = 0; i < ols.length; i++) {
        const lis = [...ols[i].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(m => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
        console.log(`\n--- Step ${i + 1} (${lis.length} items) ---`);
        lis.forEach((li, idx) => {
            console.log(`  ${idx + 1}. ${li}`);
        });
    }
}
