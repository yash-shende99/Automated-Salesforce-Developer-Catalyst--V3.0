PermissionSet adminPs = [SELECT Id FROM PermissionSet WHERE IsOwnedByProfile = true AND Profile.Name = 'System Administrator' LIMIT 1];

FieldPermissions fp = new FieldPermissions(
    ParentId = adminPs.Id,
    SobjectType = 'Product2',
    Field = 'Product2.Macaron_Flavor__c',
    PermissionsRead = true,
    PermissionsEdit = true
);

Database.insert(fp, false);
System.debug('FLS granted for Product2.Macaron_Flavor__c');
