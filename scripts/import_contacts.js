const fs = require('fs');
const { execSync } = require('child_process');

async function main() {
    const csv = fs.readFileSync('scripts/contacts_to_import.csv', 'utf8');
    const lines = csv.trim().split('\n').filter(Boolean);
    const header = lines[0].split(',').map(h => h.trim());
    console.log('Header:', header);

    const contacts = [];
    for (let i = 1; i < lines.length; i++) {
        // Handle quotes in CSV
        const line = lines[i];
        const row = [];
        let inQuotes = false;
        let token = '';
        for (let c = 0; c < line.length; c++) {
            const ch = line[c];
            if (ch === '"') {
                inQuotes = !inQuotes;
            } else if (ch === ',' && !inQuotes) {
                row.push(token.trim());
                token = '';
            } else {
                token += ch;
            }
        }
        row.push(token.trim());

        // FNAME, LNAME, CELL, EMAIL, SALUTATION, TITLE
        const [fname, lname, cell, email, salutation, title] = row;
        if (lname) {
            contacts.push({
                FirstName: fname || '',
                LastName: lname,
                MobilePhone: cell || '',
                Email: email || '',
                Salutation: salutation || '',
                Title: title || ''
            });
        }
    }

    console.log(`Parsed ${contacts.length} contacts`);

    // Build Apex script to insert them (check duplicates first)
    const apex = `
List<Contact> toInsert = new List<Contact>();
${contacts.map(c => `
if ([SELECT count() FROM Contact WHERE LastName = '${c.LastName.replace(/'/g, "\\'")}' AND FirstName = '${c.FirstName.replace(/'/g, "\\'")}'] == 0) {
    toInsert.add(new Contact(
        FirstName = '${c.FirstName.replace(/'/g, "\\'")}',
        LastName = '${c.LastName.replace(/'/g, "\\'")}',
        MobilePhone = '${c.MobilePhone.replace(/'/g, "\\'")}',
        Email = '${c.Email.replace(/'/g, "\\'")}',
        Salutation = '${c.Salutation.replace(/'/g, "\\'")}',
        Title = '${c.Title.replace(/'/g, "\\'")}'
    ));
}`).join('\n')}

if (!toInsert.isEmpty()) {
    insert toInsert;
    System.debug('Inserted ' + toInsert.size() + ' contacts.');
} else {
    System.debug('All contacts already exist.');
}
`;

    fs.writeFileSync('scripts/insert_contacts.apex', apex, 'utf8');
    console.log('Executing Apex insert...');
    const out = execSync('sf apex run -f scripts/insert_contacts.apex -o friend_org').toString();
    console.log(out);
}

main().catch(console.error);
