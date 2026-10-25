/* Website management navigation. Supabase remains responsible for authorization. */
(function () {
  const $ = id => document.getElementById(id);
  const el = (tag, props = {}) => Object.assign(document.createElement(tag), props);
  const team = ['owner', 'manager', 'staff'], managers = ['owner', 'manager'];
  const sections = [
    { id:'overview', panel:'p-overview', label:'Overview', group:'Workspace', roles:team, description:'Your website tools and saved content in one place.' },
    { id:'home', panel:'p-home', tab:'hero', label:'Homepage photos', group:'Photos & pages', roles:managers, description:'Choose the main homepage image and manage your photo sections.' },
    { id:'compare', panel:'p-home', tab:'compare', label:'Before / after sliders', group:'Photos & pages', roles:managers, description:'Choose pairs of photos and line them up with the alignment editor.' },
    { id:'slides', panel:'p-home', tab:'slides', label:'Photo slider', group:'Photos & pages', roles:managers, description:'Upload, frame, and reorder the photos in More From the Shop.' },
    { id:'services', panel:'p-home', tab:'services', label:'Service photos', group:'Photos & pages', roles:managers, description:'Update service card photos, headings, and descriptions.' },
    { id:'gallery', panel:'p-edit', label:'Gallery & page photos', group:'Photos & pages', roles:team, description:'Organize your work photos and decide which page they appear on.' },
    { id:'library', panel:'p-lib', label:'Media library', group:'Photos & pages', roles:team, description:'Upload from your computer or Google Drive, then organize photos into folders.' },
    { id:'visual', panel:'p-visual', label:'Visual page editor', group:'Photos & pages', roles:managers, description:'Open a public page to edit its text, images, and links in place.' },
    { id:'appearance', panel:'p-appearance', label:'Website appearance', group:'Website settings', roles:managers, description:'Preview colors and update your website navigation and footer.' },
    { id:'business', panel:'p-business', label:'Business information', group:'Website settings', roles:managers, description:'Manage contact details, hours, and your website promotion banner.' },
    { id:'prices', panel:'p-prices', label:'Website starting prices', group:'Website settings', roles:managers, description:'Keep advertised starting prices consistent with your approved Urable pricing.' },
    { id:'faq', panel:'p-faq', label:'FAQs', group:'Website settings', roles:managers, description:'Edit the answers customers see on your website.' },
    { id:'team', panel:'p-staff', label:'Team access', group:'Access & recovery', roles:['owner'], description:'Manage the people who can update your website.' },
    { id:'backups', panel:'p-backups', label:'Backups & recovery', group:'Access & recovery', roles:['owner'], description:'Download an encrypted backup or review a file before restoring records.' },
    { id:'security', panel:'p-sec', label:'Login & security', group:'Your account', description:'Manage your password and two-step login.' },
    { id:'profile', panel:'p-profile', label:'My profile', group:'Your account', description:'Update your personal contact details and preferences.' },
    { id:'vehicles', panel:'p-veh', label:'My vehicles', group:'Your account', description:'Manage the vehicles saved to your account.' },
    { id:'privacy', panel:'p-priv', label:'Privacy requests', group:'Your account', description:'Request a copy of your account data or account deletion.' }
  ];
  const forms = { 'si-form':'business', 'pk-form':'prices', 'fq-form':'faq' };
  let access = null, active = '', initialized = false, ready = false, failure = '';
  const baselines = new Map();
  const permitted = s => !s.roles || s.roles.includes(access);
  function formSnapshot(id) {
    return JSON.stringify([...$(id).querySelectorAll('input,textarea,select')].map(i => [i.id, i.dataset.name || '', i.type === 'checkbox' ? i.checked : i.value]));
  }
  function formSaved(id, snapshot = formSnapshot(id)) { baselines.set(id, snapshot); refresh(); }
  function dirtyRoutes() {
    const dirty = new Set();
    if (hmDirty) ['home','compare','slides','services'].forEach(id => dirty.add(id));
    if (CH && (JSON.stringify(CH) !== chSaved || $('ch-body').querySelector('input:invalid'))) dirty.add('appearance');
    if (gpDirty) dirty.add('gallery');
    Object.entries(forms).forEach(([id, route]) => { if (baselines.has(id) && formSnapshot(id) !== baselines.get(id)) dirty.add(route); });
    return dirty;
  }
  function refresh() {
    if (!initialized) return;
    const dirty = dirtyRoutes();
    $('dashboard-nav').querySelectorAll('[data-route]').forEach(a => { a.dataset.dirty = String(dirty.has(a.dataset.route)); });
    const status = $('dashboard-status');
    status.className = team.includes(access) ? 'dashboard-status' : 'hide';
    status.replaceChildren();
    if (failure) {
      status.classList.add('error'); status.append(document.createTextNode(failure+' '));
      status.append(el('button', { type:'button', className:'alt', textContent:'Retry loading', onclick:()=>loadEdit() }));
    } else status.textContent = !ready ? 'Loading website content…' : dirty.has(active) ? 'Unsaved changes in this section. Save when you are ready to publish.' : dirty.size ? 'Your edits in other sections are kept while you navigate.' : 'Saved content loaded. Changes publish when you save; photo uploads and removals publish immediately.';
    $('hm-discard').disabled = !hmDirty;
    $('ch-discard').disabled = !dirty.has('appearance');
    document.querySelectorAll('[data-discard]').forEach(b => { b.disabled = !dirty.has(forms[b.dataset.discard]); });
    if (active === 'overview') overview();
    const preview = $('dashboard-theme-preview');
    if (preview) {
      const theme = CH?.theme || {};
      ['bg','panel','text','muted','orange','line'].forEach(k => { if (/^#[0-9a-f]{6}$/i.test(theme[k] || '')) preview.style.setProperty('--sample-'+k, theme[k]); });
    }
  }
  function overview() {
    const stats = $('dashboard-stats'); stats.replaceChildren();
    const home = CONTENT.site?.home || HM?._base || {};
    const counts = { comparisons:home.compare?.length || 0, slides:home.slides?.length || 0, library:LIB.length, gallery:CONTENT.gallery?.items?.length || 0 };
    const metrics = managers.includes(access) ? [['comparisons','Before / after pairs'],['slides','Photo slides'],['library','Library photos'],['gallery','Page photos']] : [['library','Library photos'],['gallery','Page photos']];
    metrics.forEach(([key,label]) => {
      const box = el('div'); box.append(el('strong',{textContent:ready ? String(counts[key] ?? 0) : '…'}),el('span',{textContent:label})); stats.append(box);
    });
    const cards = $('dashboard-cards'); cards.replaceChildren();
    sections.filter(s => permitted(s) && !['overview','profile','vehicles','privacy'].includes(s.id)).forEach(s => {
      const card = el('a',{href:'#'+s.id,className:'dashboard-card'});
      card.onclick = e => { e.preventDefault(); open(s.id); };
      card.append(el('span',{className:'dashboard-card-group',textContent:s.group}),el('h2',{textContent:s.label}),el('p',{textContent:s.description}),el('span',{className:'dashboard-card-open',textContent:'Open '+s.label.toLowerCase()+' →'})); cards.append(card);
    });
  }
  function open(id, focus = true) {
    let section = sections.find(s => s.id === id && permitted(s));
    if (!section) section = sections.find(s => s.id === (team.includes(access) ? 'overview' : 'profile'));
    active = section.id;
    document.querySelectorAll('.pane').forEach(p => p.classList.toggle('hide', p.id !== section.panel));
    $('dashboard-title').textContent = section.label;
    $('dashboard-eyebrow').textContent = team.includes(access) ? section.group.toUpperCase() : 'YOUR ACCOUNT';
    $('dashboard-description').textContent = section.description;
    $('dashboard-nav').querySelectorAll('[data-route]').forEach(a => {
      if (a.dataset.route === active) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
    });
    $('apptabs').querySelectorAll('button').forEach(b => b.classList.toggle('on',b.dataset.p === section.panel));
    if (section.tab && ready && HM) { hmTab=section.tab;renderHome(); }
    const next = '#'+active;
    if (location.hash !== next) history.pushState(null,'',next);
    $('dashboard-sidebar').classList.remove('menu-open'); $('dashboard-menu').setAttribute('aria-expanded','false');
    refresh();
    if (focus) $('dashboard-title').focus({preventScroll:true});
  }
  function setAccess(role) {
    const wasTeam = team.includes(access); access = role; const isTeam = team.includes(access);
    document.body.classList.toggle('has-dashboard',isTeam);
    $('dashboard-sidebar').classList.toggle('hide',!isTeam);
    $('ed-mgr').classList.toggle('hide',!managers.includes(access));
    const nav = $('dashboard-nav'); nav.replaceChildren();
    let group = '';
    sections.filter(permitted).forEach(s => {
      if (s.group !== group) { group=s.group; nav.append(el('span',{className:'dashboard-nav-group',textContent:group})); }
      const a=el('a',{href:'#'+s.id,textContent:s.label}); a.dataset.route=s.id;
      a.onclick=e=>{e.preventDefault();open(s.id);}; nav.append(a);
    });
    $('dashboard-role').textContent=isTeam ? access.charAt(0).toUpperCase()+access.slice(1)+' access' : '';
    const requested=location.hash.slice(1);
    open(isTeam && !wasTeam && ['', 'profile', 'vehicles', 'privacy'].includes(requested) ? 'overview' : requested || (isTeam ? 'overview' : 'profile'),false);
  }
  function loaded() {
    ready=true; failure='';
    Object.keys(forms).forEach(id=>baselines.set(id,formSnapshot(id)));
    document.querySelectorAll('#ed-mgr .pane,#p-edit,#p-lib').forEach(p=>{p.inert=false;});
    if(active)open(active,false);else refresh();
  }
  function loading() {ready=false;failure='';document.querySelectorAll('#ed-mgr .pane,#p-edit,#p-lib').forEach(p=>{p.inert=true;});refresh();}
  function failed(message) { failure=message;refresh(); }
  function init() {
    initialized=true;
    $('dashboard-content').insertBefore($('msg'),$('dashboard-status'));
    $('dashboard-menu').onclick=()=>{const expanded=$('dashboard-sidebar').classList.toggle('menu-open');$('dashboard-menu').setAttribute('aria-expanded',String(expanded));};
    $('apptabs').onclick=e=>{const b=e.target.closest('[data-p]');if(!b)return;const s=sections.find(s=>s.panel===b.dataset.p);if(s)open(s.id);};
    window.addEventListener('hashchange',()=>open(location.hash.slice(1),false));
    window.addEventListener('beforeunload',e=>{if(dirtyRoutes().size){e.preventDefault();e.returnValue='';}});
    $('dashboard-content').addEventListener('input',refresh);
    $('dashboard-content').addEventListener('change',refresh);
    $('fq-form').addEventListener('click',()=>queueMicrotask(refresh));
    document.querySelectorAll('[data-discard]').forEach(b=>b.onclick=()=>{({'si-form':renderSite,'pk-form':renderPackages,'fq-form':renderFaq})[b.dataset.discard]();formSaved(b.dataset.discard);});
    $('hm-discard').onclick=async()=>{try{await loadHome();refresh();}catch(error){say(E(error),'err');}};
    $('ch-discard').onclick=async()=>{try{await loadChrome();refresh();}catch(error){say(E(error),'err');}};
  }
  window.BDAdmin={init,setAccess,open,loaded,loading,failed,refresh,formSnapshot,formSaved};
})();
