@isTest
private class AccountProcessorTest {
    @isTest
    private static void testCountContacts() {
        Account acc = new Account(Name = 'Test Account');
        insert acc;
        
        Contact con1 = new Contact(FirstName = 'John', LastName = 'Doe', AccountId = acc.Id);
        Contact con2 = new Contact(FirstName = 'Jane', LastName = 'Doe', AccountId = acc.Id);
        insert new List<Contact>{ con1, con2 };
            
        List<Id> accountIds = new List<Id>{ acc.Id };
            
        Test.startTest();
        AccountProcessor.countContacts(accountIds);
        Test.stopTest();
        
        Account updatedAccount = [SELECT Number_Of_Contacts__c FROM Account WHERE Id = :acc.Id];
        System.assertEquals(2, updatedAccount.Number_Of_Contacts__c);
    }
}
