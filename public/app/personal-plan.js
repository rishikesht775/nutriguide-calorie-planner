/* Profile-driven defaults + one contextual guide across the five existing tabs. */
(() => {
 const {read,write,escape:e,day}=NG,core=NGPersonalCore,$=id=>document.getElementById(id);
 let applying=false,rendering=false,lastTrainingKey='',refreshTimer;
 const settings=()=>{const s=read('ngPersonalSettings',{});if(!s.food||!['auto','custom'].includes(s.food.mode))delete s.food;if(!s.training||!['auto','custom'].includes(s.training.mode))delete s.training;return s};
 function saveSettings(value){localStorage.setItem('ngPersonalSettings',JSON.stringify(value));window.dispatchEvent(new Event('ng:data-changed'))}
 function profileFromForm(){const p={};for(const key of ['age','sex','height','weight','activity','goal'])p[key]=$(key)?.value;return core.validProfile(p)?p:null}
 function activeTab(){return document.querySelector('.app-nav button.active')?.dataset.tab||'home'}
 function currentProfile(){return document.body.classList.contains('post-profile')?profileFromForm():null}
 function guideContext(){const s=settings(),sleep=read('ngMeasurements',[]).find(x=>x.date===day())?.sleep,check=s.checkIn?.date===day()?s.checkIn.value:(typeof sleep==='number'&&sleep<6?'tired':'ready');return {readiness:check,lastEffort:s.lastEffort?.date===day()||s.lastEffort?.date===day(-1)?s.lastEffort.value:''}}
 function planNow(){const p=currentProfile();return p?core.derive(p,settings(),guideContext()):null}
 function persistSettingsSilent(s){localStorage.setItem('ngPersonalSettings',JSON.stringify(s))}
 const guide=document.createElement('section');guide.id='ngJourneyGuide';guide.className='ng-section ng-personal-guide';guide.hidden=true;
 guide.innerHTML=`<div class="ng-guide-heading"><span id="ngPersonalAvatar" class="ng-guide-avatar" aria-hidden="true">🐼🥋</span><div><div class="ng-kicker">YOUR JOURNEY COMPANION · <span id="ngPersonalGuideName"></span></div><h2 id="ngGuideHeadline">Your next small step</h2><p id="ngGuideMessage"></p></div><button type="button" id="ngGuideChange">Change guide</button></div><div id="ngSharedTargets" class="ng-target-ribbon"></div><div class="ng-guide-steps" id="ngGuideSteps"></div><div class="ng-guide-next"><div><strong id="ngGuideNextTitle"></strong><p id="ngGuideWhy"></p></div><button type="button" class="primary" id="ngGuideNext">Continue</button></div><details class="ng-guide-options"><summary>Personalize your plan</summary><p>Profile estimates fill every tab. Your custom targets apply everywhere; your meal and workout choices are kept separately.</p><div class="ng-form"><label>Daily calorie target (kcal)<input id="ngPersonalCalories" type="number" min="1200" max="5000" step="10"></label><label>Daily protein target (g)<input id="ngPersonalProtein" type="number" min="20" max="300"></label></div><div class="ng-actions"><button type="button" data-personal-action="save-targets">Save shared targets</button><button type="button" data-personal-action="reset-targets">Use profile targets</button><button type="button" data-personal-action="profile">Edit profile details</button></div><div id="ngTargetSource" class="ng-status" role="status"></div></details>`;
 document.querySelector('.wrap').insertBefore(guide,document.querySelector('#ngToday'));
 const training=document.createElement('div');training.id='ngTrainingPersonal';training.className='ng-training-personal';training.innerHTML=`<div class="ng-heading"><div><div class="ng-kicker">START FROM WHERE YOU ARE</div><h3>Your recommended session</h3></div><span id="ngTrainingSource" class="ng-chip"></span></div><p id="ngTrainingReason"></p><div class="ng-readiness"><span>How do you feel today?</span><button type="button" data-readiness="ready">Ready</button><button type="button" data-readiness="tired">Low energy</button><button type="button" data-readiness="sore">Sore / take it easy</button></div><div class="ng-actions"><button type="button" data-personal-action="reset-training">Use profile workout</button></div><div id="ngLiveCompanion" class="ng-live-companion" hidden><div class="ng-kicker" id="ngLivePhase"></div><h3 id="ngLiveTitle"></h3><p id="ngLiveCue"></p><div class="ng-actions"><button type="button" data-personal-action="speak-cue">Read this cue aloud</button><button type="button" data-personal-action="stop-speaking">Stop voice</button></div></div><div id="ngEffortPanel" class="ng-effort-panel" hidden><strong>How did the session feel?</strong><div class="ng-actions"><button type="button" data-effort="easy">Easy</button><button type="button" data-effort="right">About right</button><button type="button" data-effort="hard">Too hard</button></div><p id="ngEffortStatus"></p></div>`;
 $('ngTrainerHub').insertBefore(training,$('ngTrainerHub').querySelector('.ng-trainer-controls'));
 const mealSource=document.createElement('div');mealSource.id='ngMealPlanSource';mealSource.className='ng-status';mealSource.setAttribute('role','status');$('ngMealPlanner').insertBefore(mealSource,$('ngMealPlanner').querySelector('.ng-form'));
 const mealReset=document.createElement('button');mealReset.type='button';mealReset.dataset.personalAction='reset-food';mealReset.textContent='Use profile meal plan';$('ngMealPlanner').querySelector('.ng-actions').append(mealReset);
 const journey=document.createElement('div');journey.id='ngPersonalJourney';journey.className='ng-box';journey.innerHTML=`<div class="ng-kicker">YOUR PATH, ALREADY STARTED</div><h3 id="ngJourneyPath"></h3><p id="ngJourneyStage"></p><div id="ngJourneyWins" class="ng-list"></div><p class="ng-note">Suggested actions are not completed logs. Your activity and check-ins fill this journey as you go.</p>`;$('ngRecovery').prepend(journey);
 const review=document.createElement('div');review.id='ngPersonalReview';review.className='ng-box';review.innerHTML=`<div class="ng-kicker">REVIEW YOUR REAL PROGRESS</div><h3>Your plan and this week</h3><p id="ngReviewPlan"></p><div id="ngReviewProgress" class="ng-list"></div><div class="ng-actions"><button type="button" data-personal-action="review">I reviewed my plan today</button><button type="button" data-personal-action="profile">Update my profile</button></div>`;review.insertAdjacentHTML('beforeend','<h3 style="margin-top:20px">A suggested movement week</h3><p class="ng-note">Suggestions stay separate from your activity history. Prepare a reminder, edit its time, then choose Add reminder.</p><div id="ngGuideSchedule" class="ng-list"></div>');$('ngDataTools').prepend(review);
 let nextAction={tab:'food',target:'nutritionFood'};
 function snapshot(){return core.progress({today:day(),food:nutritionLog,history:read('ngTrainerHistory',[]),measurements:read('ngMeasurements',[]),settings:settings()})}
 function applyDefaults({forceFood=false,forceTraining=false}={}){
  if(applying)return;const profile=currentProfile();if(!profile){window.ngPersonalPlan=null;proteinTarget=0;guide.hidden=true;$('cal').textContent='—';$('protein').textContent='—';$('bmi').textContent='—';if(window.ngRefreshWellness)window.ngRefreshWellness();renderProtein();return}applying=true;
  try{
   let s=settings();if(!s.startedOn)s.startedOn=day();
   // A cached legacy widget value is not evidence of a deliberate custom target.
   // Only explicit shared settings override the current Home profile estimate.
   if(!s.version)s.version=1;
   // Preserve pre-existing edited plans during migration. Never overwrite diary entries.
   if(!s.food)s.food={mode:read('ngWeeklyPlans',[]).length?'custom':'auto'};
   if(!s.training)s.training={mode:'auto'};
   if(forceFood)s.food={mode:'auto'};if(forceTraining)s.training={mode:'auto'};
   persistSettingsSilent(s);
   const plan=core.derive(profile,s,guideContext());if(!plan)return;window.ngPersonalPlan=plan;
   $('cal').textContent=plan.calories+' kcal';$('protein').textContent=plan.protein+' g';$('bmi').textContent=plan.bmi.toFixed(1);
   proteinTarget=plan.protein;localStorage.setItem('proteinTarget',String(proteinTarget));
   const ctx=read('ngPlanContext',{}),saved=read('ngWeeklyPlans',[]),prefs=read('ngPreferences',{}),options=read('ngPlanSettings',{});
   const foodFingerprint=JSON.stringify([plan.fingerprint,prefs.diet||'vegetarian',options.budget||200,options.focus||'balanced',options.people||1]);
   const expired=!!saved.length&&saved.at(-1)?.date<day();
   if(s.food.mode==='auto'&&(forceFood||!saved.length||expired||ctx.foodFingerprint!==foodFingerprint)){
    const week=NGMeals.buildPlan({target:plan.calories,budget:options.budget||200,diet:prefs.diet||'vegetarian',highProtein:options.focus==='protein'||profile.goal==='gain',proteinTarget:plan.protein});
    localStorage.setItem('ngWeeklyPlans',JSON.stringify(week));localStorage.setItem('ngAutoGroceries',JSON.stringify(NGMeals.grocery(week,options.people||1)));
    ctx.foodFingerprint=foodFingerprint;ctx.foodProfile=plan.fingerprint;ctx.foodCreated=day();
   }
   const running=window.ngTrainerState?.running||(!window.ngTrainerState?.completed&&window.ngTrainerState?.startedAt);
   const trainingKey=JSON.stringify(plan.training);
   if(!running&&(forceTraining||lastTrainingKey!==trainingKey)){
    $('ngTrainerGoal').value=plan.training.goal;$('ngTrainerSetting').value=plan.training.setting;$('ngTrainerDuration').value=plan.training.duration;lastTrainingKey=trainingKey;
   }
   localStorage.setItem('ngPlanContext',JSON.stringify(ctx));
   if(window.ngRefreshWellness)window.ngRefreshWellness();
   const recovery=read('ngMeasurements',[]).find(x=>x.date===day());if(recovery)for(const [key,id]of [['sleep','ngSleep'],['mood','ngMood'],['stress','ngStress'],['waist','ngWaist'],['chest','ngChest'],['arm','ngArm']])if(document.activeElement!==$(id)&&recovery[key]!==undefined)$(id).value=recovery[key];
   renderProtein();
   const mealDay=read('ngWeeklyPlans',[]).find(x=>x.date===day())||read('ngWeeklyPlans',[])[0];
   if(mealDay?.items){$('meals').innerHTML=mealDay.items.map(r=>`<div class="meal"><div><b>${e(r.meal)}</b><span>${e(r.name)} × ${r.servings} serving</span></div><strong>${Math.round(r.cal*r.servings)} kcal</strong></div>`).join('');document.querySelector('#results .plan h2').textContent=s.food.mode==='custom'?'Your saved day plan':'Your profile-based day plan';}
   renderGuide();
  }finally{applying=false}
 }
 function setHTML(id,value){if($(id).innerHTML!==value)$(id).innerHTML=value}
 function renderGuide(){
  if(rendering)return;const plan=window.ngPersonalPlan;if(!plan||!currentProfile()){guide.hidden=true;return}rendering=true;
  try{
   guide.hidden=false;const s=settings(),progress=snapshot(),tab=activeTab(),totalProtein=progress.protein+proteinItems.reduce((a,x)=>a+Number(x.g||0),0),calLeft=Math.max(0,Math.round(plan.calories-progress.calories)),proteinLeft=Math.max(0,Math.round(plan.protein-totalProtein));
   const selected=guides[Math.max(0,Math.min(5,Number(localStorage.selectedGuide??5)||0))]||guides[5];$('ngPersonalAvatar').textContent=selected[0];$('ngPersonalGuideName').textContent=selected[1];
   $('ngSharedTargets').innerHTML=`<span>${e(plan.goalLabel)}</span><span>${plan.calories} kcal / day</span><span>${plan.protein} g protein / day</span><span>BMI ${plan.bmi.toFixed(1)}</span>`;
   const titles={home:'Let’s make today manageable.',food:'Your food plan starts with your targets.',move:'Train with a plan you can follow.',journey:'Recovery is part of your journey.',plan:'Look back, then choose your next step.'};
   const messages={home:`${selected[1]}: ${calLeft} kcal and about ${proteinLeft} g protein remain in your logged day. Pick one useful step below.`,food:`Your shared target is ${plan.calories} kcal and ${plan.protein} g protein. Suggested meals stay separate from what you actually eat.`,move:plan.trainingReason,journey:`Your ${plan.journey.toLowerCase()} includes sleep, mood, measurements and small wins. Record what happened; leave unknown values blank.`,plan:`Your current BMI estimate is ${plan.bmi.toFixed(1)}. Review your actual logs and preferences before changing your targets.`};
   $('ngGuideHeadline').textContent=titles[tab];$('ngGuideMessage').textContent=messages[tab];$('coachText').textContent=messages[tab];
   const steps=[['food','Food logged',progress.food],['move','Movement recorded',progress.movement],['journey','Recovery checked',progress.recovery],['plan','Plan reviewed',progress.review]];
   setHTML('ngGuideSteps',steps.map(([key,label,done])=>`<button type="button" data-guide-tab="${key}" class="${done?'done':''}" aria-label="${label}: ${done?'completed':'open'}"><span aria-hidden="true">${done?'✓':'○'}</span>${label}</button>`).join(''));
   let next;
   if(tab==='food')next=progress.food?{tab:'food',target:'ngRemainingSuggestions',title:'Review a meal that fits today',why:`About ${proteinLeft} g protein remains. You can adjust meals and servings without changing your saved logs.`,button:'See meal options'}:{tab:'food',target:'nutritionFood',title:'Log what you ate',why:'The meal plan is a suggestion. Your daily totals change only when you log a serving.',button:'Open food log'};
   else if(tab==='move')next=progress.movement?{tab:'journey',target:'ngRecovery',title:'Check in after movement',why:'Record your energy, sleep or measurements. Rest and recovery count too.',button:'Open recovery'}:{tab:'move',target:'ngTrainerHub',title:'Follow your recommended session',why:plan.trainingReason,button:window.ngTrainerState?.startedAt&&!window.ngTrainerState.completed?'Return to session':'Open workout'};
   else if(tab==='journey')next={tab:'journey',target:progress.recovery?'journalText':'ngRecovery',title:progress.recovery?'Record a non-scale win':'Save today’s recovery check-in',why:progress.recovery?'What felt easier, stronger or more consistent today?':'Use your actual sleep and mood. You can change or update today’s entry.',button:progress.recovery?'Write a reflection':'Open check-in'};
   else if(tab==='plan')next={tab:'plan',target:'ngPersonalReview',title:'Review your week',why:'Food, movement and recovery are shown from saved logs. Review targets when your profile or goal changes.',button:'Open review'};
   else next=!progress.food?{tab:'food',target:'nutritionFood',title:'Start with a food log',why:'Your calorie and protein targets are ready. Log a serving to see your remaining amounts.',button:'Log a meal'}:!progress.movement?{tab:'move',target:'ngTrainerHub',title:'Make time for comfortable movement',why:plan.trainingReason,button:'Open workout'}:!progress.recovery?{tab:'journey',target:'ngRecovery',title:'Check your recovery',why:'A short sleep and mood check-in helps you choose a manageable next session.',button:'Open recovery'}:{tab:'plan',target:'ngPersonalReview',title:'Review and acknowledge your day',why:'Your logs are saved. See what worked and choose tomorrow’s next small step.',button:'Review my day'};
   nextAction=next;$('ngGuideNextTitle').textContent=next.title;$('ngGuideWhy').textContent=next.why;$('ngGuideNext').textContent=next.button;
   $('ngTargetSource').textContent=`Calories: ${plan.calorieSource==='profile'?'profile estimate':'your custom target'} · Protein: ${plan.proteinSource==='profile'?'profile estimate':'your custom target'}. Resetting targets keeps food, movement and recovery logs.`;
   if(document.activeElement!==$('ngPersonalCalories'))$('ngPersonalCalories').value=plan.calories;if(document.activeElement!==$('ngPersonalProtein'))$('ngPersonalProtein').value=plan.protein;
   $('ngTrainingSource').textContent=plan.trainingSource==='profile'?'Profile default':'Your saved workout';$('ngTrainingReason').textContent=plan.trainingReason;
   document.querySelectorAll('[data-readiness]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.readiness===guideContext().readiness)));
   $('ngMealPlanSource').textContent=s.food?.mode==='custom'?`Your saved meal plan is kept. Current shared targets: ${plan.calories} kcal / ${plan.protein} g protein. Use profile meal plan to regenerate portions.`:`Filled from your profile: ${plan.calories} kcal / ${plan.protein} g protein target. Edit preferences or change meals whenever you want. Planned protein totals are estimates and may differ from the target.`;
   if(plan.calories>3500)$('ngMealPlanSource').textContent+=' Current recipe scaling supports up to 3500 kcal per day; review the displayed plan totals against your higher target.';
   const stage=core.stage(s.startedOn||day(),day());$('ngJourneyPath').textContent=plan.journey;$('ngJourneyStage').textContent=`Week ${stage.week}: ${stage.title}. Today’s steps follow your real logs, not a preset completion score.`;
   $('ngJourneyWins').innerHTML=steps.map(([,label,done])=>`<div class="ng-row"><b>${e(label)}</b><small>${done?'Recorded today':'Ready when you are'}</small></div>`).join('');
   const history=read('ngTrainerHistory',[]).filter(x=>x&&Number(x.actualSeconds)>=60&&core.localDay(x.date)>=day(-6)&&core.localDay(x.date)<=day());const dates=new Set(nutritionLog.filter(x=>x.date>=day(-6)&&x.date<=day()).map(x=>x.date));
   $('ngReviewPlan').textContent=`${plan.goalLabel} · ${plan.calories} kcal · ${plan.protein} g protein · BMI ${plan.bmi.toFixed(1)}. Targets ${plan.calorieSource==='custom'||plan.proteinSource==='custom'?'include your edits':'come from your profile estimates'}.`;
   updateWeeklyStrip();$('ngReviewProgress').innerHTML=`<div class="ng-row"><b>Days with food logs, last 7 days</b><span>${dates.size}</span></div><div class="ng-row"><b>Sessions with at least 1 active minute, last 7 days</b><span>${history.length}</span></div><div class="ng-row"><b>Today’s plan review</b><span>${progress.review?'Completed':'Not reviewed yet'}</span></div>`;
   const standard=core.derive(currentProfile(),s,{});
   $('ngGuideSchedule').innerHTML=Array.from({length:7},(_,i)=>{const date=day(i),weekday=new Date(date+'T12:00:00').getDay(),recovery=weekday===0,isSession=[1,3,5].includes(weekday),label=recovery?'Rest and recovery':isSession?({balanced:'Full-body basics',strength:'Strength basics',cardio:'Comfortable cardio',mobility:'Mobility and recovery'}[i===0?plan.training.goal:standard.training.goal]):weekday===6?'Gentle mobility':'Comfortable walk',minutes=recovery?0:isSession?(i===0?plan.training.duration:standard.training.duration):weekday===6?10:15;return `<div class="ng-row"><div><b>${e(new Date(date+'T12:00:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'}))} · ${e(label)}</b><small>${minutes?minutes+' minute suggestion':'Choose the recovery you need'} · not an activity log</small></div>${minutes?`<button type="button" data-guide-schedule="${i}">Prepare reminder</button>`:''}</div>`}).join('');
   renderLiveCompanion();
  }finally{rendering=false}
 }
 window.ngPersonalReply=question=>{
  const plan=window.ngPersonalPlan;if(!question.trim()||!plan)return;const p=snapshot(),q=question.toLowerCase(),s=settings();let answer;
  if(/diabet|medic|pregnan|pain|dizz|blood|disease|insulin|injur/.test(q))answer='This guide cannot diagnose symptoms, change medication or prescribe a medical diet. Stop training if you feel pain or unwell, and speak with a qualified clinician about your situation.';
  else if(/bmi|target|profile|calorie/.test(q))answer=`Your shared targets are ${plan.calories} kcal and ${plan.protein} g protein; BMI estimate ${plan.bmi.toFixed(1)}. ${plan.calorieSource==='custom'||plan.proteinSource==='custom'?'Your edits are included.':'These come from your saved profile.'} Food, Exercise, Journey and Reports use this same plan. Open Personalize your plan to change targets or reset to profile estimates.`;
  else if(/protein|food|meal|eat/.test(q))answer=`You have logged ${Math.round(p.protein+proteinItems.reduce((a,x)=>a+Number(x.g||0),0))} g protein against ${plan.protein} g, with ${Math.max(0,Math.round(plan.calories-p.calories))} kcal left in the food log. Your ${s.food?.mode==='custom'?'saved':'profile-based'} meal plan is in Food. You can change a meal, check the suggested serving, or log what you actually ate.`;
  else if(/workout|train|gym|walk|move/.test(q))answer=`Your ${plan.trainingSource==='custom'?'chosen':'recommended'} session is ${plan.training.duration} minutes of ${plan.training.goal} at ${plan.training.setting}. ${plan.trainingReason} The Exercise guide explains movement/rest intervals and saves your actual active time. Today: ${p.workouts} sessions of at least one active minute logged.`;
  else if(/sleep|stress|recover|mood|tired/.test(q))answer=`${p.recovery?'You have saved a recovery check-in today.':'No recovery check-in is saved today yet.'} Open Journey to record actual sleep, mood and measurements. Choose Low energy or Sore in Exercise when you want a gentler recommendation; your manually chosen workout is preserved.`;
  else answer=`Your next useful step is: ${nextAction.title}. ${nextAction.why} I use saved profile and log data with rules, so I cannot check your form through the camera or act as a live human trainer.`;
  const history=read('ngCoachHistory',[]);history.push({role:'user',text:question.slice(0,300)},{role:'guide',text:answer});write('ngCoachHistory',history.slice(-20));$('ngCoachQuestion').value='';$('ngCoachMessages').innerHTML=history.slice(-8).map(m=>`<div class="ng-message ${m.role==='user'?'user':''}">${e(m.text)}</div>`).join('');
 };
 function renderLiveCompanion(){
  const st=window.ngTrainerState,live=$('ngLiveCompanion');if(!st?.startedAt){live.hidden=true}else{
   live.hidden=false;const x=st.plan?.[st.exerciseIndex],spent=x?Math.max(0,x[3]-st.seconds):0,rest=spent%60>=40,phase=st.completed?'Session saved':!st.running?'Paused':rest?'Recovery interval':'Movement interval';
   $('ngLivePhase').textContent=phase;$('ngLiveTitle').textContent=x?.[1]||'Your guided session';
   const isCardio=/walk|cycl|jack|step/i.test(x?.[1]||'');const cue=st.completed?'You saved '+Math.floor((st.elapsed||0)/60)+' active minutes. Give honest feedback below to shape your next recommendation.':!st.running?'Take your time. Resume when you are ready, or finish to save the active time you completed.':rest?'Take a short rest. Relax your shoulders and breathe comfortably. Continue only if you feel ready.':isCardio?'Use a comfortable pace where you can still talk. Slow down or pause whenever needed.':'Try 6–10 controlled repetitions, then rest. Keep the movement comfortable. Form matters more than speed.';
   $('ngLiveCue').textContent=cue+' '+(st.completed?'':x?.[2]||'');
  }
  const last=read('ngTrainerHistory',[]).at(-1);$('ngEffortPanel').hidden=!last||core.localDay(last.date)!==day();$('ngEffortStatus').textContent=last&&settings().lastEffort&&settings().lastEffort.sessionDate===last.date?'Feedback saved: '+settings().lastEffort.value+'. Your next profile recommendation will take this into account.':'Your feedback updates recommendations; your custom workout remains yours.';
 }
 function go(tab,target){setTab(tab);const el=$(target);el?.scrollIntoView({behavior:'smooth',block:'center'});if(el?.matches('input,textarea,select'))el.focus({preventScroll:true});}
 $('ngGuideNext').onclick=()=>go(nextAction.tab,nextAction.target);$('ngGuideChange').onclick=()=>window.changeGuide();
 document.addEventListener('click',ev=>{
  const el=ev.target.closest('[data-personal-action],[data-readiness],[data-effort],[data-guide-tab],[data-guide-schedule]');if(!el)return;
  if(el.dataset.guideSchedule!==undefined){go('plan','reminderDate');$('reminderDate').value=day(Number(el.dataset.guideSchedule));$('reminderTime').value='18:00';$('reminderType').value='Workout';$('reminderText').value=el.closest('.ng-row').querySelector('b').textContent.split(' · ').slice(1).join(' · ');return}
  if(el.dataset.guideTab){go(el.dataset.guideTab,{food:'nutritionFood',move:'ngTrainerHub',journey:'ngRecovery',plan:'ngPersonalReview'}[el.dataset.guideTab]);return}
  const s=settings();
  if(el.dataset.readiness){s.checkIn={date:day(),value:el.dataset.readiness};persistSettingsSilent(s);applyDefaults();window.dispatchEvent(new Event('ng:data-changed'));return}
  if(el.dataset.effort){s.lastEffort={date:day(),value:el.dataset.effort,sessionDate:read('ngTrainerHistory',[]).at(-1)?.date};persistSettingsSilent(s);applyDefaults();window.dispatchEvent(new Event('ng:data-changed'));return}
  switch(el.dataset.personalAction){
   case 'profile':go('home','form');$('age').focus({preventScroll:true});break;
   case 'save-targets':{
    const calories=Number($('ngPersonalCalories').value),protein=Number($('ngPersonalProtein').value);
    if(!Number.isFinite(calories)||calories<1200||calories>5000||!Number.isFinite(protein)||protein<20||protein>300){$('ngTargetSource').textContent='Enter 1200–5000 kcal and 20–300 g protein. These are editable planning values, not a medical prescription.';break}
    s.targets={calories,protein};persistSettingsSilent(s);applyDefaults();window.dispatchEvent(new Event('ng:data-changed'));break;}
   case 'reset-targets':s.targets={};persistSettingsSilent(s);applyDefaults();window.dispatchEvent(new Event('ng:data-changed'));break;
   case 'reset-food':applyDefaults({forceFood:true});window.dispatchEvent(new Event('ng:data-changed'));break;
   case 'reset-training':if(window.ngTrainerState?.startedAt&&!window.ngTrainerState.completed){$('ngTrainingReason').textContent='Finish your active session before changing its defaults.';break}applyDefaults({forceTraining:true});window.dispatchEvent(new Event('ng:data-changed'));break;
   case 'review':s.reviewDate=day();saveSettings(s);break;
   case 'speak-cue':if('speechSynthesis'in window){speechSynthesis.cancel();const phrase=new SpeechSynthesisUtterance($('ngLiveTitle').textContent+'. '+$('ngLiveCue').textContent);phrase.rate=.9;speechSynthesis.speak(phrase)}else $('ngLiveCue').textContent+=' Voice playback is unavailable in this browser.';break;
   case 'stop-speaking':window.speechSynthesis?.cancel();break;
  }
 });
 // Capture deliberate changes before the existing handlers save their data.
 document.addEventListener('click',ev=>{
  if(ev.target.closest('[data-ng-action="generate"],[data-plan-swap]')){const s=settings();s.food={mode:'custom'};persistSettingsSilent(s)}
 },true);
 ['ngTrainerGoal','ngTrainerSetting','ngTrainerDuration'].forEach(id=>$(id).addEventListener('change',()=>{
  const s=settings();s.training={mode:'custom',goal:$('ngTrainerGoal').value,setting:$('ngTrainerSetting').value,duration:$('ngTrainerDuration').value};persistSettingsSilent(s);applyDefaults();window.dispatchEvent(new Event('ng:data-changed'));
 }));
 // A shared protein target replaces the independent legacy 100 g default.
 window.saveProteinTarget=()=>{if(!planNow()){$('proteinTarget').value='';return}const value=Number($('proteinTarget').value);if(!Number.isFinite(value)||value<20||value>300){$('proteinTarget').value=window.ngPersonalPlan?.protein||'';return}const s=settings();s.targets={...s.targets,protein:value};persistSettingsSilent(s);applyDefaults();window.dispatchEvent(new Event('ng:data-changed'))};
 const saveProteinBase=window.saveProtein;window.saveProtein=()=>{saveProteinBase();window.dispatchEvent(new Event('ng:data-changed'))};
 const renderProteinBase=window.renderProtein;window.renderProtein=()=>{renderProteinBase();const food=nutritionLog.filter(x=>!x.date||x.date===day()).reduce((a,x)=>a+Number(x.p||0),0),only=proteinItems.reduce((a,x)=>a+Number(x.g||0),0),sum=food+only;$('proteinTotal').textContent=sum.toFixed(1)+' g';const target=planNow()?.protein||0;$('proteinTarget').value=target||'';$('proteinTarget').disabled=!target;$('proteinTarget').placeholder='Complete your profile';$('proteinBar').style.width=(target?Math.min(100,sum/target*100):0)+'%'};
 const weeklyBase=window.updateWeeklyStrip;window.updateWeeklyStrip=()=>{
  weeklyBase();const start=new Date();start.setDate(start.getDate()-(start.getDay()+6)%7);const dates=Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(d.getDate()+i);return core.localDay(d)});
  const foods=nutritionLog.filter(x=>dates.includes(x.date)),workouts=read('ngTrainerHistory',[]).filter(x=>Number(x.actualSeconds)>=60&&dates.includes(core.localDay(x.date))),recoveries=read('ngMeasurements',[]).filter(x=>dates.includes(x.date));
  $('stripFood').textContent=foods.length;$('stripExercise').textContent=workouts.length;$('weekDots').innerHTML=dates.map((d,i)=>`<i class="${foods.some(x=>x.date===d)||workouts.some(x=>core.localDay(x.date)===d)||recoveries.some(x=>x.date===d)?'done':''}" title="${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]} ${d}: ${foods.some(x=>x.date===d)||workouts.some(x=>core.localDay(x.date)===d)||recoveries.some(x=>x.date===d)?'activity logged':'no activity logged'}"></i>`).join('');
 };
 const profileForm=$('form');profileForm.addEventListener('submit',()=>{
  if(!profileForm.checkValidity())return;const p=profileFromForm();if(p){localStorage.setItem('profile',JSON.stringify(p));const s=settings();s.targets={...s.targets};if(!window.ngRestoringProfile)delete s.targets.protein;persistSettingsSilent(s);applyDefaults();window.dispatchEvent(new Event('ng:data-changed'))}
 });
 const setTabBase=window.setTab;window.setTab=tab=>{setTabBase(tab);renderGuide()};
 const startBase=window.startTrainerSession;window.startTrainerSession=()=>{startBase();window.dispatchEvent(new Event('ng:session-changed'));renderGuide()};
 const finishBase=window.finishTrainerSession;window.finishTrainerSession=()=>{finishBase();applyDefaults();window.dispatchEvent(new Event('ng:data-changed'));renderGuide()};
 const chooseBase=window.chooseGuide;window.chooseGuide=i=>{chooseBase(i);renderGuide()};
 window.addEventListener('ng:cloud-hydrated',()=>applyDefaults());
 window.addEventListener('ng:data-changed',()=>{if(applying)return;clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>{if(currentProfile()){window.ngPersonalPlan=planNow();renderProtein();renderGuide()}},40)});
 window.addEventListener('pagehide',()=>window.speechSynthesis?.cancel());
 // Restore local profile without relying on a cloud request succeeding.
 const savedProfile=read('profile',{});if(core.validProfile(savedProfile)&&!document.body.classList.contains('post-profile')){for(const key of ['age','sex','height','weight','activity','goal'])$(key).value=savedProfile[key];window.ngRestoringProfile=true;try{profileForm.requestSubmit()}finally{window.ngRestoringProfile=false}}
 applyDefaults();setInterval(renderLiveCompanion,1000);
})();
