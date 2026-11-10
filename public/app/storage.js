/* Shared storage/escaping boundary. Loaded before the legacy page runtime. */
(() => {
 const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const read=(key,fallback)=>{try{const value=JSON.parse(localStorage.getItem(key)??'null');return value===null||typeof value!==typeof fallback||Array.isArray(value)!==Array.isArray(fallback)?fallback:(Array.isArray(value)?value.filter(x=>x!==null&&x!==undefined):value)}catch{return fallback}};
 const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));window.dispatchEvent(new CustomEvent('ng:data-changed',{detail:{key}}));return true}catch{const el=document.getElementById('ngNotice');if(el)el.textContent='Storage is full or unavailable. Export a backup before clearing browser data.';return false}};
 const day=(offset=0)=>{const d=new Date();d.setDate(d.getDate()+offset);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
 window.NG={escape,read,write,day};
})();
