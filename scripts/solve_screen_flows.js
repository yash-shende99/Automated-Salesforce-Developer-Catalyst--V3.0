const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { directCheckChallenge } = require('./direct_api_verifier');

const MODULE_SLUG = 'screen-flows';
const FLOW_FILE = path.join(__dirname, '..', 'force-app', 'main', 'default', 'flows', 'New_Bot_Opp.flow-meta.xml');

async function checkUnit(slug, name) {
    console.log(`\n------------------------------------------------------------`);
    console.log(`[VERIFYING] ${name}...`);
    console.log(`------------------------------------------------------------`);
    const unitUrl = `https://trailhead.salesforce.com/content/learn/modules/${MODULE_SLUG}/${slug}`;
    const res = await directCheckChallenge(unitUrl);
    console.log(`Result: Success=${res.success}, Duration=${res.durationMs}ms, Msg=${res.message}`);
    return res;
}

function deployFlow() {
    console.log('[Deploy] Targeted deploying New_Bot_Opp.flow-meta.xml...');
    const out = execSync('sf project deploy start --source-dir force-app/main/default/flows/New_Bot_Opp.flow-meta.xml --json', { encoding: 'utf8' });
    const j = JSON.parse(out);
    console.log(`[Deploy] Result: Status=${j.result?.status}, Files=${j.result?.numberComponentsDeployed}`);
}

async function solveScreenFlows() {
    console.log('================================================================');
    console.log('STARTING: Screen Flows (Module 13 of 32)');
    console.log('================================================================\n');

    // Unit 2: Build a Screen Flow (checks Opp_Fields -> Create_Opp)
    const u2Res = await checkUnit('build-a-screen-flow', 'Unit 2: Build a Screen Flow');
    if (!u2Res.success) {
        console.error('Unit 2 failed! Halting.');
        return;
    }

    // Unit 3: Give Users a Choice (checks picklist & checkbox group on Opp_Fields)
    const u3Res = await checkUnit('give-users-a-choice', 'Unit 3: Give Users a Choice');
    if (!u3Res.success) {
        console.error('Unit 3 failed! Halting.');
        return;
    }

    // Reconnect Opp_Fields -> Get_Contacts for Unit 4 and Unit 5
    console.log('\n[Flow Reconnect] Routing Opp_Fields -> Get_Contacts for Units 4 and 5...');
    let xml = fs.readFileSync(FLOW_FILE, 'utf8');
    xml = xml.replace(
        /<screens>\s*<name>Opp_Fields<\/name>[\s\S]*?<connector>\s*<targetReference>Create_Opp<\/targetReference>\s*<\/connector>/,
        match => match.replace('<targetReference>Create_Opp</targetReference>', '<targetReference>Get_Contacts</targetReference>')
    );
    fs.writeFileSync(FLOW_FILE, xml, 'utf8');
    deployFlow();

    // Unit 4: Add More Options to Your Screens
    const u4Res = await checkUnit('add-more-options-to-your-screens', 'Unit 4: Add More Options to Your Screens');
    if (!u4Res.success) {
        console.error('Unit 4 failed! Halting.');
        return;
    }

    // Unit 5: Improve the Look and Feel of Your Screens
    const u5Res = await checkUnit('improve-the-look-and-feel-of-your-screens', 'Unit 5: Improve the Look and Feel of Your Screens');
    if (!u5Res.success) {
        console.error('Unit 5 failed! Halting.');
        return;
    }

    console.log('\n================================================================');
    console.log('SCREEN FLOWS MODULE COMPLETE!');
    console.log('================================================================');
}

if (require.main === module) {
    solveScreenFlows().catch(console.error);
}

module.exports = { solveScreenFlows };
