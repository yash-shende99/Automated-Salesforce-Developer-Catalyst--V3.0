List<PermissionSet> psList = [SELECT Id FROM PermissionSet WHERE IsOwnedByProfile = true];
List<FieldPermissions> fpList = new List<FieldPermissions>();
for (PermissionSet ps : psList) {
    fpList.add(new FieldPermissions(
        ParentId = ps.Id,
        SobjectType = 'Account',
        Field = 'Account.Number_of_Contacts__c',
        PermissionsRead = true,
        PermissionsEdit = true
    ));
}
Database.insert(fpList, false);
System.debug('Granted FLS for Account.Number_of_Contacts__c to ' + fpList.size() + ' profiles');
