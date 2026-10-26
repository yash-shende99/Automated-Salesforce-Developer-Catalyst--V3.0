// scripts/solve_apex_integration_services.js
const { directCheckChallenge } = require('./direct_api_verifier');

async function solveApexIntegrationServices() {
  console.log('--- Solving Module: Apex Integration Services ---');
  const units = [
    'apex_integration_callouts',
    'apex_integration_rest_callouts',
    'apex_integration_soap_callouts',
    'apex_integration_webservices'
  ];
  for (const slug of units) {
    console.log(`Checking ${slug}...`);
    const res = await directCheckChallenge(slug, 'apex_integration_services', true);
    console.log(`Result for ${slug}:`, res.status, res.message);
    await new Promise(r => setTimeout(r, 6000));
  }
  console.log('Apex Integration Services complete!');
}

if (require.main === module) {
  solveApexIntegrationServices();
}

module.exports = { solveApexIntegrationServices };
