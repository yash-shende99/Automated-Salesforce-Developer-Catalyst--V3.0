const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCRIPTS = [
    'solve_create_a_screen_flow_that_checks_for_duplicates.js',
    'solve_screen_flows.js',
    'solve_lightning_app_builder.js',
    'solve_approve_records_with_approval_processes.js',
    'solve_automate_business_processes_for_a_recruiting_app.js',
    'solve_build_a_discount_approval_process.js',
    'solve_quick_start_lightning_app_builder.js',
    'solve_data_management.js',
    'solve_event_monitoring.js',
    'solve_data_security.js',
    'solve_keep_data_secure_in_a_recruiting_app.js',
    'solve_shield_platform_encryption.js',
    'solve_api_basics.js',
    'solve_platform_api_basics.js',
    'solve_apex_basics_for_admins.js',
    'solve_soql_for_admins.js',
    'solve_apex_triggers.js',
    'solve_apex_testing.js',
    'solve_asynchronous_apex.js',
    'solve_apex_integration_services.js',
    'solve_leads_and_opportunities.js',
    'solve_customize_a_salesforce_object.js'
];

async function main() {
    console.log('========================================================================');
    console.log('⚡ STARTING AUTONOMOUS BATCH SOLVER FOR SALESFORCE DEVELOPER CATALYST ⚡');
    console.log('========================================================================\n');

    const results = [];
    const logFile = path.resolve(__dirname, '..', 'scratch', 'batch_execution.log');
    fs.writeFileSync(logFile, `=== Batch Execution Started at ${new Date().toISOString()} ===\n\n`, 'utf8');

    for (let i = 0; i < SCRIPTS.length; i++) {
        const scriptName = SCRIPTS[i];
        const scriptPath = path.resolve(__dirname, scriptName);

        if (!fs.existsSync(scriptPath)) {
            console.warn(`[SKIP] Script not found: ${scriptName}`);
            continue;
        }

        console.log(`\n>>> [${i + 1}/${SCRIPTS.length}] Running: ${scriptName} <<<`);
        fs.appendFileSync(logFile, `>>> [${i + 1}/${SCRIPTS.length}] Running: ${scriptName} <<<\n`);
        const startTime = Date.now();

        try {
            const out = execSync(`node "${scriptPath}"`, {
                cwd: path.resolve(__dirname, '..'),
                encoding: 'utf8',
                timeout: 300000 // 5 min per script max
            });
            const elapsed = Date.now() - startTime;
            console.log(`✅ [${scriptName}] PASSED in ${elapsed}ms`);
            fs.appendFileSync(logFile, `Output:\n${out}\n[SUCCESS in ${elapsed}ms]\n\n`);
            results.push({ script: scriptName, success: true, durationMs: elapsed });
        } catch (err) {
            const elapsed = Date.now() - startTime;
            console.error(`❌ [${scriptName}] FAILED in ${elapsed}ms`);
            console.error(err.stdout ? err.stdout.slice(-500) : err.message);
            fs.appendFileSync(logFile, `Error:\n${err.stdout || ''}\n${err.stderr || ''}\n${err.message}\n[FAILED in ${elapsed}ms]\n\n`);
            results.push({ script: scriptName, success: false, durationMs: elapsed, error: err.message });
        }

        // Cool-down between modules to prevent API rate limiting
        await new Promise(r => setTimeout(r, 3000));
    }

    console.log('\n========================================================================');
    console.log('⚡ BATCH RUN FINISHED. RUNNING FINAL PLAYLIST AUDIT... ⚡');
    console.log('========================================================================\n');

    try {
        const auditOut = execSync('node scripts/playlist_auditor.js', {
            cwd: path.resolve(__dirname, '..'),
            encoding: 'utf8'
        });
        console.log(auditOut);
        fs.appendFileSync(logFile, `\n=== Final Audit ===\n${auditOut}\n`);
    } catch (auditErr) {
        console.error('Audit failed:', auditErr.message);
    }

    fs.writeFileSync(
        path.resolve(__dirname, '..', 'scratch', 'batch_summary.json'),
        JSON.stringify(results, null, 2),
        'utf8'
    );
    console.log('\nAll done! Results saved to scratch/batch_summary.json & scratch/batch_execution.log');
}

main().catch(console.error);
