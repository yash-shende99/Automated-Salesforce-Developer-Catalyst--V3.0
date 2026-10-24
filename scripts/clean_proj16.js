const fs = require('fs');

const files = [
  'proj16_build-process-interview-records.html',
  'proj16_groundwork-approval-process.html',
  'proj16_create-approval-process-rec-app.html',
  'proj16_process-submitting-positions-approval.html',
  'proj16_candidate-rating-flow.html'
];

function extractArticle(html) {
  // Find article content
  const m = html.match(/<article[\s\S]*?<\/article>/i) || html.match(/role="main"[\s\S]*?<\/main>/i);
  return m ? m[0] : html;
}

for (const f of files) {
  const content = fs.readFileSync('scripts/' + f, 'utf8');
  const article = extractArticle(content);
  // Remove scripts/styles
  const cleanHtml = article.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  // Save readable version
  const txtName = f.replace('.html', '_clean.txt');
  // Simple html to markdown/text
  let text = cleanHtml
    .replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n')
    .replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n')
    .replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n')
    .replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '\n* $1')
    .replace(/<tr[^>]*>([\s\S]*?)<\/tr>/gi, '\n| $1 |')
    .replace(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi, ' $1 |')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
  // Collapse whitespace
  text = text.split('\n').map(l => l.trim()).filter(l => l.length > 0).join('\n');
  fs.writeFileSync('scripts/' + txtName, text);
  console.log('Saved', txtName, text.length, 'chars');
}
