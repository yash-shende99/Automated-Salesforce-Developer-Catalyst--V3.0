const fs = require('fs');

async function findContent(url) {
  const res = await fetch(url);
  const html = await res.text();
  const matches = [...html.matchAll(/data-react-props="([^"]+)"/g)];
  console.log('Matches count:', matches.length);
  for (let i = 0; i < matches.length; i++) {
    const raw = matches[i][1].replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
    try {
      const obj = JSON.parse(raw);
      console.log(`Match ${i} keys:`, Object.keys(obj));
      if (obj.body) console.log(`Match ${i} body length:`, obj.body.length);
      if (obj.content) console.log(`Match ${i} content keys:`, Object.keys(obj.content));
      if (obj.instructions) console.log(`Match ${i} instructions length:`, obj.instructions.length);
    } catch (e) {}
  }

  // Also check for <div class="challenge..." or hands-on
  const challengeMatch = html.match(/<section[^>]*class="[^"]*challenge[^"]*"[^>]*>([\s\S]*?)<\/section>/i) ||
                         html.match(/<div[^>]*class="[^"]*challenge[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (challengeMatch) {
    console.log('Found challenge section in HTML!');
    fs.writeFileSync('scripts/scratch/challenge_section.html', challengeMatch[0]);
  } else {
    console.log('No direct challenge section found');
  }
}

const targetUrl = process.argv[2] || 'https://trailhead.salesforce.com/content/learn/projects/customize-a-salesforce-object/standard-custom-fields';
findContent(targetUrl);
