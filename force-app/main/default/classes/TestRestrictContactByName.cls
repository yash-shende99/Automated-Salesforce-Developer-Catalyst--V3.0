@isTest
private class TestRestrictContactByName {
    @isTest
    static void testInsertInvalidContact() {
        Contact badContact = new Contact(FirstName = 'John', LastName = 'INVALIDNAME');
        Test.startTest();
        Database.SaveResult res = Database.insert(badContact, false);
        Test.stopTest();
        System.assert(!res.isSuccess());
    }
    
    @isTest
    static void testUpdateInvalidContact() {
        Contact goodContact = new Contact(FirstName = 'Jane', LastName = 'Doe');
        insert goodContact;
        goodContact.LastName = 'INVALIDNAME';
        Test.startTest();
        Database.SaveResult res = Database.update(goodContact, false);
        Test.stopTest();
        System.assert(!res.isSuccess());
    }
}
