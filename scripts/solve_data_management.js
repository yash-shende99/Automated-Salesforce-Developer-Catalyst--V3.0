/**
 * Solution runner for Module 19: Data Management (lex_implementation_data_management)
 * Unit 1: Import Data (Hands-on Challenge - 500 pts)
 * Unit 2: Export Data (Quiz - 100 pts)
 */
const { execSync } = require('child_process');

async function main() {
    console.log('=== SOLVING MODULE: Data Management (lex_implementation_data_management) ===\n');
    
    console.log('1. Executing Contact Data Import...');
    execSync('node scripts/import_contacts.js', { stdio: 'inherit' });

    console.log('2. Verifying Unit 1: Import Data...');
    const { directCheckChallenge } = require('./direct_api_verifier');
    const u1Res = await directCheckChallenge('https://trailhead.salesforce.com/content/learn/modules/lex_implementation_data_management/lex_implementation_data_import');
    console.log('Unit 1 Result:', JSON.stringify(u1Res, null, 2));

    console.log('3. Solving Unit 2 Quiz: Export Data...');
    execSync('node scripts/solve_export_quiz.js', { stdio: 'inherit' });

    console.log('\n=== ALL UNITS IN DATA MANAGEMENT COMPLETED! ===');
}

main().catch(console.error);
