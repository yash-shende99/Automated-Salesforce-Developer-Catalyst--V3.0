
List<Contact> toInsert = new List<Contact>();

if ([SELECT count() FROM Contact WHERE LastName = 'Dodge' AND FirstName = 'John'] == 0) {
    toInsert.add(new Contact(
        FirstName = 'John',
        LastName = 'Dodge',
        MobilePhone = '555-888-8888',
        Email = 'jdodge@example.com',
        Salutation = 'Mr.',
        Title = 'SVP of Sales'
    ));
}

if ([SELECT count() FROM Contact WHERE LastName = 'Smith' AND FirstName = 'Sarah'] == 0) {
    toInsert.add(new Contact(
        FirstName = 'Sarah',
        LastName = 'Smith',
        MobilePhone = '555-999-8888',
        Email = 'ssnith@example.com',
        Salutation = 'Ms.',
        Title = 'Senior Sales Rep'
    ));
}

if ([SELECT count() FROM Contact WHERE LastName = 'Dapper' AND FirstName = 'George'] == 0) {
    toInsert.add(new Contact(
        FirstName = 'George',
        LastName = 'Dapper',
        MobilePhone = '555-999-0000',
        Email = 'gdapper@example.com',
        Salutation = 'Dr.',
        Title = 'Director of Healthcare'
    ));
}

if ([SELECT count() FROM Contact WHERE LastName = 'Dodge' AND FirstName = 'Jack'] == 0) {
    toInsert.add(new Contact(
        FirstName = 'Jack',
        LastName = 'Dodge',
        MobilePhone = '555-888-8888',
        Email = 'jdodge2@example.com',
        Salutation = 'Mr.',
        Title = 'EVP of Sales'
    ));
}

if ([SELECT count() FROM Contact WHERE LastName = 'Jones' AND FirstName = 'Jessica'] == 0) {
    toInsert.add(new Contact(
        FirstName = 'Jessica',
        LastName = 'Jones',
        MobilePhone = '555-999-8888',
        Email = 'jjones@example.com',
        Salutation = 'Mrs.',
        Title = 'Senior Sales Rep'
    ));
}

if ([SELECT count() FROM Contact WHERE LastName = 'Davich' AND FirstName = 'Dragon'] == 0) {
    toInsert.add(new Contact(
        FirstName = 'Dragon',
        LastName = 'Davich',
        MobilePhone = '555-999-0000',
        Email = 'dragonr@example.com',
        Salutation = 'Dr.',
        Title = 'Senior Member of Medical Staff'
    ));
}

if ([SELECT count() FROM Contact WHERE LastName = 'Curio' AND FirstName = 'Steve'] == 0) {
    toInsert.add(new Contact(
        FirstName = 'Steve',
        LastName = 'Curio',
        MobilePhone = '555-555-5454',
        Email = 'curious@example.com',
        Salutation = 'Mr.',
        Title = 'Janitor'
    ));
}

if ([SELECT count() FROM Contact WHERE LastName = 'Black' AND FirstName = 'Laura'] == 0) {
    toInsert.add(new Contact(
        FirstName = 'Laura',
        LastName = 'Black',
        MobilePhone = '555-555-3434',
        Email = 'black@example.com',
        Salutation = 'Ms.',
        Title = 'Sales Rep'
    ));
}

if ([SELECT count() FROM Contact WHERE LastName = 'Blake' AND FirstName = 'Wilhelm'] == 0) {
    toInsert.add(new Contact(
        FirstName = 'Wilhelm',
        LastName = 'Blake',
        MobilePhone = '555-555-5543',
        Email = 'wblake@example.com',
        Salutation = 'Mr.',
        Title = 'CEO'
    ));
}

if ([SELECT count() FROM Contact WHERE LastName = 'Drake' AND FirstName = 'Winter'] == 0) {
    toInsert.add(new Contact(
        FirstName = 'Winter',
        LastName = 'Drake',
        MobilePhone = '555-555-5554',
        Email = 'dragon2@example.com',
        Salutation = 'Mr.',
        Title = 'CFO'
    ));
}

