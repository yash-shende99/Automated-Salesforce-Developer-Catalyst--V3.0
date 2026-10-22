const fs = require('fs');
const path = require('path');

function extractChallengeProps(html) {
    const match = html.match(/data-react-class="challenge\/Challenge"\s+data-react-props="([^"]+)"/) ||
                  html.match(/data-react-props="([^"]+)"\s+data-react-class="challenge\/Challenge"/);
    if (!match) return null;
    const decoded = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'");
    return JSON.parse(decoded);
}

const html = fs.readFileSync(path.join(__dirname, 'scratch', 'compact_layouts.html'), 'utf8');
const props = extractChallengeProps(html);
console.log('Props keys:', Object.keys(props));
console.log('Challenge:', JSON.stringify(props.challenge, null, 2));
