Id adminPsId = [SELECT Id FROM PermissionSet WHERE IsOwnedByProfile = true AND Profile.Name = 'System Administrator' LIMIT 1].Id;
List<FieldPermissions> existing = [SELECT Id FROM FieldPermissions WHERE ParentId = :adminPsId AND Field = 'Account.Match_Billing_Address__c'];
if (existing.isEmpty()) {
    insert new FieldPermissions(
        ParentId = adminPsId,
        SobjectType = 'Account',
        Field = 'Account.Match_Billing_Address__c',
        PermissionsRead = true,
        PermissionsEdit = true
    );
}
System.debug('FLS granted for Match_Billing_Address__c');
