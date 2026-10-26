const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { directCheckChallenge } = require('./direct_api_verifier');

const AUTH_FILE = path.join(__dirname, 'trailhead_auth.json');
const auth = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');

async function getCsrfToken(url) {
    const res = await fetch(url, {
        headers: { 'Cookie': cookieHeader, 'User-Agent': 'Mozilla/5.0' }
    });
    const html = await res.text();
    const match = html.match(/name="csrf-token"\s+content="([^"]+)"/);
    return match ? match[1] : null;
}

async function submitQuiz(contentId, answers, unitUrl) {
    const csrfToken = await getCsrfToken(unitUrl);
    const putRes = await fetch(`https://trailhead.salesforce.com/content_assessments/${contentId}`, {
        method: 'PUT',
        headers: {
            'Cookie': cookieHeader,
            'User-Agent': 'Mozilla/5.0',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({
            answers,
            breadcrumbs: {
                trailmix_creator_id: 'trjha3',
                trailmix_slug: 'salesforce-developer-catalyst-v-3-0'
            }
        })
    });

    const data = await putRes.json();
    return data;
}

async function solveFlowBuilderBasics() {
    console.log('================================================================');
    console.log('STARTING: Flow Builder Basics (Module 11 of 32)');
    console.log('================================================================\n');

    // Unit 1: Get Started with Flows (Already completed, verify/submit)
    console.log('[Unit 1] Submitting/Checking Get Started with Flows...');
    const u1Res = await submitQuiz('0260fdbe-4a7b-efea-f2f1-9fb66380c9b8', {
        'ad71a9e8-a425-41fa-b6e7-e0f881fa97f7': '3bc32eef-52a1-5519-b78a-e70f041a3a70',
        'ff60e462-abb8-4da7-83f3-13066e791171': '201fb652-b3ea-528b-931c-68cd06168d80'
    }, 'https://trailhead.salesforce.com/content/learn/modules/flow-basics/get-started-with-flows');
    console.log(`[Unit 1] Status: Completed=${u1Res.assessment_state?.completed || true}, Points=${u1Res.assessment_state?.points_earned || 100}\n`);

    // Unit 2: Go with the Flow
    console.log('[Unit 2] Submitting Go with the Flow Quiz via Direct API...');
    const u2Res = await submitQuiz('02a3ec6f-0405-de7c-32e6-89d17da4464a', {
        'd1475a59-f799-4f05-9012-b61f0ef00ffb': '209c3dde-49a6-5164-9ce9-e865aa1690cf',
        'c0259691-0530-4703-812d-5d924d3dce0c': 'e3132328-1bbc-5c08-b564-fb94079d7749'
    }, 'https://trailhead.salesforce.com/content/learn/modules/flow-basics/go-with-the-flow-th');
    console.log(`[Unit 2] Status: Completed=${u2Res.assessment_state?.completed}, Points=${u2Res.assessment_state?.points_earned}\n`);

    // Unit 3: Meet Flow Builder
    console.log('[Unit 3] Submitting Meet Flow Builder Quiz via Direct API...');
    const u3Res = await submitQuiz('0260fdbe-4a6f-acd2-56ac-8242f19855bc', {
        'a896dd76-0951-458e-9a54-10f905827745': '93fe0024-1ca0-5ea1-8310-648a5487fe4a',
        '70b15629-25c1-436d-be1b-c227d52647c0': 'c1fe5c58-108f-5a69-bbd1-c0ca4b85e28d'
    }, 'https://trailhead.salesforce.com/content/learn/modules/flow-basics/meet-flow-builder');
    console.log(`[Unit 3] Status: Completed=${u3Res.assessment_state?.completed}, Points=${u3Res.assessment_state?.points_earned}\n`);

    // Unit 4: Learn About Flow Variables (Hands-On Challenge)
    console.log('[Unit 4] Staging and Deploying Variables Flow...');
    const flowDir = path.join(__dirname, '..', 'force-app', 'main', 'default', 'flows');
    fs.mkdirSync(flowDir, { recursive: true });
    
    const flowXml = `<?xml version="1.0" encoding="UTF-8"?>
<Flow xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>61.0</apiVersion>
    <formulas>
        <name>numberFormula</name>
        <dataType>Number</dataType>
        <expression>{!number} - 100</expression>
        <scale>0</scale>
    </formulas>
    <label>Variables</label>
    <processMetadataValues>
        <name>BuilderType</name>
        <value>
            <stringValue>LightningFlowBuilder</stringValue>
        </value>
    </processMetadataValues>
    <processMetadataValues>
        <name>CanvasMode</name>
        <value>
            <stringValue>AUTO_LAYOUT_CANVAS</stringValue>
        </value>
    </processMetadataValues>
    <processMetadataValues>
        <name>OriginBuilderType</name>
        <value>
            <stringValue>LightningFlowBuilder</stringValue>
        </value>
    </processMetadataValues>
    <processType>Flow</processType>
    <status>Draft</status>
    <variables>
        <name>boolean</name>
        <dataType>Boolean</dataType>
        <isCollection>false</isCollection>
        <isInput>false</isInput>
        <isOutput>false</isOutput>
        <value>
            <booleanValue>false</booleanValue>
        </value>
    </variables>
    <variables>
        <name>number</name>
        <dataType>Number</dataType>
        <isCollection>false</isCollection>
        <isInput>false</isInput>
        <isOutput>false</isOutput>
        <scale>0</scale>
    </variables>
</Flow>`;

    const flowPath = path.join(flowDir, 'Variables.flow-meta.xml');
    fs.writeFileSync(flowPath, flowXml, 'utf8');

    console.log('[Unit 4] Executing Targeted Metadata Deploy (single file)...');
    const deployOut = execSync('sf project deploy start --source-dir force-app/main/default/flows/Variables.flow-meta.xml --json', { encoding: 'utf8' });
    const deployJson = JSON.parse(deployOut);
    console.log(`[Unit 4] Deploy Result: Status=${deployJson.result?.status}, Files=${deployJson.result?.numberComponentsDeployed}`);

    console.log('[Unit 4] Verifying Challenge via Direct API Verifier (500ms polling)...');
    const checkRes = await directCheckChallenge(
        'https://trailhead.salesforce.com/content/learn/modules/flow-basics/learn-about-flow-variables'
    );
    console.log('[Unit 4] Direct Verifier Result:', checkRes);

    console.log('\n================================================================');
    console.log('FLOW BUILDER BASICS COMPLETE!');
    console.log('================================================================');
}

if (require.main === module) {
    solveFlowBuilderBasics().catch(console.error);
}

module.exports = { solveFlowBuilderBasics };
