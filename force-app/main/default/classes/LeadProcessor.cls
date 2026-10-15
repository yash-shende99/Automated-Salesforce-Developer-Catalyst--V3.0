public class LeadProcessor implements Database.Batchable<sObject> {
    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator([SELECT Id, LeadSource FROM Lead]);
    }

    public void execute(Database.BatchableContext bc, List<Lead> scope) {
        List<Lead> leadsToUpdate = new List<Lead>();
        for (Lead lead : scope) {
            lead.LeadSource = 'Dreamforce';
            leadsToUpdate.add(lead);
        }
        if (!leadsToUpdate.isEmpty()) {
            update leadsToUpdate;
        }
    }

    public void finish(Database.BatchableContext bc) {
    }
}
