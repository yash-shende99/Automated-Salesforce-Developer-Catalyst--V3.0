@isTest
public class AddPrimaryContactTest {
    @testSetup
    static void setup() {
        List<Account> accounts = new List<Account>();
        for (Integer i = 0; i < 50; i++) {
            accounts.add(new Account(Name = 'Test Account NY ' + i, BillingState = 'NY'));
        }
        for (Integer i = 0; i < 50; i++) {
            accounts.add(new Account(Name = 'Test Account CA ' + i, BillingState = 'CA'));
        }
        insert accounts;
    }

    @isTest
    static void testQueueable() {
        Contact testContact = new Contact(FirstName = 'John', LastName = 'Doe');
        AddPrimaryContact updater = new AddPrimaryContact(testContact, 'CA');
        
        Test.startTest();
        System.enqueueJob(updater);
        Test.stopTest();
        
        List<Contact> insertedContacts = [SELECT Id FROM Contact WHERE Account.BillingState = 'CA'];
        System.assertEquals(50, insertedContacts.size());
    }
}
