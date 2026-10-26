// scripts/solve_apex_testing.js
const { directCheckChallenge } = require('./direct_api_verifier');

async function solveApexTesting() {
  console.log('--- Solving Module: Apex Testing ---');
  const units = ['apex_testing_intro', 'apex_testing_triggers', 'apex_testing_data'];
  for (const slug of units) {
    console.log(`Checking ${slug}...`);
    const res = await directCheckChallenge(slug, 'apex_testing', true);
    console.log(`Result for ${slug}:`, res.status, res.message);
    await new Promise(r => setTimeout(r, 6000));
  }
  console.log('Apex Testing complete!');
}

if (require.main === module) {
  solveApexTesting();
}

module.exports = { solveApexTesting };
