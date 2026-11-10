package com.rishikesht775.nutriguide;
import org.junit.Test;
import org.json.JSONObject;
import static org.junit.Assert.*;
public class NativePolicyTest {
    @Test public void incompleteProfileHasNoTarget(){assertEquals(0,WellnessMath.calories(0,168,84,"male",1.375,"loss"));}
    @Test public void profileMatchesWebEstimate(){assertEquals(1950,WellnessMath.calories(30,168,84,"male",1.375,"loss"));assertEquals(118,WellnessMath.protein(84,"loss"));}
    @Test public void invalidActivityRejected(){assertFalse(WellnessMath.valid(30,168,84,"male",99,"loss"));}
    @Test public void nonFiniteProfileRejected(){assertFalse(WellnessMath.valid(Double.NaN,168,84,"male",1.375,"loss"));}
    @Test public void nativePatchPreservesOtherCloudModules() throws Exception {JSONObject merged=StateMerge.merge(new JSONObject("{\"journal\":[{\"text\":\"keep\"}],\"water\":2}"),new JSONObject("{\"water\":3}"));assertEquals(3,merged.getInt("water"));assertEquals("keep",merged.getJSONArray("journal").getJSONObject(0).getString("text"));}
    @Test public void emptyPatchNeverCopiesGuestData() throws Exception {assertEquals(0,StateMerge.merge(new JSONObject(),new JSONObject()).length());}
    @Test public void foodLookupUsesTheSelectedFood(){assertEquals(265,FoodCatalog.NUTRIENTS[FoodCatalog.find("Paneer")][0],0);assertEquals(89,FoodCatalog.NUTRIENTS[FoodCatalog.find("Banana")][0],0);}
}
