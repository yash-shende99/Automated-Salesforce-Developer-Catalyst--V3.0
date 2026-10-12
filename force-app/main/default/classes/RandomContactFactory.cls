public class RandomContactFactory {
    public static List<Contact> generateRandomContacts(Integer numContacts, String lastName) {
        List<Contact> contactList = new List<Contact>();
        for (Integer i = 1; i <= numContacts; i++) {
            Contact c = new Contact(
                FirstName = 'Test ' + i,
                LastName = lastName
            );
            contactList.add(c);
        }
        return contactList;
    }
}
