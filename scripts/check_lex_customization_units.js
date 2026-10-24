const fs = require('fs');

async function checkModuleUnits(moduleSlug = 'lex_customization') {
    const authData = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
    const cookies = authData.cookies.map(c => `${c.name}=${c.value}`).join('; ');
    const url = `https://trailhead.salesforce.com/content/learn/modules/${moduleSlug}`;
    
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Cookie': cookies
        }
    });
    const html = await res.text();

    const units = [
        'lex_customization_list',
        'lex_customization_custom_objects',
        'lex_customization_apps',
        'lex_customization_compact_layouts',
        'lex_customization_page_layouts',
        'lex_customization_buttons_links',
        'lex_customization_actions'
    ];

    for (const unit of units) {
        const uUrl = `https://trailhead.salesforce.com/content/learn/modules/${moduleSlug}/${unit}`;
        const uRes = await fetch(uUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Cookie': cookies
            }
        });
        const uHtml = await uRes.text();
        const completed = uHtml.includes('Retake Challenge') || uHtml.includes('Retake Quiz') || uHtml.includes('Earned +');
        const isQuiz = uHtml.includes('data-quiz-url') || uHtml.includes('Take the Quiz') || uHtml.includes('question_');
        const titleMatch = uHtml.match(/<h1[^>]*>([^<]+)<\/h1>/);
        const title = titleMatch ? titleMatch[1].trim() : unit;
        console.log(`Unit: ${unit} | Completed: ${completed} | isQuiz: ${isQuiz} | Title: ${title}`);
    }
}

checkModuleUnits().catch(console.error);
