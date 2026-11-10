package com.rishikesht775.nutriguide;
import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONObject;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/** Private, account-scoped snapshots; guest data is never adopted into login. */
public final class NativeStore {
    private final Context context;
    private SharedPreferences account;
    private JSONObject state=new JSONObject(), dirty=new JSONObject();
    private String owner="guest", email="";
    private long revision=0;
    public NativeStore(Context c) { context=c.getApplicationContext();SharedPreferences identity=context.getSharedPreferences("native-identity",0);switchOwner(identity.getString("owner","guest"),identity.getString("email","")); }
    public synchronized void switchOwner(String next, String mail) {
        owner=next;email=mail;String digest;
        try { byte[] hash=MessageDigest.getInstance("SHA-256").digest(next.getBytes(StandardCharsets.UTF_8));StringBuilder b=new StringBuilder();for(byte v:hash)b.append(String.format("%02x",v));digest=b.toString(); } catch(Exception e) { throw new IllegalStateException(e); }
        account=context.getSharedPreferences("native-state-"+digest,0);
        state=parse(account.getString("state","{}"));dirty=parse(account.getString("dirty","{}"));revision++;
        context.getSharedPreferences("native-identity",0).edit().putString("owner",owner).putString("email",email).apply();
    }
    private JSONObject parse(String s) { try{return new JSONObject(s);}catch(Exception e){return new JSONObject();} }
    public synchronized JSONObject snapshot() { return parse(state.toString()); }
    public synchronized JSONObject patch() { return parse(dirty.toString()); }
    public synchronized String owner() { return owner; }
    public synchronized String email() { return email; }
    public synchronized boolean signedIn() { return !owner.equals("guest"); }
    public synchronized long revision() { return revision; }
    public synchronized void hydrate(JSONObject remote) throws Exception {
        state=StateMerge.merge(remote,dirty);revision++;persist();
    }
    public synchronized void put(String key,Object value) {
        try{state.put(key,value);dirty.put(key,value);revision++;persist();}catch(Exception e){throw new IllegalArgumentException(e);}
    }
    public synchronized void acknowledge(JSONObject merged,long expectedRevision) {
        if(revision!=expectedRevision)return;
        state=parse(merged.toString());dirty=new JSONObject();persist();
    }
    private void persist() { account.edit().putString("state",state.toString()).putString("dirty",dirty.toString()).apply(); }
}
