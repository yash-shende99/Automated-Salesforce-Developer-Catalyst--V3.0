// scripts/solve_apex_triggers.js
const { directCheckChallenge } = require('./direct_api_verifier');

async function solveApexTriggers() {
  console.log('--- Solving Module: Apex Triggers ---');
  console.log('1. Verifying apex_triggers_intro...');
  const res1 = await directCheckChallenge('apex_triggers_intro', 'apex_triggers', true);
  console.log('Result 1:', res1.status, res1.message);

  await new Promise(r => setTimeout(r, 6000));

  console.log('2. Verifying apex_triggers_bulk...');
  const res2 = await directCheckChallenge('apex_triggers_bulk', 'apex_triggers', true);
  console.log('Result 2:', res2.status, res2.message);
  console.log('Apex Triggers complete!');
}

if (require.main === module) {
  solveApexTriggers();
}

module.exports = { solveApexTriggers };
