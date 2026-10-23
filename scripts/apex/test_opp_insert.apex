try {
    Opportunity opp = new Opportunity(
        Name = 'Test Opp ' + System.currentTimeMillis(),
        StageName = 'Prospecting',
        CloseDate = Date.today().addDays(30)
    );
    insert opp;
    System.debug('Successfully inserted opportunity: ' + opp.Id);
    delete opp;
    System.debug('Successfully cleaned up test opportunity');
} catch (Exception e) {
    System.debug('ERROR inserting opportunity: ' + e.getMessage() + '\nStack: ' + e.getStackTraceString());
}
