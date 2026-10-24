List<PermissionSet> psList = [SELECT Id FROM PermissionSet WHERE IsOwnedByProfile = true];
List<FieldPermissions> fpList = new List<FieldPermissions>();
for (PermissionSet ps : psList) {
    fpList.add(new FieldPermissions(
        ParentId = ps.Id,
        SobjectType = 'Program__c',
        Field = 'Program__c.Type__c',
        PermissionsRead = true,
        PermissionsEdit = true
    ));
}
Database.insert(fpList, false);
System.debug('Granted FLS for Program__c.Type__c to ' + fpList.size() + ' profiles');
