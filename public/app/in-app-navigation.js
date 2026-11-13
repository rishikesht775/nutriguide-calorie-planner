/* In-app navigation controls */
(function(){
  "use strict";
  var labels={home:"Home",food:"Food studio",move:"Exercise",journey:"Journey",plan:"Plan & reports"};
  var activeTab="home";
  var tabHistory=[];
  var suppressRecord=false;
  var ready=false;
  var $=function(s,r){return (r||document).querySelector(s)};
  var isVisible=function(el){return !!el && !el.hidden && getComputedStyle(el).display!=="none"};
  function currentTab(){var b=$(".app-nav button.active");return b&&b.dataset.tab||activeTab||"home"}
  function inject(){
    var nav=$(".app-nav");
    if(!nav||$("#ngInAppToolbar"))return;
    var bar=document.createElement("div");
    bar.id="ngInAppToolbar";
    bar.className="ng-inapp-toolbar";
    bar.innerHTML="<button type='button' id='ngInAppBack' class='ng-inapp-back' aria-label='Go back within NutriGuide'><span aria-hidden='true'>←</span><span>Back</span></button><span id='ngInAppContext' class='ng-inapp-context'>Home</span><button type='button' id='ngInAppCancel' class='ng-inapp-cancel' aria-label='Cancel this view'>Cancel</button>";
    nav.parentNode.insertBefore(bar,nav);
    $("#ngInAppBack").addEventListener("click",goBack);
    $("#ngInAppCancel").addEventListener("click",cancelView);
    addModalCancel();
    ready=true;
    render();
  }
  function addModalCancel(){
    var card=$("#exerciseModal .modal-card");
    if(!card||$(".ng-modal-cancel",card))return;
    var button=document.createElement("button");
    button.type="button";
    button.className="ng-modal-cancel";
    button.textContent="Cancel";
    button.addEventListener("click",function(){if(typeof window.closeExercise==="function")window.closeExercise();render()});
    card.appendChild(button);
  }
  function callTab(tab,record){
    if(typeof window.setTab!=="function")return;
    if(record&&activeTab!==tab&&activeTab)tabHistory.push(activeTab);
    suppressRecord=true;
    activeTab=tab;
    window.setTab(tab);
    suppressRecord=false;
    render();
  }
  function wrap(){
    var original=window.setTab;
    if(typeof original!=="function"||original.__ngInAppNavigation)return;
    var wrapped=function(tab){
      if(!suppressRecord&&activeTab&&tab&&activeTab!==tab)tabHistory.push(activeTab);
      activeTab=tab||"home";
      var result=original.apply(this,arguments);
      render();
      return result;
    };
    wrapped.__ngInAppNavigation=true;
    wrapped.__ngInAppOriginal=original;
    window.setTab=wrapped;
  }
  function closeTransient(){
    var modal=$("#exerciseModal");
    if(isVisible(modal)){if(typeof window.closeExercise==="function")window.closeExercise();return true}
    var steps=$("#ngStepsQuickPanel");
    if(isVisible(steps)){steps.hidden=true;return true}
    return false
  }
  function goBack(){
    if(closeTransient()){render();return}
    var tab=currentTab();
    var previous=tabHistory.pop();
    if(previous&&previous!==tab)callTab(previous,false);else if(tab!=="home")callTab("home",false);else window.scrollTo({top:0,behavior:"smooth"});
  }
  function cancelView(){
    if(closeTransient()){render();return}
    tabHistory=[];
    if(currentTab()!=="home")callTab("home",false);else window.scrollTo({top:0,behavior:"smooth"});
  }
  function render(){
    if(!ready)return;
    var tab=currentTab();
    var back=$("#ngInAppBack"),cancel=$("#ngInAppCancel"),context=$("#ngInAppContext");
    var transient=isVisible($("#exerciseModal"))||isVisible($("#ngStepsQuickPanel"));
    if(context)context.textContent=labels[tab]||"NutriGuide";
    if(back)back.hidden=tab==="home"&&!tabHistory.length&&!transient;
    if(cancel)cancel.hidden=tab==="home"&&!transient;
    addModalCancel();
  }
  function boot(){inject();wrap();render()}
  document.addEventListener("DOMContentLoaded",boot);
  window.setTimeout(boot,120);
  window.setTimeout(boot,600);
  document.addEventListener("click",function(e){if(e.target.closest(".modal,.ng-steps-quick-panel"))window.setTimeout(render,0)});
})();