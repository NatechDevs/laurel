/* Apply before paint; preferences are independent of academic records. */
(() => {
  'use strict';
  const key = 'laurel-appearance';
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const themeControls=[];
  let preference = 'system';
  try { preference = localStorage.getItem(key) || 'system'; } catch {}
  if (!['light', 'dark', 'system'].includes(preference)) preference = 'system';
  function apply() {
    const dark = preference === 'dark' || (preference === 'system' && system.matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#101e27' : '#f2f5f2');
  }
  apply();
  system.addEventListener('change', apply);
  function connectThemeControl(select){
    select.value=preference;themeControls.push(select);
    select.addEventListener('change',()=>{
      preference=select.value;
      for(const control of themeControls)control.value=preference;
      try{localStorage.setItem(key,preference)}catch{}
      apply();
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
    const host = document.querySelector('.nav');
    if (host) {
      const control = document.createElement('label');
      control.className = 'appearance-control';
      control.innerHTML = '<span class="sr-only">Color theme</span><select aria-label="Color theme"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select>';
      const select = control.querySelector('select');
      connectThemeControl(select);
      host.append(control);

      const planner=Boolean(document.getElementById('records'));
      const landing=document.body.classList.contains('landing-page');
      const portable=document.documentElement.hasAttribute('data-portable');
      const primary=planner?
        [['#records','Course records'],['#assessment','Honors checklist'],['#planner','Grade planning'],['#progressHeading','Degree progress'],['#guide','User guide']]:
        landing?[['planner.html','Open planner'],['#approach','Features'],['#how-it-works','How it works'],['#questions','FAQs']]:
        [['index.html','Home'],['planner.html','Open planner']];
      const secondary=[...(planner?[[portable?'#top':'index.html','Home']]:[]),[portable?'#reference':'sources.html','Rules & sources'],[portable?'#independent':'disclaimer.html','Disclaimer']];
      const links=items=>items.map(([href,label])=>`<a href="${href}"><span>${label}</span><span aria-hidden="true">↗</span></a>`).join('');
      const drawer=document.createElement('dialog');
      drawer.id='navigationDrawer';drawer.setAttribute('aria-labelledby','navigationDrawerTitle');
      drawer.innerHTML=`<div class="drawer-header"><div><span class="wordmark">laurel<span class="brand-period">.</span></span><h2 id="navigationDrawerTitle">Your navigation</h2></div><button type="button" class="drawer-close" aria-label="Close menu">×</button></div><div class="drawer-scroll"><p class="drawer-group-label">${planner?'YOUR WORKSPACE':'EXPLORE LAUREL'}</p><nav class="drawer-navigation" aria-label="${planner?'Mobile workspace navigation':'Mobile main navigation'}">${links(primary)}</nav><p class="drawer-group-label drawer-secondary-label">REFERENCE & SUPPORT</p><nav class="drawer-navigation drawer-secondary" aria-label="Mobile reference navigation">${links(secondary)}</nav><div class="drawer-appearance"><label for="drawerTheme">Appearance</label><p>Choose what is comfortable for you.</p><select id="drawerTheme" aria-label="Color theme"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></div><p class="drawer-notice">Independent student planning tool.<br>Not affiliated with Bicol University.</p></div>`;
      document.body.append(drawer);connectThemeControl(drawer.querySelector('select'));
      const menu=document.createElement('button');menu.type='button';menu.className='navigation-menu-button';
      menu.setAttribute('aria-controls','navigationDrawer');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-haspopup','dialog');
      menu.innerHTML='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h14"/></svg><span>Menu</span>';
      host.append(menu);
      let previousOverflow='';
      menu.addEventListener('click',()=>{
        if(drawer.open)return;
        previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
        drawer.showModal();menu.setAttribute('aria-expanded','true');
      });
      drawer.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;menu.setAttribute('aria-expanded','false')});
      drawer.querySelector('.drawer-close').addEventListener('click',()=>drawer.close());
      drawer.addEventListener('click',event=>{
        if(event.target.closest('a'))drawer.close();
        else if(event.target===drawer){const box=drawer.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)drawer.close()}
      });
      const phone=window.matchMedia('(max-width: 620px)');
      phone.addEventListener('change',()=>{if(!phone.matches&&drawer.open)drawer.close()});
    }
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!motion.matches && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting) {
          if (!motion.matches) entry.target.classList.add('glass-enter');
          observer.unobserve(entry.target);
        }
      }, { threshold: 0.12 });
      document.querySelectorAll('.hero-copy,.hero-visual,.planning-example,.approach-grid article,.notice-article,.intro').forEach(node => observer.observe(node));
    }
    const example = document.querySelector('.planning-example');
    if (example) {
      const control = document.createElement('div');
      control.className = 'example-control';
      control.innerHTML = '<label for="exampleTarget">Try a different target</label><select id="exampleTarget"><option value="1.25">1.2500</option><option value="1.45" selected>1.4500</option><option value="1.75">1.7500</option></select>';
      example.querySelector('.example-target').after(control);
      const result = example.querySelector('.example-equation div:last-child b');
      result.classList.add('example-result');
      result.setAttribute('role','status');
      result.setAttribute('aria-live','polite');
      control.querySelector('select').addEventListener('change', event => {
        const target = Number(event.target.value);
        example.querySelector('.example-target strong').textContent = target.toFixed(4);
        result.textContent = (target * 2 - 1.5).toFixed(4);
        result.setAttribute('aria-label', `Required GWA across 18 more units: ${result.textContent}`);
      });
    }
    function syncWorkspaceNavigation() {
      const current = location.hash || '#records';
      document.querySelectorAll('.workspace-nav a').forEach(link => {
        if (link.getAttribute('href') === current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      document.querySelectorAll('#navigationDrawer a').forEach(link=>{
        const href=link.getAttribute('href');link.removeAttribute('aria-current');
        if(href.startsWith('#')){if(href===(location.hash||(plannerDefault())))link.setAttribute('aria-current','location')}
        else if(new URL(href,location.href).pathname===location.pathname)link.setAttribute('aria-current','page');
      });
    }
    function plannerDefault(){return document.getElementById('records')?'#records':'#top'}
    window.addEventListener('hashchange', syncWorkspaceNavigation);
    syncWorkspaceNavigation();
    function reveal() {
      let target;
      try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
      if (!target) return;
      for (let parent = target; parent; parent = parent.parentElement) {
        if (parent.tagName === 'DETAILS') parent.open = true;
      }
      requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
    }
    window.addEventListener('hashchange', reveal);
    reveal();
  });
})();
