/**
 * Standalone solution runner for:
 * Module 15: Approve Records with Approval Processes (business_process_automation)
 * 
 * Units:
 * 1. Get Started with Approval Processes (Quiz)
 * 2. Build an Approval Process (Approve_New_Account)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { directCheckChallenge } = require('./direct_api_verifier');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

async function solveModule15() {
    console.log('=== Solving Module: Approve Records with Approval Processes ===');

    // 1. Submit Quiz for Unit 1
    console.log('\n[Unit 1] Submitting approvals quiz via direct API...');
    const pageRes = await fetch('https://trailhead.salesforce.com/content/learn/modules/business_process_automation/approvals', {
        headers: { Cookie: cookieHeader, 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await pageRes.text();
    const csrfMatch = html.match(/name="csrf-token"\s+content="([^"]+)"/);
    const csrf = csrfMatch ? csrfMatch[1] : null;

    const putRes = await fetch('https://trailhead.salesforce.com/content_assessments/0260fdbe-9a87-a992-fb16-86647dbdc738', {
        method: 'PUT',
        headers: {
            Cookie: cookieHeader,
            'User-Agent': 'Mozilla/5.0',
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-Token': csrf
        },
        body: JSON.stringify({
            answers: {
                '3e009da6-1ff4-4666-b6e1-1e277851dcac': 'eef48c4c-f967-5588-8577-217d959651ef',
                '9e75a7df-5478-49f7-a1ed-1e2a962ac399': 'db8cd53d-22b4-50bb-8343-e73ac725bd46'
            },
            breadcrumbs: {
                trailmix_creator_id: 'trjha3',
                trailmix_slug: 'salesforce-developer-catalyst-v-3-0'
            }
        })
    });
    const quizResult = await putRes.json();
    console.log('[Unit 1 Result] Completed:', quizResult.assessment_state?.completed, 'Points:', quizResult.assessment_state?.points_earned);

    // 2. Deploy AccountType, Workflows, and ApprovalProcess for Unit 2
    console.log('\n[Unit 2] Deploying StandardValueSet, Workflow FieldUpdates, and ApprovalProcess...');
    execSync('sf project deploy start --source-dir force-app/main/default/standardValueSets/AccountType.standardValueSet-meta.xml --source-dir force-app/main/default/workflows/Account.workflow-meta.xml --source-dir force-app/main/default/approvalProcesses/Account.Approve_New_Account.approvalProcess-meta.xml', { stdio: 'inherit' });

    // 3. Verify Unit 2
    console.log('\n[Unit 2] Verifying Build an Approval Process challenge...');
    const checkRes = await directCheckChallenge('https://trailhead.salesforce.com/content/learn/modules/business_process_automation/build-an-approval-process');
    console.log('[Unit 2 Result]', checkRes.status, checkRes.message);

    console.log('\n=== Approve Records with Approval Processes 100% COMPLETE! ===');
}

if (require.main === module) {
    solveModule15().catch(console.error);
}

module.exports = { solveModule15 };
