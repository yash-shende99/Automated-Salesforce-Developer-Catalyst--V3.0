List<PermissionSet> psList = [SELECT Id FROM PermissionSet WHERE IsOwnedByProfile = true];
List<FieldPermissions> fpList = new List<FieldPermissions>();

for (PermissionSet ps : psList) {
    // Contract.Days_Remaining__c (Formula - read only)
    fpList.add(new FieldPermissions(
        ParentId = ps.Id,
        SobjectType = 'Contract',
        Field = 'Contract.Days_Remaining__c',
        PermissionsRead = true,
        PermissionsEdit = false
    ));
    // Account.Potential_Value__c (Summary - read only)
    fpList.add(new FieldPermissions(
        ParentId = ps.Id,
        SobjectType = 'Account',
        Field = 'Account.Potential_Value__c',
        PermissionsRead = true,
        PermissionsEdit = false
    ));
}

Database.insert(fpList, false);
System.debug('Granted FLS for Contract.Days_Remaining__c and Account.Potential_Value__c');
