List<PermissionSet> psList = [SELECT Id, Profile.Name FROM PermissionSet WHERE Profile.Name IN ('System Administrator', 'Sales User', 'Support User')];
List<FieldPermissions> fpList = new List<FieldPermissions>();
List<String> fields = new List<String>{'Lead.Region__c', 'Account.Region__c', 'Account.Zone__c', 'Opportunity.Close_Reason__c'};
for (PermissionSet ps : psList) {
    for (String fld : fields) {
        String sobj = fld.split('\\.')[0];
        fpList.add(new FieldPermissions(
            ParentId = ps.Id,
            SobjectType = sobj,
            Field = fld,
            PermissionsRead = true,
            PermissionsEdit = true
        ));
    }
}
insert fpList;
System.debug('SUCCESS: Inserted ' + fpList.size() + ' FieldPermissions for Unit 2');