if ([SELECT count() FROM Contact WHERE LastName = 'Sands' AND FirstName = 'Sal'] == 0) {
    toInsert.add(new Contact(
        FirstName = 'Sal',
        LastName = 'Sands',
        MobilePhone = '555-555-5553',
        Email = 'sandssquared@example.com',
        Salutation = 'Mr.',
        Title = 'CTO'
    ));
}

if ([SELECT count() FROM Contact WHERE LastName = 'Wilds' AND FirstName = 'Julia'] == 0) {
    toInsert.add(new Contact(
        FirstName = 'Julia',
        LastName = 'Wilds',
        MobilePhone = '555-555-9988',
        Email = 'jwilds@example.com',
        Salutation = 'Ms.',
        Title = 'CMO'
    ));
}

if ([SELECT count() FROM Contact WHERE LastName = 'Birsch' AND FirstName = 'Juniper'] == 0) {
    toInsert.add(new Contact(
        FirstName = 'Juniper',
        LastName = 'Birsch',
        MobilePhone = '555-555-5432',
        Email = 'woodsy@example.com',
        Salutation = 'Mrs.',
        Title = 'Director of Engineering'
    ));
}

if ([SELECT count() FROM Contact WHERE LastName = 'Duncan' AND FirstName = 'Valerie'] == 0) {
    toInsert.add(new Contact(
        FirstName = 'Valerie',
        LastName = 'Duncan',
        MobilePhone = '555-555-3433',
        Email = 'vduncan@example.com',
        Salutation = 'Ms.',
        Title = 'Senior Member, Technical Staff'
    ));
}

if ([SELECT count() FROM Contact WHERE LastName = 'Patel' AND FirstName = 'Patti'] == 0) {
    toInsert.add(new Contact(
        FirstName = 'Patti',
        LastName = 'Patel',
        MobilePhone = '555-555-4334',
        Email = 'ppatel@example.com',
        Salutation = 'Mrs.',
        Title = 'Head of Software Engineering'
    ));
}

if ([SELECT count() FROM Contact WHERE LastName = 'Short' AND FirstName = 'Justin'] == 0) {
    toInsert.add(new Contact(
        FirstName = 'Justin',
        LastName = 'Short',
        MobilePhone = '555-445-3343',
        Email = 'jshort@example.com',
        Salutation = 'Mr.',
        Title = 'Actor'
    ));
}

if ([SELECT count() FROM Contact WHERE LastName = 'Downes' AND FirstName = 'John'] == 0) {
    toInsert.add(new Contact(
        FirstName = 'John',
        LastName = 'Downes',
        MobilePhone = '555-444-0117',
        Email = 'bungie@example.com',
        Salutation = 'Mr.',
        Title = 'Master Chief'
    ));
}

if ([SELECT count() FROM Contact WHERE LastName = 'Birch' AND FirstName = 'Xavier'] == 0) {
    toInsert.add(new Contact(
        FirstName = 'Xavier',
        LastName = 'Birch',
        MobilePhone = '555-000-0333',
        Email = 'xjb@example.com',
        Salutation = 'Mr.',
        Title = 'Chair of Genealogy'
    ));
}

if ([SELECT count() FROM Contact WHERE LastName = 'Wenceslas' AND FirstName = 'Basil'] == 0) {
    toInsert.add(new Contact(
        FirstName = 'Basil',
        LastName = 'Wenceslas',
        MobilePhone = '555-666-3433',
        Email = 'hansa@example.com',
        Salutation = 'Chairman',
        Title = 'Chairman'
    ));
}

if ([SELECT count() FROM Contact WHERE LastName = 'Black' AND FirstName = 'Alice'] == 0) {
    toInsert.add(new Contact(
        FirstName = 'Alice',
        LastName = 'Black',
        MobilePhone = '555-555-5555',
        Email = 'blackalice@example.com',
        Salutation = 'Ms.',
        Title = 'Botanist'
    ));
}

if (!toInsert.isEmpty()) {
    insert toInsert;
    System.debug('Inserted ' + toInsert.size() + ' contacts.');
} else {
    System.debug('All contacts already exist.');
}
