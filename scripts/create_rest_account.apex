Account a = new Account(
    Name = 'Blackbeards Coconut Milk Emporium',
    Description = 'The finest coconut milk in the seven seas.'
);
insert a;
System.debug('Account created with Id: ' + a.Id);
