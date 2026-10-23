List<String> ind = new List<String>();
for (Schema.PicklistEntry pe : Account.Industry.getDescribe().getPicklistValues()) {
    ind.add(pe.getValue());
}
System.debug('INDUSTRY:' + String.join(ind, ','));

List<String> typ = new List<String>();
for (Schema.PicklistEntry pe : Account.Type.getDescribe().getPicklistValues()) {
    typ.add(pe.getValue());
}
System.debug('TYPE:' + String.join(typ, ','));
