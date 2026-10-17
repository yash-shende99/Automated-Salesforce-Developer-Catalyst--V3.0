@isTest
private class AccountManagerTest {
    @isTest
    static void testGetAccount() {
        Account testAcc = new Account(Name = 'Test Account');
        insert testAcc;
        
        Contact testCon = new Contact(FirstName = 'John', LastName = 'Doe', AccountId = testAcc.Id);
        insert testCon;
        
        RestRequest request = new RestRequest();
        request.requestUri = 'https://creative-badger-i5mqnc-dev-ed.trailblaze.my.salesforce.com/services/apexrest/Accounts/' + testAcc.Id + '/contacts';
        request.httpMethod = 'GET';
        RestContext.request = request;
        
        Account result = AccountManager.getAccount();
        System.assert(result != null);
        System.assertEquals('Test Account', result.Name);
    }
}
