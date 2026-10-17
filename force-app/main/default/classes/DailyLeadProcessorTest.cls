@isTest
private class DailyLeadProcessorTest {
    public static String CRON_EXP = '0 0 0 * * ?';

    @testSetup
    static void setup() {
        List<Lead> leads = new List<Lead>();
        for (Integer i = 0; i < 200; i++) {
            leads.add(new Lead(
                LastName = 'TestLead ' + i,
                Company = 'Test Company ' + i,
                Status = 'Open - Not Contacted'
            ));
        }
        insert leads;
    }

    @isTest
    static void testDailyLeadProcessor() {
        Test.startTest();
        String jobId = System.schedule('DailyLeadProcessorCoded', CRON_EXP, new DailyLeadProcessor());
        Test.stopTest();

        List<Lead> updatedLeads = [SELECT Id, LeadSource FROM Lead WHERE LeadSource = 'Dreamforce'];
        System.assertEquals(200, updatedLeads.size());
    }
}
