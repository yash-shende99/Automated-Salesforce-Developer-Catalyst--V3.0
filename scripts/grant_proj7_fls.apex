List<String> fields = new List<String>{
    'Account.Has_Support_Plan__c',
    'Account.Support_Plan_Expiration_Date__c',
    'Opportunity.Discount_Percentage__c',
    'Opportunity.Commission__c',
    'Opportunity.Region_Zone__c',
    'Opportunity.Amount_After_Discount__c',
    'Case.Backup_Agent__c'
};

Id adminPsId = [SELECT Id FROM PermissionSet WHERE IsOwnedByProfile = true AND Profile.Name = 'System Administrator' LIMIT 1].Id;

List<FieldPermissions> toInsert = new List<FieldPermissions>();
for (String f : fields) {
    String sobj = f.split('\\.')[0];
    toInsert.add(new FieldPermissions(
        ParentId = adminPsId,
        SobjectType = sobj,
        Field = f,
        PermissionsRead = true,
        PermissionsEdit = true
    ));
}

Database.insert(toInsert, false);
System.debug('FLS granted successfully for Project 7 fields');
