List<String> fields = new List<String>{
    'Account.Region__c',
    'Account.Zone__c',
    'Lead.Region__c',
    'Opportunity.Close_Reason__c'
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
System.debug('FLS granted successfully for Unit 2 fields');
