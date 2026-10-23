try {
    List<SObject> opps = Database.query('SELECT Id, Name, Close_Reason__c FROM Opportunity WHERE Close_Reason__c != null');
    System.debug('Opp with Close_Reason count: ' + opps.size());
    for (SObject o : opps) {
        System.debug('Opp: ' + o.get('Name') + ' Close_Reason: ' + o.get('Close_Reason__c'));
        o.put('Close_Reason__c', null);
    }
    update opps;
    System.debug('Cleared Close_Reason__c on all opps successfully.');
} catch (Exception e) {
    System.debug('Exception querying Close_Reason__c: ' + e.getMessage());
}
