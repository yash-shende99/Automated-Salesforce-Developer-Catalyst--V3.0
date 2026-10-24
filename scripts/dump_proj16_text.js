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
  // Trailhead units usually have a main container or we can just extract from <body> to </body>
  const bodyMatch = content.match(/<body[\s\S]*?<\/body>/i);
  let text = bodyMatch ? bodyMatch[0] : content;
  
  // Cut off header nav and footer nav if possible
  // Search for the unit title or introduction
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '')
             .replace(/<style[\s\S]*?<\/style>/gi, '')
             .replace(/<svg[\s\S]*?<\/svg>/gi, '')
             .replace(/<header[\s\S]*?<\/header>/gi, '')
             .replace(/<footer[\s\S]*?<\/footer>/gi, '')
             .replace(/<nav[\s\S]*?<\/nav>/gi, '');
             
  // Convert basic formatting
  text = text.replace(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi, '\n\n=== $1 ===\n')
             .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n* $1')
             .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n')
             .replace(/<tr[^>]*>([\s\S]*?)<\/tr>/gi, '\n| $1 |')
             .replace(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi, ' $1 |')
             .replace(/<[^>]+>/g, '')
             .replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&#39;/g, "'")
             .replace(/&quot;/g, '"');
             
  const lines = text.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('All rights reserved') && !l.includes('Salesforce, Inc.') && !l.includes('Terms of Service'));
    
  const outName = 'scripts/' + f.replace('.html', '.txt');
  fs.writeFileSync(outName, lines.join('\n'));
  console.log(`Wrote ${outName} (${lines.length} lines)`);
}
