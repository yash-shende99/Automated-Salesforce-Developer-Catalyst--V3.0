List<Opportunity> opps = [SELECT Id, Name, StageName FROM Opportunity];
System.debug('Total Opportunities: ' + opps.size());
for (Opportunity o : opps) {
    System.debug('Opp: ' + o.Name + ' [' + o.StageName + ']');
}
