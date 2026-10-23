// Grant Object Permissions on Program__c to all Profile PermissionSets that can take it
List<PermissionSet> psets = [SELECT Id, Name, Profile.Name FROM PermissionSet WHERE IsOwnedByProfile = true];
Set<Id> existingPsetIds = new Set<Id>();
for (ObjectPermissions op : [SELECT ParentId FROM ObjectPermissions WHERE SobjectType = 'Program__c']) {
    existingPsetIds.add(op.ParentId);
}

List<ObjectPermissions> opsToInsert = new List<ObjectPermissions>();
for (PermissionSet ps : psets) {
    if (!existingPsetIds.contains(ps.Id)) {
        opsToInsert.add(new ObjectPermissions(
            ParentId = ps.Id,
            SobjectType = 'Program__c',
            PermissionsRead = true,
            PermissionsCreate = true,
            PermissionsEdit = true
        ));
    }
}
Database.SaveResult[] results = Database.insert(opsToInsert, false);
Integer count = 0;
for (Database.SaveResult sr : results) {
    if (sr.isSuccess()) count++;
}
System.debug('Granted Program__c ObjectPermissions to ' + count + ' profile permission sets.');

// Also ensure Kathy Cooper has a dedicated permission set for Program__c if her profile couldn't be directly updated
List<PermissionSet> existingCustomPs = [SELECT Id FROM PermissionSet WHERE Name = 'Program_Full_Access'];
PermissionSet targetPs;
if (existingCustomPs.isEmpty()) {
    targetPs = new PermissionSet(Name = 'Program_Full_Access', Label = 'Program Full Access');
    insert targetPs;
    insert new ObjectPermissions(
        ParentId = targetPs.Id,
        SobjectType = 'Program__c',
        PermissionsRead = true,
        PermissionsCreate = true,
        PermissionsEdit = true
    );
    insert new FieldPermissions(
        ParentId = targetPs.Id,
        SobjectType = 'Program__c',
        Field = 'Program__c.Type__c',
        PermissionsRead = true,
        PermissionsEdit = true
    );
} else {
    targetPs = existingCustomPs[0];
}

User kathy = [SELECT Id FROM User WHERE Name = 'Kathy Cooper' LIMIT 1];
List<PermissionSetAssignment> existingPsa = [SELECT Id FROM PermissionSetAssignment WHERE AssigneeId = :kathy.Id AND PermissionSetId = :targetPs.Id];
if (existingPsa.isEmpty()) {
    insert new PermissionSetAssignment(AssigneeId = kathy.Id, PermissionSetId = targetPs.Id);
    System.debug('Assigned Program_Full_Access to Kathy Cooper');
}
