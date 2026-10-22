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
  console.log('====================================');
  console.log('FILE:', f);
  console.log('====================================');
  
  // Strip tags helper
  function clean(str) {
    return str.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
  }

  // Look for challenge section or instructions
  const sections = content.split(/<h[23][^>]*>/i);
  for (const s of sections) {
    const text = clean(s);
    if (text.includes('Create a Flow') || text.includes('Create an Approval') || text.includes('Email Alert') || text.includes('Step') || text.includes('Field') || text.includes('Review') || text.includes('Interview')) {
      // Print first 500 chars of interesting sections
      console.log('--- SECTION SNIPPET ---');
      console.log(text.slice(0, 400));
    }
  }
}
