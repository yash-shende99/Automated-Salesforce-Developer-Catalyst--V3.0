/**
 * Automate Business Processes for a Recruiting App
 * Trailhead Project Solver & Verifier
 * Project: automate-business-processes-recruiting-app
 * Units:
 * 1. build-process-interview-records
 * 2. groundwork-approval-process
 * 3. create-approval-process-rec-app
 * 4. process-submitting-positions-approval
 * 5. candidate-rating-flow
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
const TARGET_ORG = 'trailhead';

const PROJECT_BASE = 'https://trailhead.salesforce.com/content/learn/projects/automate-business-processes-recruiting-app';

const UNITS = [
  {
    name: 'Unit 1: Build an Automation for Creating Interviewer Records',
    slug: 'build-process-interview-records',
    url: `${PROJECT_BASE}/build-process-interview-records`
  },
  {
    name: 'Unit 2: Lay the Groundwork for an Approval Process',
    slug: 'groundwork-approval-process',
    url: `${PROJECT_BASE}/groundwork-approval-process`
  },
  {
    name: 'Unit 3: Create an Approval Process',
    slug: 'create-approval-process-rec-app',
    url: `${PROJECT_BASE}/create-approval-process-rec-app`
  },
  {
    name: 'Unit 4: Create Automation for Submitting Positions for Approval',
    slug: 'process-submitting-positions-approval',
    url: `${PROJECT_BASE}/process-submitting-positions-approval`
  },
  {
    name: 'Unit 5: Create a Candidate Rating Flow',
    slug: 'candidate-rating-flow',
    url: `${PROJECT_BASE}/candidate-rating-flow`
  }
];

// Helper to make HTTPS requests
function httpRequest(url, options = {}, postData = null) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(opts, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function getAuth() {
  if (!fs.existsSync(AUTH_FILE)) throw new Error('Missing trailhead_auth.json');
  return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
}

async function verifyUnit(unit, cachedCsrfToken = null) {
  const auth = getAuth();
  const cookies = auth.cookieHeader || Object.entries(auth.cookies).map(([k, v]) => `${k}=${v}`).join('; ');
  
  console.log(`\n======================================================`);
  console.log(`[VERIFYING] ${unit.name}`);
  console.log(`[URL] ${unit.url}`);
  console.log(`======================================================`);

  const t0 = Date.now();
  let csrfToken = cachedCsrfToken;

  // 1. Fetch challenge details from HTML
  const pageRes = await httpRequest(unit.url, {
    method: 'GET',
    headers: {
      'Cookie': cookies,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  });

  if (!csrfToken) {
    const m = pageRes.body.match(/<meta\s+name=["']csrf-token["']\s+content=["']([^"']+)["']/i);
    csrfToken = m ? m[1] : null;
  }

  // Find challenge data
  const chMatch = pageRes.body.match(/data-react-class=["']challenge\/Challenge["']\s+data-react-props=["']([^"']+)["']/i);
  if (!chMatch) {
    throw new Error('Could not find Challenge React props on page');
  }

  const props = JSON.parse(chMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
  const challenge = props.challenge;
  const contentUid = challenge.content_uid;
  const hocContext = challenge.assessment_evaluation_context;
  const userOrg = hocContext.authorized_accounts.find(a => a.active_org) || hocContext.authorized_accounts[0];

  console.log(`Content UID: ${contentUid}`);
  console.log(`Active Org: ${userOrg.name} (${userOrg.salesforce_organization_id})`);

  // 2. Submit verification request
  const submitUrl = `https://trailhead.salesforce.com/content_assessments/${contentUid}/assess`;
  const payload = JSON.stringify({
    salesforce_organization_id: userOrg.salesforce_organization_id,
    type: 'hoc',
    evaluation_context: hocContext
  });

  const postRes = await httpRequest(submitUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      'Cookie': cookies,
      'User-Agent': 'Mozilla/5.0'
    }
  }, payload);

  if (postRes.status !== 200 && postRes.status !== 202) {
    console.error('Submit failed:', postRes.status, postRes.body);
    throw new Error(`Submit failed with status ${postRes.status}`);
  }

  const assessData = JSON.parse(postRes.body);
  const assessmentId = assessData.assessment_id || assessData.id;
  console.log(`Assessment ID: ${assessmentId}, polling for completion...`);

  // 3. Fast Poll (500ms intervals)
  const pollUrl = `https://trailhead.salesforce.com/content_assessments/${contentUid}/assessment_status?assessment_id=${assessmentId}`;
  let complete = false;
  let result = null;

  while (!complete) {
    await new Promise(r => setTimeout(r, 500));
    const pollRes = await httpRequest(pollUrl, {
      method: 'GET',
      headers: {
        'Cookie': cookies,
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (pollRes.status === 200) {
      result = JSON.parse(pollRes.body);
      if (result.status === 'completed' || result.status === 'passed' || result.status === 'failed' || result.is_completed) {
        complete = true;
      }
    }
  }

  const durationSec = ((Date.now() - t0) / 1000).toFixed(1);
  const passed = result.is_passed || result.status === 'passed' || (result.result && result.result.passed);

  if (passed) {
    console.log(`>>> [PASSED] ${unit.name} in ${durationSec}s! (Earned points)`);
  } else {
    console.error(`>>> [FAILED] ${unit.name} in ${durationSec}s:`, JSON.stringify(result.error || result.feedback || result));
  }

  return { passed, durationSec, result, csrfToken };
}

module.exports = { UNITS, verifyUnit };
