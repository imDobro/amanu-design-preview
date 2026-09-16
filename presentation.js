'use strict';
(() => {
  const body=document.body;
  const switches=[...document.querySelectorAll('[data-design-switch]')];
  const query=new URLSearchParams(location.search);
  const initial=['1','2'].includes(query.get('design'))?query.get('design'):'1';
  const ideaPanels=[...document.querySelectorAll('[data-idea-panel]')];
  const activeIdea=document.querySelector('[data-idea-choice][aria-selected="true"]')?.dataset.ideaChoice||'honeymoon';
  function selectDesign(value){
    body.dataset.design=value;
    switches.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.designSwitch===value)));
    ideaPanels.forEach(panel=>{
      const shouldHide=value==='1'&&panel.dataset.ideaPanel!==activeIdea;
      panel.hidden=shouldHide;
      panel.setAttribute('aria-hidden',String(shouldHide));
    });
    const url=new URL(location.href);url.searchParams.set('design',value);history.replaceState(null,'',url);
  }
  switches.forEach(button=>button.addEventListener('click',()=>selectDesign(button.dataset.designSwitch)));
  selectDesign(initial);

  if(location.pathname.includes('/presentation/')){
    document.querySelectorAll('img[src^="assets/"],video[src^="assets/"]').forEach(media=>{
      media.setAttribute('src',`../${media.getAttribute('src')}`);
    });
  }

  document.querySelectorAll('a').forEach(link=>{
    if(link.matches('[data-idea-choice]')){link.removeAttribute('href');return}
    link.dataset.presentationHref=link.getAttribute('href')||'';
    link.removeAttribute('href');link.setAttribute('aria-disabled','true');link.tabIndex=-1;
  });
  document.querySelectorAll('button').forEach(button=>{
    const allowed=button.hasAttribute('data-design-switch')||button.matches('[data-country]')||Boolean(button.closest('#search-form')&&!button.matches('[type="submit"],.search-submit'));
    if(!allowed){button.disabled=true;button.setAttribute('aria-disabled','true')}
  });
  document.querySelectorAll('.map-marker').forEach(marker=>marker.addEventListener('click',event=>{
    event.preventDefault();event.stopImmediatePropagation();marker.focus();
  },true));
  document.querySelectorAll('form').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();event.stopImmediatePropagation()},true));
  document.addEventListener('click',event=>{
    const link=event.target.closest('a');
    if(link?.matches('[data-idea-choice]')){event.preventDefault();return}
    if(link){event.preventDefault();event.stopImmediatePropagation()}
  },true);
})();
