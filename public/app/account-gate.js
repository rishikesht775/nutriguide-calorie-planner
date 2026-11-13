/* Account controls are enabled only when the real email provider is configured. */
(() => {
 const $=id=>document.getElementById(id),gate=$('appAuthGate'),form=$('emailAccountForm'),status=$('gateStatus'),retry=$('gateRetry'),connected=$('gateSubmit'),emailField=$('emailAddress'),submit=$('emailSubmit');
 const local=['localhost','127.0.0.1','[::1]'].includes(location.hostname);
 connected.href=local?'https://nutriguide-calorie-planner.rishikesht775.chatgpt.site/account/connected':'/account/connected';
 let enabled=false,mode='sign-in',busy=false,checking=false,duplicateEmail=false;
 function clearDuplicateEmailState(){duplicateEmail=false;emailField?.removeAttribute('aria-invalid');if(!busy)submit.disabled=false;if(status.textContent.includes('already exists'))status.textContent='';status.classList.remove('status-error');}
 function clearAuthFields(){for(const id of ['emailName','emailAddress','emailPassword','emailConfirm']){const input=$(id);if(input){input.value='';input.removeAttribute?.('value')}}form.setAttribute?.('autocomplete','off');$('emailAddress').setAttribute?.('autocomplete','off');}
 function setMode(next){if(busy)return;clearDuplicateEmailState();const previous=mode;mode=next;if(next==='sign-in'&&previous==='sign-up')clearAuthFields();$('emailConfirmation').hidden=true;form.hidden=false;$('emailForgot').hidden=false;const signup=mode==='sign-up',reset=mode==='request-reset';$('emailNameWrap').hidden=!signup;$('emailName').disabled=!signup;$('emailName').required=signup;$('emailConfirmWrap').hidden=!signup;$('emailConfirm').disabled=!signup;$('emailConfirm').required=signup;$('emailPasswordWrap').hidden=reset;$('emailPassword').disabled=reset;$('emailPassword').required=!reset;$('emailPassword').minLength=signup?12:1;$('emailPassword').autocomplete=signup?'new-password':'current-password';$('emailSubmit').textContent=signup?'Create account':reset?'Send reset link':'Sign in';$('gateTitle').textContent=signup?'Create your NutriGuide account':reset?'Reset your password':'Welcome to NutriGuide';$('gateSubtitle').textContent=signup?'Save your nutrition, movement and recovery in your own account.':reset?'Enter your email to request a secure password reset link.':'Sign in to continue your personal wellness journey.';$('emailSignIn').classList.toggle('active',mode==='sign-in');$('emailSignUp').classList.toggle('active',signup);status.textContent='';}
 $('emailContinue').onclick=()=>setMode('sign-in');$('emailChange').onclick=()=>setMode('sign-up');
 $('emailSignIn').onclick=()=>setMode('sign-in');$('emailSignUp').onclick=()=>setMode('sign-up');$('emailForgot').onclick=()=>setMode('request-reset');
 emailField?.addEventListener('input',clearDuplicateEmailState);
 form.onsubmit=async event=>{
  event.preventDefault();if(busy||!enabled||!form.checkValidity())return;
  if(mode==='sign-up'&&duplicateEmail){status.classList.add('status-error');status.textContent='An account with this email already exists. Sign in or reset your password.';emailField?.focus({preventScroll:true});return}
  if(mode==='sign-up'&&$('emailPassword').value!==$('emailConfirm').value){status.classList.add('status-error');status.textContent='Passwords must match.';return}
  busy=true;$('emailSubmit').disabled=true;status.classList.remove('status-error');status.textContent='Please wait…';
  const body={email:$('emailAddress').value.trim()};if(mode!=='request-reset')body.password=$('emailPassword').value;if(mode==='sign-up'){body.name=$('emailName').value.trim();body.confirmPassword=$('emailConfirm').value}
  try{
   const response=await fetch('/api/account/'+mode,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});const data=await response.json();
   if(!response.ok){if(mode==='sign-up'&&response.status===409){duplicateEmail=true;emailField?.setAttribute('aria-invalid','true');status.classList.add('status-error');status.textContent=data.error||'An account with this email already exists. Sign in or reset your password.';emailField?.focus({preventScroll:true});return}throw Error(data.error||'This request could not be completed.');}
   $('emailPassword').value='';$('emailConfirm').value='';status.classList.remove('status-error');if(mode==='sign-up')clearAuthFields();
   if(data.signedIn){location.replace('/legacy.html');return}
   form.hidden=true;$('emailForgot').hidden=true;$('emailConfirmation').hidden=false;
   $('gateTitle').textContent='Check your email';$('gateSubtitle').textContent=mode==='sign-up'?'Confirm your email address to finish registration.':'Follow the email instructions to reset your password.';
   $('emailConfirmationText').textContent=data.message||'Please check your email for the next step.';status.textContent='';
   $('emailConfirmationTitle').focus({preventScroll:true});$('emailConfirmation').scrollIntoView({block:'center',behavior:'instant'});
  }catch(error){status.classList.add('status-error');status.textContent=error.name==='TimeoutError'?'The account service timed out. Please try again.':error.message}
  finally{busy=false;submit.disabled=mode==='sign-up'&&duplicateEmail}
 };
 async function check(){
  if(checking)return;checking=true;retry.hidden=true;status.classList.remove('status-error');status.textContent='Checking your account…';
  const configPromise=fetch('/api/account/config',{cache:'no-store',signal:AbortSignal.timeout(8000)}).then(async r=>r.ok?await r.json():null).catch(()=>null);
  try{
   const response=await fetch('/api/me',{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error('unavailable');const data=await response.json();
   if(data.authenticated&&data.user){const identity=String(data.user.id||data.user.email||'');const unlock=()=>{if(identity&&window.ngCloudIdentity===identity){document.body.classList.remove('auth-pending');gate.hidden=true}};status.textContent='Loading your account data…';unlock();if(!gate.hidden)window.addEventListener('ng:account-ready',unlock,{once:true});return}
   document.body.classList.add('auth-pending');gate.hidden=false;status.textContent='';
  }catch{document.body.classList.add('auth-pending');gate.hidden=false;status.classList.add('status-error');status.textContent='Could not check your account. Try again or use the connected-account option.';retry.hidden=false}
  finally{
   const config=await configPromise;enabled=config?.emailPasswordEnabled===true;$('emailAccountUI').hidden=!enabled;
   $('accountAvailability').hidden=enabled;$('accountAvailability').textContent=local?'Email accounts are not configured in this local preview. The live website has its own account settings.':'Email sign-in and registration are being configured. You can continue with a connected account.';
   $('connectedDivider').hidden=!enabled;checking=false;
   const notice=new URLSearchParams(location.search).get('account');if(notice==='link-error')status.textContent='The email link could not be completed. Open it in the browser used to register, or sign in after confirming your email.';if(notice==='password-updated')status.textContent='Your password was updated. Sign in with your new password.';if(notice==='confirmed')status.textContent='Your email was confirmed. Sign in to continue.';
  }
 }
 retry.onclick=check;setMode('sign-in');check();
})();
