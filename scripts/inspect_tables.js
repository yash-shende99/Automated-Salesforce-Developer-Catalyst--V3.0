const fs = require('fs');

const files = [
  'proj16_build-process-interview-records.html',
  'proj16_groundwork-approval-process.html',
  'proj16_create-approval-process-rec-app.html',
  'proj16_process-submitting-positions-approval.html',
  'proj16_candidate-rating-flow.html'
];

for (const f of files) {
  const content = fs.readFileSync('scripts/' + f, 'utf8');
  console.log('=== ' + f + ' ===');

  // Let's find where the challenge or main body starts
  // Look for id="set-up-a-flow" or similar headings or id="challenge"
  const chIdx = content.indexOf('id="challenge"');
  if (chIdx !== -1) {
    const chBlock = content.slice(chIdx, chIdx + 3000).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    console.log('Challenge:', chBlock.slice(0, 500));
  }

  // Also look for tables in the HTML
  const tableMatches = content.match(/<table[\s\S]*?<\/table>/gi);
  if (tableMatches) {
    console.log(`Found ${tableMatches.length} tables`);
    tableMatches.forEach((tbl, idx) => {
      const cleanTbl = tbl.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      console.log(`Table ${idx + 1}: ${cleanTbl.slice(0, 200)}...`);
    });
  }
}
