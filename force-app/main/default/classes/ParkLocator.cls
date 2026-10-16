public class ParkLocator {
    public static String[] country(String countryName) {
        ParkService.ParksImplPort parks = new ParkService.ParksImplPort();
        return parks.byCountry(countryName);
    }
}
