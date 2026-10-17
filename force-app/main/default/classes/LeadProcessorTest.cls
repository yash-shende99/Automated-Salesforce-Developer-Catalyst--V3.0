@isTest
public class LeadProcessorTest {
    @isTest
    private static void testBatchProcessing() {
        List<Lead> testLeads = new List<Lead>();
        for (Integer i = 0; i < 200; i++) {
            testLeads.add(new Lead(
                LastName = 'TestLastName ' + i,
                Company = 'TestCompany ' + i,
                Status = 'Open - Not Contacted'
            ));
        }
        insert testLeads;

        Test.startTest();
        LeadProcessor processor = new LeadProcessor();
        Id batchId = Database.executeBatch(processor);
        Test.stopTest();

        List<Lead> updatedLeads = [SELECT Id, LeadSource FROM Lead WHERE LeadSource = 'Dreamforce'];
        System.assertEquals(200, updatedLeads.size());
    }
}
