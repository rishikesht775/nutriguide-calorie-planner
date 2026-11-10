/* Account controls are enabled only when the real email provider is configured. */
(() => {
 const $=id=>document.getElementById(id),gate=$('appAuthGate'),form=$('emailAccountForm'),status=$('gateStatus'),retry=$('gateRetry'),connected=$('gateSubmit');
 const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
 connected.href=local?'https://nutriguide-calorie-planner.rishikesht775.chatgpt.site/account/connected':'/account/connected';
 let enabled=false,mode='sign-in',busy=false,checking=false;
 function setMode(next){mode=next;const signup=mode==='sign-up',reset=mode==='request-reset';$('emailNameWrap').hidden=!signup;$('emailName').disabled=!signup;$('emailName').required=signup;$('emailConfirmWrap').hidden=!signup;$('emailConfirm').disabled=!signup;$('emailConfirm').required=signup;$('emailPasswordWrap').hidden=reset;$('emailPassword').disabled=reset;$('emailPassword').required=!reset;$('emailPassword').minLength=signup?12:1;$('emailPassword').autocomplete=signup?'new-password':'current-password';$('emailSubmit').textContent=signup?'Create account':reset?'Send reset link':'Sign in';$('gateTitle').textContent=signup?'Create your NutriGuide account':reset?'Reset your password':'Welcome to NutriGuide';$('gateSubtitle').textContent=signup?'Save your nutrition, movement and recovery in your own account.':reset?'Enter your email to request a secure password reset link.':'Sign in to continue your personal wellness journey.';$('emailSignIn').classList.toggle('active',mode==='sign-in');$('emailSignUp').classList.toggle('active',signup);status.textContent='';}
 $('emailSignIn').onclick=()=>setMode('sign-in');$('emailSignUp').onclick=()=>setMode('sign-up');$('emailForgot').onclick=()=>setMode('request-reset');
 form.onsubmit=async event=>{
  event.preventDefault();if(busy||!enabled||!form.checkValidity())return;
  if(mode==='sign-up'&&$('emailPassword').value!==$('emailConfirm').value){status.textContent='Passwords must match.';return}
  busy=true;$('emailSubmit').disabled=true;status.textContent='Please wait…';
  const body={email:$('emailAddress').value.trim()};if(mode!=='request-reset')body.password=$('emailPassword').value;if(mode==='sign-up'){body.name=$('emailName').value.trim();body.confirmPassword=$('emailConfirm').value}
  try{
   const response=await fetch('/api/account/'+mode,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});const data=await response.json();
   if(!response.ok)throw Error(data.error||'This request could not be completed.');
   $('emailPassword').value='';$('emailConfirm').value='';
   if(data.signedIn){location.replace('/legacy.html');return}
   status.textContent=data.message||'Please check your email for the next step.';
  }catch(error){status.textContent=error.name==='TimeoutError'?'The account service timed out. Please try again.':error.message}
  finally{busy=false;$('emailSubmit').disabled=false}
 };
 async function check(){
  if(checking)return;checking=true;retry.hidden=true;status.textContent='Checking your account…';
  const configPromise=fetch('/api/account/config',{cache:'no-store',signal:AbortSignal.timeout(8000)}).then(async r=>r.ok?await r.json():null).catch(()=>null);
  try{
   const response=await fetch('/api/me',{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error('unavailable');const data=await response.json();
   if(data.authenticated&&data.user){document.body.classList.remove('auth-pending');gate.hidden=true;return}
   document.body.classList.add('auth-pending');gate.hidden=false;status.textContent='';
  }catch{document.body.classList.add('auth-pending');gate.hidden=false;status.textContent='Could not check your account. Try again or use the connected-account option.';retry.hidden=false}
  finally{
   const config=await configPromise;enabled=config?.emailPasswordEnabled===true;$('emailAccountUI').hidden=!enabled;
   $('accountAvailability').hidden=enabled;$('accountAvailability').textContent=local?'Email accounts are not configured in this local preview. The live website has its own account settings.':'Email sign-in and registration are being configured. You can continue with a connected account.';
   $('connectedDivider').hidden=!enabled;checking=false;
   const notice=new URLSearchParams(location.search).get('account');if(notice==='link-error')status.textContent='The email link could not be completed. Open it in the browser used to register, or sign in after confirming your email.';if(notice==='password-updated')status.textContent='Your password was updated. Sign in with your new password.';
  }
 }
 retry.onclick=check;setMode('sign-in');check();
})();
