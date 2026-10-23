// Grant Read/Edit on Program__c.Type__c to Admin Profile and custom Permission Sets
List<PermissionSet> adminPs = [SELECT Id FROM PermissionSet WHERE IsOwnedByProfile = true AND Profile.Name = 'System Administrator'];
if (!adminPs.isEmpty()) {
    List<FieldPermissions> existing = [SELECT Id FROM FieldPermissions WHERE ParentId = :adminPs[0].Id AND Field = 'Program__c.Type__c'];
    if (existing.isEmpty()) {
        insert new FieldPermissions(
            ParentId = adminPs[0].Id,
            SobjectType = 'Program__c',
            Field = 'Program__c.Type__c',
            PermissionsRead = true,
            PermissionsEdit = true
        );
        System.debug('Granted Admin FLS on Program__c.Type__c');
    }
}
