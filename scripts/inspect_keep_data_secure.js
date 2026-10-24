const fs = require('fs');

async function main() {
    const authData = JSON.parse(fs.readFileSync('scripts/trailhead_auth.json', 'utf8'));
    const cookieHeader = authData.cookies.map(c => `${c.name}=${c.value}`).join('; ');

    const res = await fetch('https://trailhead.salesforce.com/content/learn/projects/keep-data-secure-in-a-recruiting-app', {
        headers: { 'Cookie': cookieHeader }
    });
    const html = await res.text();
    const regex = /\/content\/learn\/projects\/keep-data-secure-in-a-recruiting-app\/([a-zA-Z0-9_-]+)/g;
    const steps = new Set();
    let m;
    while ((m = regex.exec(html)) !== null) {
        steps.add(m[1]);
    }
    console.log('Project Steps for keep-data-secure-in-a-recruiting-app:');
    const stepList = Array.from(steps);
    console.log(stepList);

    // Now fetch details for each step
    for (const step of stepList) {
        console.log(`\n=================== STEP: ${step} ===================`);
        const sRes = await fetch(`https://trailhead.salesforce.com/content/learn/projects/keep-data-secure-in-a-recruiting-app/${step}`, {
            headers: { 'Cookie': cookieHeader }
        });
        const sHtml = await sRes.text();
        const challengeMatch = sHtml.match(/Hands-on Challenge[\s\S]*?(Check Challenge to Earn \d+ Points|Retake Challenge)/i)
            || sHtml.match(/YOUR CHALLENGE[\s\S]*?(Check Challenge to Earn \d+ Points|Retake Challenge)/i);
        if (challengeMatch) {
            console.log(challengeMatch[0].replace(/<[^>]+>/g, '').trim());
        } else {
            // Check if quiz
            const quizMatch = sHtml.match(/quiz[\s\S]*?(Submit|Earn \d+ Points)/i);
            console.log(quizMatch ? quizMatch[0].replace(/<[^>]+>/g, '').trim() : 'Could not isolate challenge section, preview: ' + sHtml.slice(0, 1000));
        }
    }
}

main().catch(console.error);
