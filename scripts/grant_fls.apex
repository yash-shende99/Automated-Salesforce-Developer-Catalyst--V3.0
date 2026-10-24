List<PermissionSet> psList = [SELECT Id, Profile.Name FROM PermissionSet WHERE Profile.Name IN ('System Administrator', 'Sales User', 'Support User')];
List<FieldPermissions> fpList = new List<FieldPermissions>();
for (PermissionSet ps : psList) {
    fpList.add(new FieldPermissions(
        ParentId = ps.Id,
        SobjectType = 'Account',
        Field = 'Account.Support_Plan_Expiration_Date__c',
        PermissionsRead = true,
        PermissionsEdit = true
    ));
}
insert fpList;
System.debug('SUCCESS: Inserted ' + fpList.size() + ' FieldPermissions');