const { createFormulaField } = require('./metadata_builder');

console.log("Generating metadata for 'Create Cross-Object Formulas'...");

createFormulaField({
    objectName: 'Review__c',
    fieldName: 'Candidate_Name__c',
    label: 'Candidate Name',
    returnType: 'Text',
    formula: 'Job_Application__r.Candidate__r.First_Name__c & " " & Job_Application__r.Candidate__r.Last_Name__c'
});

console.log("Ready for deployment!");
