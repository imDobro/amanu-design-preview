/* Progressive enhancement: all content is readable without animation or JS. */
(() => {
  if (!document.body.classList.contains('edition-home')) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let keyboard = false;
  document.addEventListener('keydown', e => {
    if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ' || e.key.startsWith('Arrow')) {
      keyboard = true;
      document.body.classList.add('using-keyboard');
    }
  });
  document.addEventListener('pointerdown', () => {
    keyboard = false;
    document.body.classList.remove('using-keyboard');
  });
  const animate = el => {
    if (!el || reduced.matches || keyboard) return;
    el.getAnimations().forEach(a => a.cancel());
    el.animate([{opacity: .65, transform: 'translateY(4px)'},{opacity: 1, transform: 'translateY(0)'}], {duration:220,easing:'cubic-bezier(.23,1,.32,1)'});
  };
  // Existing map logic owns selection and routing. Only respond to its visible title.
  const title = document.getElementById('destination-title');
  const coords = Object.fromEntries(Object.values(window.AMANU.countries).map(d => [d.name, `${Math.abs(d.lat).toFixed(1)}° ${d.lat>=0?'N':'S'} / ${Math.abs(d.lon).toFixed(1)}° ${d.lon>=0?'E':'W'}`]));
  if (title) {
    let current = title.textContent;
    new MutationObserver(() => {
      if (current === title.textContent) return;
      current = title.textContent;
      document.querySelector('.atlas-coordinates').textContent = coords[current] || '';
      animate(document.querySelector('.atlas-copy'));
    }).observe(title,{childList:true,subtree:true,characterData:true});
    document.getElementById('destination-image').addEventListener('load', e => animate(e.currentTarget));
  }
  const items = [...document.querySelectorAll('[data-testimonial]')];
  if (items.length) {
    let active = 0;
    const show = index => {
      active = (index + items.length) % items.length;
      items.forEach((el,i) => el.hidden = i !== active);
      document.getElementById('testimonial-current').textContent = String(active+1).padStart(2,'0');
      animate(items[active]);
    };
    document.querySelector('.testimonial-navigation').hidden = false;
    show(0);
    document.getElementById('testimonial-prev').addEventListener('click',() => show(active-1));
    document.getElementById('testimonial-next').addEventListener('click',() => show(active+1));
  }
})();
