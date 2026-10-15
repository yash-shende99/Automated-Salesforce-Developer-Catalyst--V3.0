public class AccountProcessor {
    @future
    public static void countContacts(List<Id> accountIds) {
        List<Account> accountsToUpdate = [
            SELECT Id, Number_Of_Contacts__c, (SELECT Id FROM Contacts) 
            FROM Account 
            WHERE Id IN :accountIds
        ];
        
        for (Account acc : accountsToUpdate) {
            acc.Number_Of_Contacts__c = acc.Contacts.size();
        }
        
        if (!accountsToUpdate.isEmpty()) {
            update accountsToUpdate;
        }
    }
}
