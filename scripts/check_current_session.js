const fs = require('fs');

async function main() {
    const auth = JSON.parse(fs.readFileSync('./scripts/trailhead_auth.json', 'utf8'));
    const cookies = auth.cookies || [];
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    const res = await fetch('https://trailhead.salesforce.com/today', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Cookie': cookieHeader
        }
    });
    const html = await res.text();
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    console.log('Page Title:', titleMatch ? titleMatch[1] : 'No title');
    
    // Look for user identifier or email
    const emails = [...new Set(html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [])];
    console.log('Emails found in page:', emails);
    
    const userNames = html.match(/class="[^"]*user-name[^"]*"[^>]*>([^<]+)/i);
    console.log('User Name found:', userNames ? userNames[1].trim() : 'None');
    
    // Check if logged in
    const isLoggedIn = html.includes('Log Out') || html.includes('logout') || html.includes('profile');
    console.log('Appears logged in:', isLoggedIn);
}

main().catch(console.error);
