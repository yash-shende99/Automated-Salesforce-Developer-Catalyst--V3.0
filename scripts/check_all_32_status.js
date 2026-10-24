const fs = require('fs');

const items = [
  { slug: 'trailhead_basics', type: 'modules' },
  { slug: 'starting_force_com', type: 'modules' },
  { slug: 'lex_customization', type: 'modules' },
  { slug: 'data_modeling', type: 'modules' },
  { slug: 'picklist_admin', type: 'modules' },
  { slug: 'sales_admin_duplicate_management', type: 'modules' },
  { slug: 'customize-a-salesforce-object', type: 'projects' },
  { slug: 'point_click_business_logic', type: 'modules' },
  { slug: 'improve-data-quality-for-a-recruiting-app', type: 'projects' },
  { slug: 'customize-the-ui-for-a-recruiting-app', type: 'projects' },
  { slug: 'flow-basics', type: 'modules' },
  { slug: 'build-a-simple-flow', type: 'projects' },
  { slug: 'screen-flows', type: 'modules' },
  { slug: 'lightning_app_builder', type: 'modules' },
  { slug: 'business_process_automation', type: 'modules' },
  { slug: 'automate-business-processes-recruiting-app', type: 'projects' },
  { slug: 'build-a-discount-approval-process', type: 'projects' },
  { slug: 'quickstart-app-builder', type: 'projects' },
  { slug: 'lex_implementation_data_management', type: 'modules' },
  { slug: 'event_monitoring', type: 'modules' },
  { slug: 'data_security', type: 'modules' },
  { slug: 'keep-data-secure-in-a-recruiting-app', type: 'projects' },
  { slug: 'spe_admins', type: 'modules' },
  { slug: 'pw-api-basics', type: 'modules' },
  { slug: 'api_basics', type: 'modules' },
  { slug: 'apex-basics-for-admins', type: 'modules' },
  { slug: 'soql-for-admins', type: 'modules' },
  { slug: 'apex_triggers', type: 'modules' },
  { slug: 'apex_testing', type: 'modules' },
  { slug: 'asynchronous_apex', type: 'modules' },
  { slug: 'apex_integration_services', type: 'modules' },
  { slug: 'leads_opportunities_lightning_experience', type: 'modules' }
];

async function checkAll() {
  const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
  const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

  console.log(`Checking status of all ${items.length} items for Gaurav...\n`);
  const results = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const url = `https://trailhead.salesforce.com/content/learn/${item.type}/${item.slug}`;
    try {
      const res = await fetch(url, { headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0' } });
      const html = await res.text();
      
      // Look for completion markers in HTML:
      // Often badge_earned: true, or points earned == total points, or "completed": true in module props
      const isCompleted = html.includes('"badge_earned":true') || 
                          html.includes('"is_completed":true') ||
                          html.includes('badge-earned') ||
                          html.includes('Earned Badge') ||
                          (html.match(/badge.*?earned/i) !== null);

      // Also check if any units are incomplete
      const pendingMatches = html.match(/"completed":false/g) || [];
      const completedMatches = html.match(/"completed":true/g) || [];

      results.push({
        num: i + 1,
        slug: item.slug,
        type: item.type,
        completed: isCompleted,
        completedUnits: completedMatches.length,
        pendingUnits: pendingMatches.length
      });
      console.log(`[${i + 1}/${items.length}] ${item.slug} -> completed: ${isCompleted} (done units: ${completedMatches.length}, pending: ${pendingMatches.length})`);
    } catch (e) {
      console.log(`[${i + 1}/${items.length}] ${item.slug} -> ERROR: ${e.message}`);
    }
  }

  const doneList = results.filter(r => r.completed || (r.pendingUnits === 0 && r.completedUnits > 0));
  const pendingList = results.filter(r => !(r.completed || (r.pendingUnits === 0 && r.completedUnits > 0)));

  console.log(`\n================ SUMMARY ================`);
  console.log(`Total items: ${items.length}`);
  console.log(`COMPLETED: ${doneList.length}`);
  console.log(`PENDING: ${pendingList.length}`);
  console.log(`Pending items:`, pendingList.map(p => `[#${p.num}] ${p.slug}`));
}

checkAll().catch(console.error);
