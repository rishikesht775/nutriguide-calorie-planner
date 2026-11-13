import { accountConfig, emailAuthClient, setAccountSource } from '../../account-auth';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const config=accountConfig();if(!config)return new Response('Email accounts are not configured.',{status:503,headers:{'Cache-Control':'no-store'}});
 const url=new URL(request.url),code=url.searchParams.get('code'),expectedEmail=url.searchParams.get('email')?.trim().toLowerCase(),recovery=url.searchParams.get('intent')==='recovery';
 if(!code||code.length>4096)return new Response(null,{status:303,headers:{Location:config.site+'/legacy.html?account=link-error','Cache-Control':'private, no-store','Referrer-Policy':'no-referrer'}});
 try{
  const client=await emailAuthClient();if(!client)throw Error('unavailable');const {data,error}=await client.auth.exchangeCodeForSession(code);
  const confirmedEmail=data.user?.email?.trim().toLowerCase();
  if(error||!data.user?.email_confirmed_at||(!recovery&&(!expectedEmail||confirmedEmail!==expectedEmail)))throw Error('invalid');await setAccountSource('email');
  return new Response(null,{status:303,headers:{Location:config.site+(recovery?'/account-reset.html':'/legacy.html?account=confirmed'),'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer'}});
 }catch{return new Response(null,{status:303,headers:{Location:config.site+'/legacy.html?account=link-error','Cache-Control':'private, no-store','Referrer-Policy':'no-referrer'}})}
}
