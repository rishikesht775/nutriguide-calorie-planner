package com.rishikesht775.nutriguide;

/** Same profile policy as the web app; no generic personal target. */
public final class WellnessMath {
    private WellnessMath() {}
    public static boolean valid(double age, double height, double weight, String sex, double activity, String goal) {
        return Double.isFinite(age) && age>=14 && age<=90 && Double.isFinite(height) && height>=80 && height<=250
            && Double.isFinite(weight) && weight>=20 && weight<=350 && (sex.equals("male") || sex.equals("female"))
            && (activity==1.2 || activity==1.375 || activity==1.55 || activity==1.725)
            && (goal.equals("loss") || goal.equals("maintain") || goal.equals("gain"));
    }
    public static int calories(double age, double height, double weight, String sex, double activity, String goal) {
        if (!valid(age,height,weight,sex,activity,goal)) return 0;
        double tdee=(10*weight+6.25*height-5*age+(sex.equals("male")?5:-161))*activity;
        return Math.max(sex.equals("male")?1500:1200,(int)Math.round((tdee+(goal.equals("loss")?-450:goal.equals("gain")?300:0))/10)*10);
    }
    public static int protein(double weight, String goal) { return (int)Math.round(weight*(goal.equals("gain")?1.6:1.4)); }
}
