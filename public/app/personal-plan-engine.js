/* One source for profile estimates and editable defaults. Pure, tested policy. */
(() => {
 const allowedActivities=[1.2,1.375,1.55,1.725];
 const positive=(value,min,max)=>Number.isFinite(Number(value))&&Number(value)>=min&&Number(value)<=max;
 function validProfile(p){return !!p&&positive(p.age,14,90)&&positive(p.height,80,250)&&positive(p.weight,20,350)&&['male','female'].includes(p.sex)&&['loss','maintain','gain'].includes(p.goal)&&allowedActivities.includes(Number(p.activity))}
 function derive(profile,settings={},context={}){
  if(!validProfile(profile))return null;
  settings=settings&&typeof settings==='object'?settings:{};context=context&&typeof context==='object'?context:{};
  const p=profile,weight=Number(p.weight),height=Number(p.height),age=Number(p.age),activity=Number(p.activity);
  const tdee=(10*weight+6.25*height-5*age+(p.sex==='male'?5:-161))*activity;
  const estimatedCalories=Math.max(p.sex==='male'?1500:1200,Math.round((tdee+(p.goal==='loss'?-450:p.goal==='gain'?300:0))/10)*10);
  const estimatedProtein=Math.round(weight*(p.goal==='gain'?1.6:1.4));
  const manual=settings.targets||{};
  const calories=positive(manual.calories,1200,5000)?Number(manual.calories):estimatedCalories;
  const protein=positive(manual.protein,20,300)?Number(manual.protein):estimatedProtein;
  const readiness=context.readiness||'ready';
  const suggestion={goal:p.goal==='gain'?'strength':'balanced',setting:'home',duration:activity<=1.2?'10':activity>=1.725?'30':'20'};
  let trainingReason=p.goal==='gain'?'Strength basics support your chosen muscle-building goal.':'Full-body basics balance movement and strength for your goal.';
  if(readiness==='tired'||readiness==='sore'||context.lastEffort==='hard'){
   suggestion.goal='mobility';suggestion.duration='10';trainingReason='Your check-in suggests a gentler session. Choose rest if you feel unwell; stop for pain.';
  }else if(activity<=1.2)trainingReason+=' Your activity setting starts you with a shorter session.';
  const custom=settings.training?.mode==='custom'?settings.training:{};
  const training={...suggestion};
  if(['balanced','strength','cardio','mobility'].includes(custom.goal))training.goal=custom.goal;
  if(['home','gym'].includes(custom.setting))training.setting=custom.setting;
  if(['10','20','30'].includes(String(custom.duration)))training.duration=String(custom.duration);
  return {calories,protein,bmi:Number((weight/((height/100)**2)).toFixed(1)),estimatedCalories,estimatedProtein,
   calorieSource:positive(manual.calories,1200,5000)?'custom':'profile',proteinSource:positive(manual.protein,20,300)?'custom':'profile',
   goal:p.goal,goalLabel:{loss:'Lose weight',maintain:'Maintain weight',gain:'Build weight & strength'}[p.goal],
   training,trainingSource:custom.mode==='custom'?'custom':'profile',trainingReason:custom.mode==='custom'?'You chose this workout. Your saved choice is kept.':trainingReason,
   journey:p.goal==='gain'?'Strength foundation':p.goal==='loss'?'Steady habit journey':'Balanced wellness journey',
   fingerprint:JSON.stringify([p.age,p.sex,p.height,p.weight,p.activity,p.goal,calories,protein])};
 }
 function progress({today,food=[],history=[],measurements=[],settings={}}){
  const datedFood=food.filter(x=>x&&x.date===today);
  const completed=history.filter(x=>x&&Number(x.actualSeconds)>=60&&localDay(x.date)===today);
  const recovery=measurements.find(x=>x&&x.date===today);
  return {food:datedFood.length>0,movement:completed.length>0,recovery:!!recovery,review:settings.reviewDate===today,
   calories:datedFood.reduce((a,x)=>a+Number(x.cal||0),0),protein:datedFood.reduce((a,x)=>a+Number(x.p||0),0),workouts:completed.length};
 }
 function localDay(value){const d=new Date(value);return Number.isNaN(d.getTime())?'':`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
 function stage(startDay,today){const start=new Date(startDay+'T12:00:00'),now=new Date(today+'T12:00:00');const days=Math.max(0,Math.round((now-start)/86400000)||0),week=Math.min(4,Math.floor(days/7)+1);return {week,title:['Learn your routine','Repeat what works','Build consistency','Review and adjust'][week-1],day:days+1}}
 // A cached widget or generic meal-engine default is not a personal target.
 function targets(profile,plan){
  if(!validProfile(profile)||!plan||!positive(plan.calories,1200,5000)||!positive(plan.protein,20,300))return {ready:false,cal:0,p:0};
  return {ready:true,cal:Number(plan.calories),p:Number(plan.protein)};
 }
 window.NGPersonalCore={validProfile,derive,progress,localDay,stage,targets};
})();
