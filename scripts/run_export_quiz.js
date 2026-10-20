const { solveQuiz } = require('./solve_any_quiz');

async function main() {
    const url = 'https://trailhead.salesforce.com/content/learn/modules/lex_implementation_data_management/lex_implementation_data_export';
    const answers = [
        'Is accessible through the Setup menu.',
        'From Setup, open Data Export and then select Export Now.',
        'Monthly'
    ];
    await solveQuiz(url, answers);
}

main().catch(console.error);
