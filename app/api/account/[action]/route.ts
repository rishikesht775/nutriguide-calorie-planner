import { accountConfig, accountSource, emailAuthClient, getEmailAccount, privateJSON, setAccountSource } from '../../../account-auth';
export const dynamic='force-dynamic';
const emailValid=(value:unknown):value is string=>typeof value==='string'&&value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const passwordValid=(value:unknown):value is string=>typeof value==='string'&&value.length>=12&&value.length<=128;

async function boundedBody(request:Request){
 if(Number(request.headers.get('content-length')||0)>8192)throw Error('large');
 if(!request.body)return {};
 const reader=request.body.getReader(),chunks:Uint8Array[]=[];let size=0;
 while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>8192){await reader.cancel();throw Error('large')}chunks.push(value)}
 const bytes=new Uint8Array(size);let offset=0;for(const part of chunks){bytes.set(part,offset);offset+=part.byteLength}
 const value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('body');return value as Record<string,unknown>;
}
export async function GET(request:Request){
 const action=new URL(request.url).pathname.split('/').at(-1);
 if(action==='config')return privateJSON({emailPasswordEnabled:!!accountConfig()});
 if(action==='session'){const user=await accountSource()==='email'?await getEmailAccount():null;return privateJSON({authenticated:!!user,user:user?{email:user.email,name:user.displayName}:null})}
 return privateJSON({error:'Not found'},404);
}
export async function POST(request:Request){
 const action=new URL(request.url).pathname.split('/').at(-1);
 const actions=['sign-in','sign-up','request-reset','update-password','logout'];
 if(!action||!actions.includes(action))return privateJSON({error:'Not found'},404);
 const config=accountConfig();if(!config)return privateJSON({error:'Email accounts are not configured yet. Please use the connected-account option.'},503);
 if(request.headers.get('origin')!==config.site)return privateJSON({error:'Request origin is not allowed.'},403);
 if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))return privateJSON({error:'Use a JSON request.'},415);
 let body:Record<string,unknown>;try{body=await boundedBody(request)}catch(error){return privateJSON({error:'Invalid account request.'},error instanceof Error&&error.message==='large'?413:400)}
 try{
  const client=await emailAuthClient();if(!client)return privateJSON({error:'Account service is unavailable.'},503);
  if(action==='logout'){
   const {error}=await client.auth.signOut({scope:'local'});if(error)return privateJSON({error:'Sign-out could not be completed. Try again.'},503);
   await setAccountSource('email');return privateJSON({signedOut:true});
  }
  if(action==='update-password'){
   const user=await accountSource()==='email'?await getEmailAccount():null;if(!user)return privateJSON({error:'Use the password reset link from your email before changing the password.'},401);
   if(!passwordValid(body.password)||body.password!==body.confirmPassword)return privateJSON({error:'Use 12–128 characters and matching passwords.'},400);
   const {error}=await client.auth.updateUser({password:body.password});
   if(error)return privateJSON({error:'Password could not be updated. Request a new reset link and try again.'},400);
   const signedOut=await client.auth.signOut({scope:'global'});if(signedOut.error)return privateJSON({error:'Password was updated, but sign-out could not be confirmed. Please sign out and sign in again.'},503);await setAccountSource('email');return privateJSON({updated:true});
  }
  if(!emailValid(body.email))return privateJSON({error:'Enter a valid email address.'},400);
  const email=body.email.trim().toLowerCase();
  if(action==='request-reset'){
   const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:config.site+'/account/callback?intent=recovery'});
   if(error&&error.status===429)return privateJSON({error:'Too many requests. Please wait before trying again.'},429);
   if(error)return privateJSON({error:'The reset email could not be sent. Please try again later.'},503);
   return privateJSON({message:'If an account exists for this email, a password reset link will be sent.'});
  }
  if(typeof body.password!=='string'||body.password.length<1||body.password.length>128)return privateJSON({error:'Enter your password.'},400);
  if(action==='sign-up'){
   if(!passwordValid(body.password)||body.password!==body.confirmPassword||typeof body.name!=='string'||!body.name.trim()||body.name.length>120)return privateJSON({error:'Enter your name and matching passwords of 12–128 characters.'},400);
   const {error}=await client.auth.signUp({email,password:body.password,options:{emailRedirectTo:config.site+'/account/callback?email='+encodeURIComponent(email),data:{full_name:body.name.trim()}}});
   if(error&&error.status===429)return privateJSON({error:'Too many requests. Please wait before trying again.'},429);
   if(error&&error.code!=='user_already_exists')return privateJSON({error:'Account creation could not be completed. Check your details and try again.'},400);
   // Same generic outcome for existing addresses; no account enumeration.
   return privateJSON({message:'Check your email to confirm your account. If you already have an account, sign in or reset your password.'},202);
  }
  const {data,error}=await client.auth.signInWithPassword({email,password:body.password});
  if(error&&error.status===429)return privateJSON({error:'Too many attempts. Please wait before trying again.'},429);
  if(error||!data.user?.email_confirmed_at)return privateJSON({error:'Sign-in failed. Check your credentials and confirm your email before trying again.'},401);
  await setAccountSource('email');return privateJSON({signedIn:true});
 }catch{return privateJSON({error:'Account service could not be reached. Please try again.'},503)}
}
