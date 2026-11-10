package com.rishikesht775.nutriguide;
import org.json.JSONObject;
import java.util.Iterator;

/** Preserve remote fields this native client does not edit. */
public final class StateMerge {
    private StateMerge() {}
    public static JSONObject merge(JSONObject remote, JSONObject patch) throws Exception {
        JSONObject result=new JSONObject(remote.toString());
        for(Iterator<String> keys=patch.keys();keys.hasNext();) { String key=keys.next();result.put(key,patch.get(key)); }
        return result;
    }
}
