PermissionSet ps = [SELECT Id FROM PermissionSet WHERE Name = 'Manage_Job_Applications' LIMIT 1];
try {
    FieldPermissions fp = new FieldPermissions(
        ParentId = ps.Id,
        SobjectType = 'Job_Application__c',
        Field = 'Job_Application__c.Candidate__c',
        PermissionsRead = true,
        PermissionsEdit = false
    );
    insert fp;
    System.debug('Inserted Candidate__c fp successfully: ' + fp.Id);
} catch (Exception e) {
    System.debug('Error inserting Candidate__c fp: ' + e.getMessage());
}
