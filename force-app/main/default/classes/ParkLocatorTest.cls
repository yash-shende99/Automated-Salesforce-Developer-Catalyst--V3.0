@isTest
private class ParkLocatorTest {
    @isTest
    static void testParkLocator() {
        Test.setMock(WebServiceMock.class, new ParkServiceMock());
        String country = 'Germany';
        String[] result = ParkLocator.country(country);
        System.assertEquals(3, result.size());
    }
}
