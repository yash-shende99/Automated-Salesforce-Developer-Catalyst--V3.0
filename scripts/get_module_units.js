const fs = require('fs');

async function getUnits(slug, isProject = false) {
  const folder = isProject ? 'projects' : 'modules';
  const url = `https://trailhead.salesforce.com/content/learn/${folder}/${slug}`;
  console.log('Fetching', url);
  const res = await fetch(url);
  const html = await res.text();
  const unitLinks = [...html.matchAll(new RegExp(`/content/learn/${folder}/${slug}/([^"/?#]+)`, 'g'))].map(m => m[1]);
  const uniqueUnits = [...new Set(unitLinks)].filter(u => !u.includes('&quot;'));
  console.log('Units for', slug, ':', uniqueUnits);
  return uniqueUnits;
}

const slug = process.argv[2] || 'customize-a-salesforce-object';
const isProj = process.argv[3] === 'project' || slug.includes('-');
getUnits(slug, isProj);
