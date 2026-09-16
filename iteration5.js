/* Accessible manual tabs, with ordinary linked sections as the no-JS fallback. */
(() => {
  const root = document.querySelector('.idea-selector');
  if (!root) return;
  const choices = [...root.querySelectorAll('[data-idea-choice]')];
  const panels = [...root.querySelectorAll('[data-idea-panel]')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const list = root.querySelector('.idea-choices');
  list.setAttribute('role','tablist');
  list.setAttribute('aria-label','Виды отдыха');
  function orientation(){list.setAttribute('aria-orientation',innerWidth>760?'vertical':'horizontal')}
  orientation();
  window.addEventListener('resize',orientation,{passive:true});
  choices.forEach((tab,i) => {
    tab.setAttribute('role','tab');
    tab.setAttribute('aria-controls',panels[i].id);
    panels[i].setAttribute('role','tabpanel');
    panels[i].setAttribute('aria-labelledby',tab.id);
    panels[i].tabIndex=0;
  });
  function select(index, animate=false){
    choices.forEach((tab,i) => {
      tab.setAttribute('aria-selected',String(i===index));
      tab.tabIndex=i===index?0:-1;
      panels[i].hidden=i!==index;
    });
    if(animate&&!motion.matches){
      panels[index].getAnimations().forEach(a=>a.cancel());
      panels[index].animate([{opacity:.75},{opacity:1}],{duration:180,easing:'ease-out'});
    }
  }
  choices.forEach((tab,index) => {
    tab.addEventListener('click',e=>{e.preventDefault();select(index,e.detail>0)});
    tab.addEventListener('keydown',e=>{
      let next=index;
      if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(index+1)%choices.length;
      else if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(index+choices.length-1)%choices.length;
      else if(e.key==='Home')next=0;
      else if(e.key==='End')next=choices.length-1;
      else if(e.key===' '){e.preventDefault();select(index);return}
      else return;
      e.preventDefault();select(next);choices[next].focus();
    });
  });
  root.classList.add('is-enhanced');
  const initial=panels.findIndex(p=>'#'+p.id===location.hash);
  select(initial<0?0:initial);
})();

/* Infinite partner ribbon: slow autoplay, pointer drag and short momentum. */
(() => {
  const viewport = document.querySelector('#partner-marquee');
  if (!viewport) return;
  const track = viewport.querySelector('.partner-track');
  const originals = [...track.children];
  originals.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden','true');
    clone.querySelector('img')?.setAttribute('alt','');
    track.append(clone);
  });
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const gap = 16;
  function resizeCards(){
    const visible = innerWidth >= 1050 ? 5 : innerWidth >= 700 ? 3 : 2;
    viewport.style.setProperty('--partner-card-width',`${(viewport.clientWidth-gap*(visible-1))/visible}px`);
  }
  resizeCards();
  addEventListener('resize',resizeCards,{passive:true});
  let dragging=false,lastX=0,lastTime=0,velocity=0,previous=performance.now();
  function normalize(){
    const half=track.scrollWidth/2;
    if(!half)return;
    if(viewport.scrollLeft>=half)viewport.scrollLeft-=half;
    else if(viewport.scrollLeft<0)viewport.scrollLeft+=half;
  }
  function frame(now){
    const dt=Math.min(40,now-previous);previous=now;
    if(!dragging&&!document.hidden){
      if(!reduced.matches)viewport.scrollLeft+=dt*.022;
      if(Math.abs(velocity)>.01){viewport.scrollLeft+=velocity*dt;velocity*=Math.pow(.91,dt/16)}
      normalize();
    }
    requestAnimationFrame(frame);
  }
  viewport.addEventListener('pointerdown',e=>{
    dragging=true;velocity=0;lastX=e.clientX;lastTime=performance.now();
    viewport.classList.add('is-dragging');viewport.setPointerCapture(e.pointerId);
  });
  viewport.addEventListener('pointermove',e=>{
    if(!dragging)return;
    const now=performance.now(),delta=lastX-e.clientX,dt=Math.max(8,now-lastTime);
    viewport.scrollLeft+=delta;velocity=delta/dt;lastX=e.clientX;lastTime=now;normalize();
  });
  function release(e){if(!dragging)return;dragging=false;viewport.classList.remove('is-dragging');if(e?.pointerId&&viewport.hasPointerCapture(e.pointerId))viewport.releasePointerCapture(e.pointerId)}
  viewport.addEventListener('pointerup',release);viewport.addEventListener('pointercancel',release);
  viewport.addEventListener('keydown',e=>{if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;e.preventDefault();viewport.scrollBy({left:(e.key==='ArrowRight'?1:-1)*(originals[0].getBoundingClientRect().width+gap),behavior:reduced.matches?'auto':'smooth'})});
  requestAnimationFrame(frame);
})();
