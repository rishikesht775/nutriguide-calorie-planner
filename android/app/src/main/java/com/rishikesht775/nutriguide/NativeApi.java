package com.rishikesht775.nutriguide;
import android.content.Context;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.InputStream;
import java.net.HttpCookie;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.util.List;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/** HTTPS JSON API only. No WebView/browser renderer; no password persistence. */
public final class NativeApi {
    private static final String ORIGIN="https://nutriguide-calorie-planner.rishikesht775.chatgpt.site";
    private final Context context;
    private final java.net.CookieManager cookies=new java.net.CookieManager(null,java.net.CookiePolicy.ACCEPT_ORIGINAL_SERVER);
    public NativeApi(Context c){context=c.getApplicationContext();restore();}
    public synchronized JSONObject request(String path,JSONObject body) throws Exception {
        if(!path.startsWith("/api/"))throw new IllegalArgumentException("Unsupported API route");
        URI uri=URI.create(ORIGIN+path);
        HttpURLConnection connection=(HttpURLConnection)new URL(uri.toString()).openConnection();
        connection.setConnectTimeout(15000);connection.setReadTimeout(20000);connection.setInstanceFollowRedirects(false);
        connection.setRequestProperty("Accept","application/json");connection.setRequestProperty("Origin",ORIGIN);
        connection.setRequestProperty("Cache-Control","no-store");
        for(java.util.Map.Entry<String,List<String>> h:cookies.get(uri,java.util.Collections.emptyMap()).entrySet())connection.setRequestProperty(h.getKey(),String.join("; ",h.getValue()));
        try {
            if(body!=null){connection.setRequestMethod("POST");connection.setDoOutput(true);connection.setRequestProperty("Content-Type","application/json");byte[] bytes=body.toString().getBytes(StandardCharsets.UTF_8);connection.setFixedLengthStreamingMode(bytes.length);try(java.io.OutputStream out=connection.getOutputStream()){out.write(bytes);}}
            int code=connection.getResponseCode();cookies.put(uri,connection.getHeaderFields());persist();
            InputStream stream=code>=400?connection.getErrorStream():connection.getInputStream();
            if(stream==null)throw new Exception("Server returned "+code);
            java.io.ByteArrayOutputStream out=new java.io.ByteArrayOutputStream();
            try(InputStream in=stream){byte[] buffer=new byte[4096];int count,total=0;while((count=in.read(buffer))!=-1){total+=count;if(total>1100000)throw new Exception("Response too large");out.write(buffer,0,count);}}
            String text=out.toString("UTF-8");JSONObject result;
            try{result=new JSONObject(text);}catch(Exception e){throw new Exception("The account server returned an unexpected response.");}
            if(code<200||code>=300)throw new Exception(result.optString("error","Server returned "+code));
            return result;
        } finally {connection.disconnect();}
    }
    public synchronized void clear(){cookies.getCookieStore().removeAll();context.getSharedPreferences("native-session",0).edit().clear().apply();}
    private SecretKey key() throws Exception {
        KeyStore store=KeyStore.getInstance("AndroidKeyStore");store.load(null);
        if(store.containsAlias("nutriguide-session"))return (SecretKey)store.getKey("nutriguide-session",null);
        KeyGenerator generator=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore");
        generator.init(new KeyGenParameterSpec.Builder("nutriguide-session",KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT).setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build());return generator.generateKey();
    }
    private void persist() throws Exception {
        JSONArray saved=new JSONArray();
        for(HttpCookie c:cookies.getCookieStore().getCookies())if(!c.hasExpired())saved.put(new JSONObject().put("name",c.getName()).put("value",c.getValue()).put("path",c.getPath()==null?"/":c.getPath()).put("secure",c.getSecure()));
        Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.ENCRYPT_MODE,key());
        byte[] data=cipher.doFinal(saved.toString().getBytes(StandardCharsets.UTF_8));
        context.getSharedPreferences("native-session",0).edit().putString("iv",Base64.encodeToString(cipher.getIV(),Base64.NO_WRAP)).putString("data",Base64.encodeToString(data,Base64.NO_WRAP)).apply();
    }
    private void restore(){
        try {android.content.SharedPreferences p=context.getSharedPreferences("native-session",0);if(!p.contains("data"))return;
            Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.DECRYPT_MODE,key(),new GCMParameterSpec(128,Base64.decode(p.getString("iv",""),Base64.NO_WRAP)));
            JSONArray saved=new JSONArray(new String(cipher.doFinal(Base64.decode(p.getString("data",""),Base64.NO_WRAP)),StandardCharsets.UTF_8));
            for(int i=0;i<saved.length();i++){JSONObject x=saved.getJSONObject(i);HttpCookie c=new HttpCookie(x.getString("name"),x.getString("value"));c.setVersion(0);c.setPath(x.getString("path"));c.setSecure(x.optBoolean("secure",true));cookies.getCookieStore().add(URI.create(ORIGIN),c);}
        }catch(Exception e){clear();}
    }
}
