(() => {
 const {escape:e}=NG;
 // Move complete tab sections out of the home-only results grid.
 const wrap=document.querySelector('.wrap');
 const sections={food:'.protein-tracker,.food-nutrition,.food-library,.food-studio,.market-banner,.stories,.all-foods',move:'.inspiration,.exercise-library',journey:'.journey',plan:'.reminders,.weekly-report'};
 Object.entries(sections).forEach(([tab,selector])=>document.querySelectorAll(selector).forEach(node=>{node.dataset.ngTab=tab;wrap.appendChild(node)}));
 document.querySelector('#ngSmartPanel').dataset.ngTab='food';wrap.appendChild(document.querySelector('#ngSmartPanel'));
 const baseSetTab=window.setTab;
 window.setTab=function(tab){baseSetTab(tab);document.querySelectorAll('[data-ng-tab]').forEach(node=>{const show=node.dataset.ngTab===tab;node.style.setProperty('display',show?'block':'none','important')});document.querySelectorAll('.app-nav [data-tab]').forEach(b=>{b.setAttribute('aria-current',b.dataset.tab===tab?'page':'false')});};
 // HTML labels were visually present but not associated with their controls.
 document.querySelectorAll('label').forEach(label=>{const next=label.nextElementSibling;if(!label.control&&next?.id&&/^(INPUT|SELECT|TEXTAREA)$/.test(next.tagName))label.htmlFor=next.id});
 document.querySelectorAll('button:not([type])').forEach(b=>{if(b.closest('#form')===null)b.type='button'});
 const modal=document.getElementById('exerciseModal');modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','Exercise form guide');
 const oldOpen=window.openExercise,oldClose=window.closeExercise;let lastFocus;
 window.openExercise=function(i){lastFocus=document.activeElement;oldOpen(i);document.body.style.overflow='hidden';modal.querySelector('.close').focus()};
 window.closeExercise=function(){oldClose();document.body.style.overflow='';lastFocus?.focus()};
 document.addEventListener('keydown',ev=>{if(modal.style.display!=='flex')return;if(ev.key==='Escape'){ev.preventDefault();closeExercise()}if(ev.key==='Tab'){const els=[...modal.querySelectorAll('button,a[href]')];if(ev.shiftKey&&document.activeElement===els[0]){ev.preventDefault();els.at(-1)?.focus()}else if(!ev.shiftKey&&document.activeElement===els.at(-1)){ev.preventDefault();els[0]?.focus()}}});
 window.openTrainerForm=()=>{const st=window.ngTrainerState;const name=st?.plan?.[st.exerciseIndex]?.[1]||'';const aliases={'Low-impact step jack':'Low-impact jumping jack','Easy walking':'Brisk walking','Glute bridge reset':'Glute bridge'};const i=exerciseData.findIndex(x=>x.n===(aliases[name]||name));if(i>=0)openExercise(i);else document.getElementById('ngTrainerCue').textContent='Use the machine demonstration and ask gym staff to check your setup before adding weight.'};
 window.changeGuide=()=>{setTab('home');const choices=document.getElementById('guideChoices');choices.open=true;document.querySelector('.guide-picker').scrollIntoView({behavior:'smooth',block:'center'});choices.querySelector('summary').focus({preventScroll:true})};
 // Remaining legacy user-controlled render paths.
 const oldRenderProtein=window.renderProtein;
 window.renderProtein=()=>{oldRenderProtein();document.querySelectorAll('.protein-entry').forEach((el,i)=>{if(!proteinItems[i])return;const remove=el.querySelector('button');el.textContent=proteinItems[i].name+' '+proteinItems[i].g+' g';if(remove)el.append(remove)})};
 window.renderJournal=()=>{const el=document.getElementById('timeline');el.innerHTML=journal.length?journal.map(x=>`<div class="entry"><small>${e(x.date)}</small>${e(x.text)}</div>`).join(''):'No entries yet. Your progress will appear here.'};
 window.ngQuickLog=()=>{setTab('food');document.getElementById('nutritionFood').focus();document.querySelector('.food-nutrition').scrollIntoView({behavior:'smooth'})};
 setTab('home');renderJournal();
})();
(() => {
 const labels={home:'Home',food:'Food studio',move:'Exercise',journey:'Journey',plan:'Plan & reports'};
 const paths={home:'M3 10 12 3l9 7v11h-6v-7H9v7H3Z',food:'M3 12h18c0 5-4 9-9 9s-9-4-9-9ZM7 3v5m5-6v6m5-5v5',move:'M3 8v8m4-11v14m10-14v14m4-11v8M7 12h10',journey:'M12 5c-3-2-7-2-10-1v15c3-1 7-1 10 1m0-15c3-2 7-2 10-1v15c-3-1-7-1-10 1V5Z',plan:'M4 5h16v16H4ZM8 2v6m8-6v6M4 11h16'};
 document.querySelectorAll('.app-nav button').forEach(b=>{const key=b.dataset.tab;b.innerHTML=`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[key]}"></path></svg><span>${labels[key]}</span>`;b.setAttribute('aria-label',labels[key])});
})();
