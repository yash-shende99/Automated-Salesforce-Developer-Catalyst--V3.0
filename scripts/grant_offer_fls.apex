PermissionSet adminPs = [SELECT Id FROM PermissionSet WHERE IsOwnedByProfile = true AND Profile.Name = 'System Administrator' LIMIT 1];

List<String> fields = new List<String>{
    'Offer__c.Offer_Amount__c',
    'Offer__c.Target_Close_Date__c',
    'Offer__c.Contact__c'
};

List<FieldPermissions> fps = new List<FieldPermissions>();
for (String f : fields) {
    fps.add(new FieldPermissions(
        ParentId = adminPs.Id,
        SobjectType = 'Offer__c',
        Field = f,
        PermissionsRead = true,
        PermissionsEdit = true
    ));
}

Database.insert(fps, false);
System.debug('FLS granted for Offer__c fields!');
