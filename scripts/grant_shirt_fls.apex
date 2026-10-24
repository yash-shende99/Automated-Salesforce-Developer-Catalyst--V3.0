List<PermissionSet> psets = [SELECT Id FROM PermissionSet WHERE IsOwnedByProfile = true];
List<FieldPermissions> fps = new List<FieldPermissions>();
for (PermissionSet ps : psets) {
    fps.add(new FieldPermissions(
        ParentId = ps.Id,
        SobjectType = 'Product2',
        Field = 'Product2.Shirt__c',
        PermissionsRead = true,
        PermissionsEdit = true
    ));
}
Database.insert(fps, false);
System.debug('FLS granted for Product2.Shirt__c');
