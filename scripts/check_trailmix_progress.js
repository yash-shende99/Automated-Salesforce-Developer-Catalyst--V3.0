const fs = require('fs');

async function main() {
    const html = fs.readFileSync('./scripts/trailmix_dump.html', 'utf8');
    const matches = html.match(/data-react-props="([^"]+)"/g) || [];
    
    // Check Trailmix isComplete
    const match0 = JSON.parse(matches[0].replace('data-react-props="', '').slice(0, -1).replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
    console.log('Trailmix overall isComplete:', match0.content.isComplete);
    
    const results = [];
    for (let i = 1; i <= 32; i++) {
        const raw = matches[i].replace('data-react-props="', '').slice(0, -1).replace(/&quot;/g, '"').replace(/&amp;/g, '&');
        const data = JSON.parse(raw);
        results.push({
            num: i,
            title: data.content.title,
            nextIncomplete: data.content.nextIncompleteUnitUrl,
            type: data.content.type
        });
    }

    console.table(results);
    const incomplete = results.filter(r => r.nextIncomplete !== null && r.nextIncomplete !== undefined);
    console.log(`\nIncomplete items: ${incomplete.length}`);
    if (incomplete.length > 0) {
        console.log(incomplete);
    } else {
        console.log('ALL 32 BADGES ARE 100% COMPLETED!');
    }
}

main().catch(console.error);
