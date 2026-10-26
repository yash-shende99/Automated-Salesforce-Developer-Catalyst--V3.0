const { solveQuizDirect } = require('./direct_quiz_solver');

async function main() {
    const contentId = '0260fdbe-77d1-1c01-95cd-9dd31d5671a4';
    const targetAnswers = [
        'Permission Sets',
        'Organization-Wide Defaults'
    ];
    const res = await solveQuizDirect(contentId, targetAnswers);
    console.log('Result:', JSON.stringify(res, null, 2));
}

main().catch(console.error);
