@isTest
private class TestVerifyDate {
    @isTest
    static void testCheckDatesIn30Days() {
        Date d1 = Date.newInstance(2026, 3, 1);
        Date d2 = d1.addDays(10);
        Date result = VerifyDate.CheckDates(d1, d2);
        System.assertEquals(d2, result);
    }

    @isTest
    static void testCheckDatesPast() {
        Date d1 = Date.newInstance(2026, 3, 10);
        Date d2 = Date.newInstance(2026, 3, 1);
        Date result = VerifyDate.CheckDates(d1, d2);
        System.assertEquals(Date.newInstance(2026, 3, 31), result);
    }

    @isTest
    static void testCheckDatesOver30Days() {
        Date d1 = Date.newInstance(2026, 3, 1);
        Date d2 = d1.addDays(35);
        Date result = VerifyDate.CheckDates(d1, d2);
        System.assertEquals(Date.newInstance(2026, 3, 31), result);
    }
}
