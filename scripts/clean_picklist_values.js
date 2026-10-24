const { execSync } = require('child_process');

async function main() {
    // Query current metadata
    const query = JSON.parse(execSync('sf data query --query "SELECT Id, Metadata FROM CustomField WHERE TableEnumOrId = \'Opportunity\' AND DeveloperName = \'Approval_Status\'" --use-tooling-api --json').toString());
    const record = query.result.records[0];
    const meta = record.Metadata;
    
    // Filter out 'Not Approved' completely
    meta.valueSet.valueSetDefinition.value = meta.valueSet.valueSetDefinition.value.filter(v => v.valueName !== 'Not Approved');
    console.log('Cleaned picklist values:', meta.valueSet.valueSetDefinition.value);

    // Update via Tooling API
    const fs = require('fs');
    fs.writeFileSync('./scratch/clean_cf.json', JSON.stringify({ Metadata: meta }), 'utf8');

    const updateOut = execSync(`sf data update record --sobject CustomField --record-id ${record.Id} --values-file scratch/clean_cf.json --use-tooling-api --json`, { encoding: 'utf8' });
    console.log('Update result:\n', updateOut);
}

main().catch(console.error);
