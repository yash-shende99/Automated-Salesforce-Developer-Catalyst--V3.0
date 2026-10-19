// Clean up any old test records if present
delete [SELECT Id FROM Opportunity WHERE Name = 'Get Cloudy South - 24 Holiday Sneakers'];
delete [SELECT Id FROM Lead WHERE LastName = 'Smith' AND Company = 'Get Cloudy South'];
delete [SELECT Id FROM Contact WHERE LastName = 'Smith' AND FirstName = 'Chantal'];
delete [SELECT Id FROM Account WHERE Name = 'Get Cloudy South'];

// 1. Create Lead
Lead l = new Lead(
    FirstName = 'Chantal',
    LastName = 'Smith',
    Company = 'Get Cloudy South',
    Status = 'Working - Contacted'
);
insert l;

// 2. Add Task on Lead
Task t = new Task(
    Subject = 'Call Ms. Smith',
    ActivityDate = Date.today().addDays(7),
    WhoId = l.Id,
    Status = 'Not Started'
);
insert t;

// 3. Convert Lead (Do not create opportunity upon conversion)
Database.LeadConvert lc = new Database.LeadConvert();
lc.setLeadId(l.Id);
lc.setDoNotCreateOpportunity(true);
LeadStatus convertStatus = [SELECT Id, MasterLabel FROM LeadStatus WHERE IsConverted=true LIMIT 1];
lc.setConvertedStatus(convertStatus.MasterLabel);
Database.LeadConvertResult lcr = Database.convertLead(lc);
System.assert(lcr.isSuccess());

Id accId = lcr.getAccountId();
Id conId = lcr.getContactId();

// 4. Create Opportunity for Unit 2
Opportunity opp = new Opportunity(
    Name = 'Get Cloudy South - 24 Holiday Sneakers',
    AccountId = accId,
    CloseDate = Date.today().addDays(30),
    StageName = 'Value Proposition'
);
insert opp;

// 5. Add Contact Role
OpportunityContactRole ocr = new OpportunityContactRole(
    OpportunityId = opp.Id,
    ContactId = conId,
    Role = 'Decision Maker',
    IsPrimary = true
);
insert ocr;

System.debug('Setup completed: Lead converted, Opp created with Contact Role!');
