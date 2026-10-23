List<UserRole> ceos = [SELECT Id FROM UserRole WHERE DeveloperName = 'CEO' LIMIT 1];
Id ceoId = ceos.isEmpty() ? null : ceos[0].Id;

// 1. VP Human Resources
List<UserRole> vpHrs = [SELECT Id FROM UserRole WHERE Name = 'VP Human Resources' OR DeveloperName = 'VP_Human_Resources' OR DeveloperName = 'VPHumanResources'];
UserRole vpHr;
if (vpHrs.isEmpty()) {
    vpHr = new UserRole(
        Name = 'VP Human Resources',
        DeveloperName = 'VP_Human_Resources',
        ParentRoleId = ceoId
    );
    insert vpHr;
    System.debug('Created VP Human Resources: ' + vpHr.Id);
} else {
    vpHr = vpHrs[0];
    System.debug('Found VP Human Resources: ' + vpHr.Id);
}

// 2. Recruiting Manager
List<UserRole> recMgrs = [SELECT Id, ParentRoleId FROM UserRole WHERE DeveloperName = 'Recruiting_Manager' OR Name = 'Recruiting Manager'];
UserRole recMgr;
if (recMgrs.isEmpty()) {
    recMgr = new UserRole(
        Name = 'Recruiting Manager',
        DeveloperName = 'Recruiting_Manager',
        ParentRoleId = vpHr.Id
    );
    insert recMgr;
    System.debug('Created Recruiting Manager: ' + recMgr.Id);
} else {
    recMgr = recMgrs[0];
    recMgr.ParentRoleId = vpHr.Id;
    update recMgr;
    System.debug('Updated Recruiting Manager: ' + recMgr.Id);
}

// 3. Recruiter
List<UserRole> recruiters = [SELECT Id, ParentRoleId FROM UserRole WHERE DeveloperName = 'Recruiter' OR Name = 'Recruiter'];
UserRole recruiter;
if (recruiters.isEmpty()) {
    recruiter = new UserRole(
        Name = 'Recruiter',
        DeveloperName = 'Recruiter',
        ParentRoleId = recMgr.Id
    );
    insert recruiter;
    System.debug('Created Recruiter: ' + recruiter.Id);
} else {
    recruiter = recruiters[0];
    recruiter.ParentRoleId = recMgr.Id;
    update recruiter;
    System.debug('Updated Recruiter: ' + recruiter.Id);
}
