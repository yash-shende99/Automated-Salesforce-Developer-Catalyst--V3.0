const fs = require('fs');

function extract(filename) {
    const html = fs.readFileSync(filename, 'utf8');
    // Look for challenge text or instructions at the bottom
    const idx = html.toLowerCase().lastIndexOf('challenge');
    if (idx !== -1) {
        const slice = html.slice(idx, idx + 4000);
        console.log(`=== Challenge from ${filename} ===`);
        console.log(slice.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').slice(0, 2000));
    }
}

extract('scripts/lex_implementation_data_management_lex_implementation_data_import.html');
extract('scripts/lex_implementation_data_management_lex_implementation_data_export.html');
