public class AddPrimaryContact implements Queueable {
    private Contact contactObj;
    private String stateAbbr;

    public AddPrimaryContact(Contact contactObj, String stateAbbr) {
        this.contactObj = contactObj;
        this.stateAbbr = stateAbbr;
    }

    public void execute(QueueableContext context) {
        List<Account> accounts = [SELECT Id, Name FROM Account WHERE BillingState = :stateAbbr LIMIT 200];
        List<Contact> contactsToInsert = new List<Contact>();

        for (Account acc : accounts) {
            Contact clonedContact = contactObj.clone(false, false, false, false);
            clonedContact.AccountId = acc.Id;
            contactsToInsert.add(clonedContact);
        }

        if (!contactsToInsert.isEmpty()) {
            insert contactsToInsert;
        }
    }
}
