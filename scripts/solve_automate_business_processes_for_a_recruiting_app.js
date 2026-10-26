/**
 * Standalone Runner & Auditor for:
 * Project: Automate Business Processes for a Recruiting App
 * Units:
 * 1. Build an Automation for Creating Interviewer Records (build-process-interview-records)
 * 2. Lay the Groundwork for an Approval Process (groundwork-approval-process)
 * 3. Create an Approval Process (create-approval-process-rec-app)
 * 4. Create Automation for Submitting Positions for Approval (process-submitting-positions-approval)
 * 5. Create a Candidate Rating Flow (candidate-rating-flow)
 */

const { directCheckChallenge } = require('./direct_api_verifier');

const UNITS = [
  {
    name: 'Unit 1: Build an Automation for Creating Interviewer Records',
    slug: 'build-process-interview-records'
  },
  {
    name: 'Unit 2: Lay the Groundwork for an Approval Process',
    slug: 'groundwork-approval-process'
  },
  {
    name: 'Unit 3: Create an Approval Process',
    slug: 'create-approval-process-rec-app'
  },
  {
    name: 'Unit 4: Create Automation for Submitting Positions for Approval',
    slug: 'process-submitting-positions-approval'
  },
  {
    name: 'Unit 5: Create a Candidate Rating Flow',
    slug: 'candidate-rating-flow'
  }
];

const PROJECT_SLUG = 'automate-business-processes-recruiting-app';

async function main() {
  console.log('=== Verifying Project: Automate Business Processes for a Recruiting App ===\n');
  const results = [];

  for (const unit of UNITS) {
    console.log(`\n------------------------------------------------------`);
    console.log(`Checking ${unit.name} (${unit.slug})...`);
    console.log(`------------------------------------------------------`);

    try {
      const res = await directCheckChallenge(unit.slug, PROJECT_SLUG);
      results.push({ name: unit.name, ...res });
      if (!res.success) {
        console.error(`Unit failed: ${unit.name}. Stopping runner.`);
        break;
      }
    } catch (e) {
      console.error(`Error checking ${unit.name}:`, e.message);
      results.push({ name: unit.name, success: false, error: e.message });
      break;
    }
  }

  console.log('\n======================================================');
  console.log('SUMMARY FOR AUTOMATE BUSINESS PROCESSES FOR A RECRUITING APP');
  console.log('======================================================');
  for (const r of results) {
    const timeStr = r.durationMs ? `${(r.durationMs / 1000).toFixed(1)}s` : '';
    console.log(`${r.success ? '✅ [PASS]' : '❌ [FAIL]'} ${r.name} ${timeStr ? `(${timeStr})` : ''}`);
    if (!r.success) {
      console.log(`   Message: ${r.message || r.error}`);
    }
  }
}

main().catch(console.error);
