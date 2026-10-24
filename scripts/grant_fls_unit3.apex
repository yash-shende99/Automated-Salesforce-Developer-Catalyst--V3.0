List<PermissionSet> psList = [SELECT Id FROM PermissionSet WHERE Profile.Name = 'Support User'];
List<FieldPermissions> fpList = new List<FieldPermissions>();
for (PermissionSet ps : psList) {
    fpList.add(new FieldPermissions(
        ParentId = ps.Id,
        SobjectType = 'Case',
        Field = 'Case.Backup_Agent__c',
        PermissionsRead = true,
        PermissionsEdit = true
    ));
}
insert fpList;
System.debug('SUCCESS: Inserted Support User FieldPermission');