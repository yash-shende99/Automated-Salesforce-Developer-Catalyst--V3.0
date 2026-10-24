const fs = require('fs');
const html = fs.readFileSync('scripts/lex_implementation_data_management_lex_implementation_data_import.html', 'utf8');
const regex = /href="([^"]+)"/g;
let match;
while ((match = regex.exec(html)) !== null) {
    if (match[1].includes('.csv') || match[1].includes('Contact') || match[1].includes('Lead') || match[1].includes('download')) {
        console.log('Match:', match[1]);
    }
}
// Also search for "Download this CSV file"
const idx = html.indexOf('Download this CSV file');
if (idx !== -1) {
    console.log('Context around "Download this CSV file":');
    console.log(html.slice(idx - 100, idx + 300));
}
