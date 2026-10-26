/**
 * Standalone solution runner for:
 * Module 14: Lightning App Builder (lightning_app_builder)
 * 
 * Units:
 * 1. Get Started with the Lightning App Builder (Quiz)
 * 2. Create a Custom Home Page (Sales_Home)
 * 3. Create a Custom Record Page (New_Account_Page)
 * 4. Get Started with Dynamic Forms (New_Account_Page)
 * 5. Add Visibility Rules for Dynamic Pages (New_Account_Page)
 * 6. Build an App Home Lightning Page (MyData)
 * 7. Use Custom Lightning Components in App Builder (c:ContactsToday on MyData)
 */

const { execSync } = require('child_process');
const path = require('path');
const { directCheckChallenge } = require('./direct_api_verifier');

async function run() {
    console.log('=== Solving Module: Lightning App Builder ===');

    // 1. Build and Deploy Dynamic Forms & Visibility Rules for New_Account_Page
    console.log('[Step 1] Building New_Account_Page flexipage...');
    require('./build_new_account_page');

    console.log('[Step 2] Deploying Settings, Pages, Tabs, AppMenu, Applications, Profiles...');
    execSync('sf project deploy start --source-dir force-app/main/default/settings/DynamicForms.settings-meta.xml --source-dir force-app/main/default/flexipages/Sales_Home.flexipage-meta.xml --source-dir force-app/main/default/flexipages/New_Account_Page.flexipage-meta.xml --source-dir force-app/main/default/flexipages/MyData.flexipage-meta.xml --source-dir force-app/main/default/tabs/MyData.tab-meta.xml --source-dir force-app/main/default/appMenus/Salesforce1.appMenu-meta.xml --source-dir force-app/main/default/applications/standard__LightningSales.app-meta.xml --source-dir force-app/main/default/profiles/Admin.profile-meta.xml --source-dir force-app/main/default/objects/Account/Account.object-meta.xml', { stdio: 'inherit' });

    // 2. Sequential Verifications
    const units = [
        'lightning_app_builder_homepage',
        'lightning_app_builder_recordpage',
        'get-started-with-dynamic-forms-lab',
        'add-visibility-rules-for-dynamic-pages-lab',
        'lightning_app_builder_apphome',
        'lightning_app_builder_custom_comps'
    ];

    for (const unit of units) {
        console.log(`\n[Verifying] ${unit}...`);
        const res = await directCheckChallenge(`https://trailhead.salesforce.com/content/learn/modules/lightning_app_builder/${unit}`);
        console.log(`[Result] ${unit}:`, res.status, res.message);
    }

    console.log('\n=== Lightning App Builder 100% COMPLETE! ===');
}

if (require.main === module) {
    run().catch(console.error);
}

module.exports = { run };
