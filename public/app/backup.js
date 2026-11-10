(() => {
 const arrays=['proteinItems','journal','reminders','weights','grocery','nutritionLog','ngMeals','ngGroceries','ngTrainerHistory','ngFavouriteMeals','ngMeasurements','ngPantry','ngCoachHistory','ngWeeklyPlans','ngAutoGroceries','ngRecipeDraft'];
 const objects=['profile','ngHabits','ngFasting','ngPreferences','ngLessonState','ngPlanSettings','ngDailyStats','ngPersonalSettings','ngPlanContext'];
 const isObject=x=>x&&typeof x==='object'&&!Array.isArray(x);
 const text=x=>typeof x==='string'&&x.length<=10000;
 const number=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0;
 function validate(data,allow){
  if(!isObject(data)||data.app!=='NutriGuide'||data.version!==1||!isObject(data.data))throw Error('Not a NutriGuide v1 backup');
  for(const [key,value]of Object.entries(data.data)){
   if(!allow.includes(key))throw Error('Unsupported backup field: '+key);
   if(arrays.includes(key)&&(!Array.isArray(value)||value.length>1000))throw Error('Invalid list: '+key);
   if(objects.includes(key)&&!isObject(value))throw Error('Invalid object: '+key);
   if(key==='nutritionLog'||key==='ngRecipeDraft'||key==='proteinItems')for(const item of value){if(!isObject(item)||!text(item.name)||!['cal','p','c','fat','f','g','qty'].every(k=>item[k]===undefined||number(item[k])))throw Error('Invalid nutrition row')}
   if(key==='journal')for(const item of value){if(!isObject(item)||!text(item.text)||!text(item.date))throw Error('Invalid journal row')}
   if(key==='reminders')for(const item of value){if(!isObject(item)||!['date','time','type','text'].every(k=>text(item[k])))throw Error('Invalid reminder row')}
   if(key==='ngWeeklyPlans')for(const d of value){if(!isObject(d)||!text(d.date)||!Array.isArray(d.items)||!['cal','p','cost'].every(k=>number(d[k])))throw Error('Invalid meal plan');for(const r of d.items){if(!isObject(r)||!text(r.name)||!text(r.id)||!text(r.meal)||!text(r.why)||!isObject(r.ingredients)||!['cal','p','c','fat','f','cost','servings'].every(k=>number(r[k]))||!Object.values(r.ingredients).every(number))throw Error('Invalid recipe in meal plan')}}
   if(key==='ngTrainerHistory')for(const x of value){if(!isObject(x)||!text(x.goal)||!number(x.duration)||!text(x.date))throw Error('Invalid trainer row')}
   if(['ngGroceries','ngPantry','grocery'].includes(key)&&!value.every(text))throw Error('Invalid ingredient list');
   if(['steps','water','proteinTarget','foodLogs','exerciseLogs','journeyStep'].includes(key)&&!(number(value)||(text(value)&&Number.isFinite(Number(value))&&Number(value)>=0)))throw Error('Invalid counter');
   if(key==='profile'&&['age','height','weight'].some(k=>!Number.isFinite(Number(value[k]))||Number(value[k])<=0))throw Error('Invalid profile');
  }
  return data.data;
 }
 window.NGBackup={validate};
})();
