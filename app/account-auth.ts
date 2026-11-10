import { env } from 'cloudflare:workers';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const ACCOUNT_SOURCE_COOKIE = 'ng-account-source';
export type EmailAccount = { userId: string; email: string; displayName: string; fullName: string | null; authProvider: 'email' };
type AuthEnv = { SUPABASE_URL?: string; SUPABASE_PUBLISHABLE_KEY?: string; AUTH_SITE_URL?: string; NUTRIGUIDE_EMAIL_AUTH_ENABLED?: string };
export function accountConfig() {
 const config=env as AuthEnv;
 if(config.NUTRIGUIDE_EMAIL_AUTH_ENABLED!=='true'||!config.SUPABASE_URL||!config.SUPABASE_PUBLISHABLE_KEY||!config.AUTH_SITE_URL)return null;
 try {
  const url=new URL(config.SUPABASE_URL),site=new URL(config.AUTH_SITE_URL);
  if(url.protocol!=='https:'||!url.hostname.endsWith('.supabase.co')||url.username||url.password||url.pathname!=='/')return null;
  const local=['localhost','127.0.0.1','[::1]'].includes(site.hostname);
  if((site.protocol!=='https:'&&!(site.protocol==='http:'&&local))||site.username||site.password||site.pathname!=='/'||site.search||site.hash)return null;
  return {url:url.origin,key:config.SUPABASE_PUBLISHABLE_KEY,site:site.origin,secure:site.protocol==='https:'};
 } catch{return null}
}
export async function emailAuthClient() {
 const config=accountConfig();if(!config)return null;
 const store=await cookies();
 // Every request owns its own SDK client and cookie adapter. No shared sessions.
 return createServerClient(config.url,config.key,{
  cookieOptions:{httpOnly:true,secure:config.secure,sameSite:'lax',path:'/'},
  cookies:{getAll:()=>store.getAll(),setAll(values){for(const {name,value,options}of values)store.set(name,value,{...options,httpOnly:true,secure:config.secure,sameSite:'lax',path:'/'})}},
  global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store',signal:init?.signal||AbortSignal.timeout(10000)})},
 });
}
export async function accountSource(){const jar=await cookies(),source=jar.get(ACCOUNT_SOURCE_COOKIE)?.value;if(source==='email'||source==='connected')return source;return jar.getAll().some(c=>/^sb-.+-auth-token(?:\.\d+)?$/.test(c.name))?'email':'connected'}
export async function setAccountSource(source:'email'|'connected'){
 const secure=accountConfig()?.secure ?? process.env.NODE_ENV==='production';
 (await cookies()).set(ACCOUNT_SOURCE_COOKIE,source,{httpOnly:true,secure,sameSite:'lax',path:'/',maxAge:60*60*24*30});
}
export async function getEmailAccount():Promise<EmailAccount|null>{
 try{
  const client=await emailAuthClient(),config=accountConfig();if(!client||!config)return null;
  // getUser validates with the provider. Never trust the session cookie payload.
  const {data,error}=await client.auth.getUser();const user=data.user;
  if(error||!user?.id||!user.email||!user.email_confirmed_at)return null;
  return {userId:`email:${new URL(config.url).hostname}:${user.id}`,email:user.email,displayName:String(user.user_metadata?.full_name||user.email).slice(0,120),fullName:user.user_metadata?.full_name?String(user.user_metadata.full_name).slice(0,120):null,authProvider:'email'};
 }catch{return null}
}
export function privateJSON(value:unknown,status=200){return Response.json(value,{status,headers:{'Cache-Control':'private, no-store, max-age=0','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}})}
