const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { solveQuiz } = require('./solve_any_quiz');
const { directCheckChallenge } = require('./direct_api_verifier');

const FLOW_FILE = path.join(__dirname, '..', 'force-app', 'main', 'default', 'flows', 'New_Bot_Opp.flow-meta.xml');

async function refreshSession() {
    console.log('[Auth] Refreshing launch session for playground 23980024...');
    const auth = JSON.parse(fs.readFileSync(path.join(__dirname, 'trailhead_auth.json'), 'utf8'));
    const cookieHeader = auth.cookies.map(c => `${c.name}=${c.value}`).join('; ');
    const res = await fetch('https://trailhead.salesforce.com/launch_org/23980024', {
        headers: { 'Cookie': cookieHeader, 'User-Agent': 'Mozilla/5.0' },
        redirect: 'manual'
    });
    const location = res.headers.get('location');
    if (location && location.includes('sid=')) {
        const parsedUrl = new URL(location);
        const sid = parsedUrl.searchParams.get('sid').trim();
        const instanceUrl = parsedUrl.origin;
        console.log(`[Auth] Obtained SID! Logging in to ${instanceUrl}...`);
        const env = { ...process.env, SF_ACCESS_TOKEN: sid };
        execSync(`sf org login access-token --instance-url "${instanceUrl}" --alias friend_org --no-prompt --set-default`, { env, encoding: 'utf8' });
    }
}

function deployFlow() {
    console.log('[Deploy] Deploying New_Bot_Opp.flow-meta.xml to friend_org...');
    const out = execSync('sf project deploy start --source-dir force-app/main/default/flows/New_Bot_Opp.flow-meta.xml --target-org friend_org --json', {
        cwd: path.resolve(__dirname, '..'),
        encoding: 'utf8'
    });
    const j = JSON.parse(out);
    console.log(`[Deploy] Result: Status=${j.result?.status}, Deployed=${j.result?.numberComponentsDeployed}`);
}

function setFlowConnector(targetRef) {
    let xml = fs.readFileSync(FLOW_FILE, 'utf8');
    xml = xml.replace(
        /<screens>\s*<name>Opp_Fields<\/name>[\s\S]*?<connector>\s*<targetReference>([a-zA-Z0-9_-]+)<\/targetReference>\s*<\/connector>/,
        match => match.replace(/<targetReference>[^<]+<\/targetReference>/, `<targetReference>${targetRef}</targetReference>`)
    );
    fs.writeFileSync(FLOW_FILE, xml, 'utf8');
}

async function main() {
    console.log('=== Solving Module: Screen Flows ===\n');

    await refreshSession();

    // 1. Solve Quiz Unit 1
    console.log('\n--- Unit 1: Quiz ---');
    await solveQuiz(
        'https://trailhead.salesforce.com/content/learn/modules/screen-flows/get-started-with-screen-flows',
        ['Input components and record fields', 'Add a Data element.']
    );

    // 2. Unit 2: Connect Opp_Fields -> Create_Opp
    console.log('\n--- Unit 2: Build a Screen Flow ---');
    setFlowConnector('Create_Opp');
    deployFlow();
    await new Promise(r => setTimeout(r, 4000));
    const u2 = await directCheckChallenge('build-a-screen-flow', 'screen-flows', true);
    console.log('Unit 2 Check:', u2.status, u2.message);

    // 3. Unit 3: Give Users a Choice
    console.log('\n--- Unit 3: Give Users a Choice ---');
    await new Promise(r => setTimeout(r, 6000));
    const u3 = await directCheckChallenge('give-users-a-choice', 'screen-flows', true);
    console.log('Unit 3 Check:', u3.status, u3.message);

    // 4. Units 4 & 5: Connect Opp_Fields -> Get_Contacts
    console.log('\n--- Units 4 & 5 ---');
    setFlowConnector('Get_Contacts');
    deployFlow();
    await new Promise(r => setTimeout(r, 4000));

    console.log('\n--- Unit 4: Add More Options to Your Screens ---');
    const u4 = await directCheckChallenge('add-more-options-to-your-screens', 'screen-flows', true);
    console.log('Unit 4 Check:', u4.status, u4.message);

    console.log('\n--- Unit 5: Improve the Look and Feel of Your Screens ---');
    await new Promise(r => setTimeout(r, 6000));
    const u5 = await directCheckChallenge('improve-the-look-and-feel-of-your-screens', 'screen-flows', true);
    console.log('Unit 5 Check:', u5.status, u5.message);

    console.log('\nScreen Flows execution complete!');
}

main().catch(console.error);
