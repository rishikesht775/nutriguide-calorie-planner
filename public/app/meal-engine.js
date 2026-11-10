/* Curated recipe estimates. Planning is deterministic and explainable; no AI service is impersonated. */
(() => {
 const recipes=[
  {id:'oats',name:'Oats, curd & banana',meal:'Breakfast',cal:380,p:20,c:56,fat:10,f:7,cost:45,diets:['vegetarian'],ingredients:{oats:50,curd:150,banana:80},why:'Oats add fibre; curd contributes protein.'},
  {id:'chilla',name:'Moong dal chilla',meal:'Breakfast',cal:330,p:18,c:48,fat:9,f:8,cost:30,diets:['vegan','vegetarian','jain'],ingredients:{'moong dal':70,tomato:60,spinach:40},why:'A pulse-based breakfast with fibre and plant protein.'},
  {id:'poha',name:'Peanut poha',meal:'Breakfast',cal:360,p:10,c:57,fat:12,f:5,cost:25,diets:['vegan','vegetarian','jain'],ingredients:{poha:60,peanuts:15,peas:40},why:'Peanuts add protein and texture to a familiar breakfast.'},
  {id:'tofu',name:'Tofu bhurji with roti',meal:'Dinner',cal:450,p:28,c:50,fat:17,f:8,cost:65,diets:['vegan','vegetarian','jain'],ingredients:{tofu:180,'whole wheat flour':60,tomato:60},why:'Tofu adds plant protein; roti supplies energy.'},
  {id:'paneer',name:'Paneer vegetable bowl',meal:'Dinner',cal:510,p:31,c:39,fat:26,f:9,cost:80,diets:['vegetarian','jain'],ingredients:{paneer:150,'non-root vegetables':180,rice:40},why:'Paneer contributes protein; vegetables add fibre.'},
  {id:'rajma',name:'Rajma rice bowl',meal:'Lunch',cal:520,p:22,c:85,fat:10,f:15,cost:45,diets:['vegan','vegetarian','jain'],ingredients:{rajma:75,rice:65,tomato:60},why:'Beans and rice form a filling pulse-and-grain meal.'},
  {id:'dal',name:'Dal roti & greens',meal:'Lunch',cal:500,p:24,c:78,fat:12,f:13,cost:40,diets:['vegan','vegetarian','jain'],ingredients:{dal:70,'whole wheat flour':75,spinach:100},why:'Dal and greens add protein and fibre.'},
  {id:'khichdi',name:'Moong vegetable khichdi',meal:'Dinner',cal:440,p:19,c:73,fat:9,f:10,cost:35,diets:['vegan','vegetarian','jain'],ingredients:{'moong dal':55,rice:50,peas:60},why:'An easy one-pot option using grains and pulses.'},
  {id:'chana',name:'Chana cucumber chaat',meal:'Lunch',cal:470,p:24,c:70,fat:12,f:14,cost:35,diets:['vegan','vegetarian','jain'],ingredients:{chana:90,cucumber:100,tomato:80},why:'Chickpeas make this a fibre-rich plant-protein lunch.'},
  {id:'idli',name:'Idli with sambar',meal:'Breakfast',cal:350,p:14,c:62,fat:6,f:7,cost:35,diets:['vegan','vegetarian'],ingredients:{'idli batter':180,dal:30,'mixed vegetables':100},why:'A steamed breakfast with a portion of pulse-based sambar.'},
  {id:'sprouts',name:'Moong sprouts chaat',meal:'Snack',cal:220,p:15,c:31,fat:5,f:9,cost:25,diets:['vegan','vegetarian'],ingredients:{'moong sprouts':180,cucumber:80,tomato:50},why:'Sprouts add fibre and a small protein boost.'},
  {id:'curd',name:'Curd & roasted chana',meal:'Snack',cal:260,p:19,c:31,fat:8,f:5,cost:30,diets:['vegetarian'],ingredients:{curd:180,'roasted chana':35},why:'A convenient combination of dairy and pulse protein.'},
  {id:'fruit',name:'Guava & peanuts',meal:'Snack',cal:220,p:8,c:24,fat:12,f:8,cost:20,diets:['vegan','vegetarian','jain'],ingredients:{guava:150,peanuts:20},why:'Fruit adds fibre; peanuts add fats and protein.'},
  {id:'soy',name:'Soya chunks pulao',meal:'Dinner',cal:490,p:32,c:66,fat:11,f:10,cost:40,diets:['vegan','vegetarian','jain'],ingredients:{'soya chunks':55,rice:55,peas:80},why:'Soya chunks provide a budget plant-protein option.'},
  {id:'dalia',name:'Vegetable dalia',meal:'Breakfast',cal:340,p:12,c:59,fat:8,f:10,cost:25,diets:['vegan','vegetarian','jain'],ingredients:{dalia:70,peas:50,tomato:70},why:'Broken wheat and vegetables offer fibre for a filling start.'},
  {id:'wrap',name:'Paneer salad wrap',meal:'Lunch',cal:520,p:30,c:54,fat:22,f:8,cost:70,diets:['vegetarian','jain'],ingredients:{paneer:130,'whole wheat flour':70,cucumber:100},why:'An easy portable lunch with a clear protein source.'}
 ];
 function buildPlan({target=1800,budget=200,diet='vegetarian',highProtein=false,startDay=NG.day()}={}){
  if(!['vegetarian','vegan','jain'].includes(diet))diet='vegetarian';
  target=Math.max(1200,Math.min(3500,Number(target)||1800));budget=Math.max(80,Number(budget)||200);
  const eligible=recipes.filter(r=>r.diets.includes(diet));
  return Array.from({length:7},(_,day)=>{
   const items=['Breakfast','Lunch','Snack','Dinner'].map((slot,i)=>{
    let pool=eligible.filter(r=>r.meal===slot).sort((a,b)=>highProtein?(b.p/b.cal-a.p/a.cal):a.cost-b.cost);
    const affordable=pool.filter(r=>r.cost<=budget*[.23,.32,.15,.3][i]);if(affordable.length)pool=affordable;
    const r=pool[day%pool.length];return {...r,servings:1};
   });
   const base=items.reduce((a,r)=>a+r.cal,0),factor=Math.max(.6,Math.min(3,target/base));
   const scaled=items.map(r=>({...r,servings:Math.round(factor*100)/100}));
   const date=new Date(startDay+'T12:00:00');date.setDate(date.getDate()+day);
   return {date:`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`,items:scaled,cal:Math.round(scaled.reduce((a,r)=>a+r.cal*r.servings,0)),p:Math.round(scaled.reduce((a,r)=>a+r.p*r.servings,0)),cost:Math.round(scaled.reduce((a,r)=>a+r.cost*r.servings,0))};
  });
 }
 function grocery(plan,people=1){people=Number.isFinite(Number(people))?Math.max(1,Math.min(10,Number(people))):1;const map={};plan.forEach(d=>d.items.forEach(r=>Object.entries(r.ingredients).forEach(([name,g])=>map[name]=(map[name]||0)+g*r.servings*people)));return Object.entries(map).map(([name,g])=>({name,grams:Math.round(g)}))}
 window.NGMeals={recipes,buildPlan,grocery};
})();
