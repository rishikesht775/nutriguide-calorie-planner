import { setAccountSource } from '../../account-auth';
export const dynamic='force-dynamic';
export async function GET(){
 await setAccountSource('connected');
 return new Response(null,{status:303,headers:{Location:'/signin-with-chatgpt?return_to=%2Flegacy.html','Cache-Control':'private, no-store'}});
}
