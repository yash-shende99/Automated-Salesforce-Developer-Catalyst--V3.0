public class DailyLeadProcessor implements Schedulable {
    public void execute(SchedulableContext sc) {
        List<Lead> leads = [SELECT Id, LeadSource FROM Lead WHERE LeadSource = NULL LIMIT 200];
        List<Lead> leadsToUpdate = new List<Lead>();
        for (Lead l : leads) {
            l.LeadSource = 'Dreamforce';
            leadsToUpdate.add(l);
        }
        if (!leadsToUpdate.isEmpty()) {
            update leadsToUpdate;
        }
    }
}
