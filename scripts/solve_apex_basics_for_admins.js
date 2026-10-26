// scripts/solve_apex_basics_for_admins.js
const { directCheckChallenge } = require('./direct_api_verifier');

async function solveApexBasicsForAdmins() {
  const units = [
    'get-started-with-apex',
    'practice-in-the-developer-console',
    'use-collections',
    'control-data-flow',
    'use-loops'
  ];

  console.log('--- Solving Module: Apex Basics for Admins ---');
  for (const slug of units) {
    console.log(`Checking unit: ${slug}...`);
    try {
      const res = await directCheckChallenge(slug, 'apex-basics-for-admins', true);
      console.log(`Result for ${slug}:`, res.success ? 'PASSED' : res.message);
    } catch (e) {
      console.error(`Error on ${slug}:`, e.message);
    }
    // Pace requests to avoid rate limits
    await new Promise(r => setTimeout(r, 10000));
  }
  console.log('--- Completed Apex Basics for Admins ---');
}

if (require.main === module) {
  solveApexBasicsForAdmins();
}

module.exports = { solveApexBasicsForAdmins };
