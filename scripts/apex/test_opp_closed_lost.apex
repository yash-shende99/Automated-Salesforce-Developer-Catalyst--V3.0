try {
    Opportunity opp = new Opportunity(
        Name = 'Test Lost Opp ' + System.currentTimeMillis(),
        StageName = 'Closed Lost',
        CloseDate = Date.today(),
        Close_Reason__c = 'Lost: Competitor'
    );
    insert opp;
    System.debug('Successfully inserted Closed Lost opportunity with reason: ' + opp.Id);
    delete opp;
    System.debug('Successfully cleaned up test opportunity');
} catch (Exception e) {
    System.debug('ERROR: ' + e.getMessage());
}
