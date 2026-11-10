package com.rishikesht775.nutriguide;
/** Approximate nutrition per 100 g, matching the website's basic food catalogue. */
public final class FoodCatalog {
    public static final String[] NAMES={"Paneer","Tofu","Cooked dal","Cooked chana","Cooked rajma","Oats","Plain curd","Whey protein powder","Whole-wheat roti","Brown rice cooked","Idli","Dosa","Poha","Upma","Soya chunks dry","Apple","Banana","Orange","Papaya","Guava","Almonds","Peanuts","Milk","Cooked quinoa","Sprouts","Carrot","Cucumber"};
    public static final double[][] NUTRIENTS={{265,18,6,20,0},{76,8,2,4.8,.3},{116,9,20,.4,7.9},{164,8.9,27,2.6,7.6},{127,8.7,22.8,.5,6.4},{389,16.9,66.3,6.9,10.6},{61,3.5,4.7,3.3,0},{380,75,10,6,0},{297,10,50,7,11},{123,2.7,25.6,1,1.6},{146,4,29,.7,1.5},{168,4,29,4,1},{130,2.5,23,3,1.8},{125,3,20,4,2},{345,52,33,.5,13},{52,.3,14,.2,2.4},{89,1.1,23,.3,2.6},{47,.9,12,.1,2.4},{43,.5,11,.3,1.7},{68,2.6,14,1,5.4},{579,21,22,50,12.5},{567,26,16,49,8.5},{61,3.2,4.8,3.3,0},{120,4.4,21.3,1.9,2.8},{30,3,6,.2,1.8},{41,.9,10,.2,2.8},{15,.7,3.6,.1,.5}};
    private FoodCatalog(){}
    public static int find(String name){String n=name.trim().toLowerCase(java.util.Locale.ROOT);for(int i=0;i<NAMES.length;i++)if(NAMES[i].toLowerCase(java.util.Locale.ROOT).equals(n))return i;return -1;}
}
