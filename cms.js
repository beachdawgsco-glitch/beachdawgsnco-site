/* Loads owner-editable content from the site database (edited in /portal/), falling back to /data/*.json, then to the content already in the page HTML. */
(function(){
const ALLOW=new Set(['BR','EM','B','STRONG','I','SPAN']),norm=h=>String(h).replace(/\s+/g,' ').trim();
const isTextEl=e=>!/^(SCRIPT|STYLE|NOSCRIPT|SVG|IMG|INPUT|TEXTAREA|SELECT|OPTION|BUTTON|HEAD|TITLE|META|LINK|BR)$/i.test(e.tagName)&&!e.closest('#bd-ui')&&[...e.children].every(k=>ALLOW.has(k.tagName)&&k.children.length===0)&&e.textContent.trim().length>0;
const IDX=[];document.body.querySelectorAll('*').forEach(e=>{if(isTextEl(e))IDX.push([e,norm(e.innerHTML)]);});
const PAGE=({'index':'index','':'index','full-auto-detailing-services':'full-auto-detailing-services','exterior-detailing-services':'exterior-detailing-services','ceramic-coating-service':'ceramic-coating-service','customs':'customs','gallery':'gallery','policies':'policies','privacy-policy':'privacy-policy'})[location.pathname.split('/').pop().replace(/\.html$/,'')]||'';
function clean(html){const t=document.createElement('template');t.innerHTML=String(html);const out=document.createElement('div');
 (function walk(src,dst){src.childNodes.forEach(n=>{if(n.nodeType===3)dst.append(document.createTextNode(n.nodeValue));else if(n.nodeType===1&&ALLOW.has(n.tagName)){const k=document.createElement(n.tagName);const cl=n.getAttribute('class');if(cl&&/^[\w -]{1,60}$/.test(cl))k.className=cl;if(n.tagName!=='BR')walk(n,k);dst.append(k);}else if(n.nodeType===1)walk(n,dst);});})(t.content,out);return out.innerHTML;}
const hideEl=k=>{const m=/^(\w+)(?:#([\w-]+)|:(\d+))$/.exec(k);if(!m)return null;return m[2]?document.getElementById(m[2]):document.querySelectorAll(m[1].toLowerCase())[+m[3]]||null;};
const IMGS=new Map(),LINKS=new Map();document.querySelectorAll('img').forEach(i=>IMGS.set(i,i.getAttribute('src')));document.querySelectorAll('a[href]').forEach(a=>LINKS.set(a,a.getAttribute('href')));
window.__bd={IMGS,LINKS,IDX,norm,PAGE,clean,hideKey:e=>{const s=e.closest('section,footer,header');if(!s)return '';const t=s.tagName;return s.id?t+'#'+s.id:t+':'+[...document.querySelectorAll(t.toLowerCase())].indexOf(s);}};
const D={phone:'(252) 933-7311',phone2:'252-933-7311',digits:'12529337311',email:'management@beachdawgsnco.com',a1:'16881 US-17, Unit F',a2:'Hampstead, NC 28443',hours:'Mon to Sat, 9 AM to 5 PM'};
const get=n=>fetch('data/'+n+'.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).catch(()=>null);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const safeUrl=u=>{const value=String(u||'').trim();if(!value||/[\u0000-\u0020\\]/.test(value)||value.startsWith('//'))return '#';if(/^(https?:|mailto:|tel:|sms:)/i.test(value))return value;if(value.startsWith('#')||value.startsWith('/'))return value;if(/^[\w][\w.\/-]*(#[\w-]*)?(\?[\w=&%.-]*)?$/.test(value))return value;return '#';};
const md=s=>esc(s).replace(/\[([^\]]+)\]\(([^)]+)\)/g,(m,t,u)=>'<a href="'+esc(safeUrl(u.replace(/&amp;/g,'&')))+'">'+t+' ↗︎</a>');
function swapText(map){const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const n=[];while(w.nextNode())n.push(w.currentNode);
 n.forEach(x=>{if(x.parentNode.closest('script,style'))return;let v=x.nodeValue,o=v;for(const[k,r]of map)if(k&&r&&k!==r)v=v.split(k).join(r);if(v!==o)x.nodeValue=v;});}
function site(s){if(!s)return;
 const dig=String(s.phone_digits||D.digits).replace(/\D/g,'');
 document.querySelectorAll('a[href^="tel:"]').forEach(a=>a.href='tel:+'+dig);
 document.querySelectorAll('a[href^="sms:"]').forEach(a=>a.href=a.href.replace(/sms:\+?\d+/,'sms:+'+dig));
 document.querySelectorAll('a[href^="mailto:"]').forEach(a=>a.href=a.href.replace(/mailto:[^?]+/,'mailto:'+(s.email||D.email)));
 const ph=s.phone_display||D.phone,ph2=ph.replace(/[()]/g,'').replace(/\s+/g,'-');
 swapText([[D.phone,ph],[D.phone2,ph2],[D.email,s.email],[D.hours,s.hours]]);
 const f=document.querySelector('footer .footer-grid');if(f)f.querySelectorAll('p').forEach(p=>{if(p.innerHTML.includes(D.a1)||p.textContent.includes('Hampstead, NC')){p.innerHTML=esc(s.address_line1||D.a1)+'<br>'+esc(s.address_line2||D.a2)+'<br>'+esc(s.hours||D.hours);}});
 if(s.promo_enabled&&s.promo_text){const b=document.createElement(s.promo_link?'a':'div');b.className='promo-bar';if(s.promo_link)b.href=safeUrl(s.promo_link);b.textContent=s.promo_text;
  b.style.cssText='display:block;text-align:center;background:var(--orange);color:#111;font-weight:700;font-size:14px;padding:10px 16px;text-decoration:none;position:relative;z-index:60';document.body.prepend(b);}}
function packages(p){if(!p||!p.items)return;p.items.forEach(it=>{document.querySelectorAll('h2,h3').forEach(h=>{if(h.textContent.trim().replace(/\s+/g,' ')!==it.name)return;
 let e=h.nextElementSibling,i=0;while(e&&i<4){if(/^Starting at/.test(e.textContent.trim())&&e.children.length===0){e.textContent=it.price;break;}e=e.nextElementSibling;i++;}});});}
function faq(f){const box=document.querySelector('#faq > div:nth-child(2)');if(!f||!f.items||!f.items.length||!box)return;
 box.innerHTML=f.items.map(x=>'<details><summary>'+esc(x.question)+'<span>+</span></summary><p>'+md(x.answer||'')+'</p></details>').join('');}
function gallery(g){if(!g||!g.items)return;
 const f=location.pathname.split('/').pop().replace(/\.html$/,'')||'index';
 const slug={'index':'home','full-auto-detailing-services':'full-detailing','exterior-detailing-services':'exterior','ceramic-coating-service':'ceramic','customs':'customs','gallery':'gallery'}[f];if(!slug)return;
 const mine=g.items.filter(x=>x&&x.image&&(x.page||'gallery')===slug);if(!mine.length)return;
 const open=(src,alt)=>{let d=document.getElementById('cms-lb');if(!d){d=document.createElement('div');d.id='cms-lb';d.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.92);display:none;align-items:center;justify-content:center;z-index:200;padding:16px;cursor:zoom-out';d.innerHTML='<img style="max-width:100%;max-height:100%;border-radius:10px" alt="">';d.onclick=()=>{d.style.display='none';};document.body.appendChild(d);}d.firstChild.src=src;d.firstChild.alt=alt;d.style.display='flex';};
 const tile=(x,i)=>{const src=String(x.image).replace(/^\//,'');const b=document.createElement('button');b.className='photo';b.type='button';b.setAttribute('aria-label','Enlarge photo '+(i+1));
  b.innerHTML='<img src="'+esc(thumbOf(src))+'" alt="'+esc(x.caption||'Beach Dawgs & Co. work')+'" loading="lazy" decoding="async">';b.addEventListener('click',()=>open(src,x.caption||''));return b;};
 if(slug==='gallery'){const box=document.querySelector('.gallery.full');if(!box)return;const dlg=document.querySelector('#lightbox');[...mine].reverse().forEach((x,i)=>{const src=String(x.image).replace(/^\//,'');const b=document.createElement('button');b.className='photo';b.type='button';b.dataset.image=src;b.setAttribute('aria-label','Enlarge photo '+(i+1));b.innerHTML='<img src="'+esc(thumbOf(src))+'" alt="'+esc(x.caption||'Beach Dawgs & Co. work')+'" loading="lazy" decoding="async">';b.addEventListener('click',()=>{if(dlg&&dlg.showModal){dlg.querySelector('img').src=src;dlg.showModal();}else open(src,x.caption||'');});box.prepend(b);});return;}
 const sec=document.createElement('section');sec.className='section cms-photos';sec.innerHTML='<div style="max-width:1200px;margin:0 auto;padding:0 20px"><span class="eyebrow">OUR WORK</span><h2>RECENT WORK</h2><div class="cms-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px"></div></div>';
 const grid=sec.querySelector('.cms-grid');mine.forEach((x,i)=>{const b=tile(x,i);b.style.cssText='padding:0;border:0;background:none;cursor:zoom-in;border-radius:12px;overflow:hidden;aspect-ratio:4/3';b.firstChild.style.cssText='width:100%;height:100%;object-fit:cover;display:block';grid.append(b);});
 const ft=document.querySelector('footer');if(ft)ft.before(sec);else document.body.append(sec);}
const thumbOf=s=>/^assets\/library\/[\w.-]+$/.test(s)?s.replace('assets/library/','assets/library/t/'):s;
const imgUrl=x=>{x=String(x||'').trim();if(/^https:\/\/[^\s"'<>]+$/.test(x))return esc(x);if(/^\/?assets\/[\w.~%\/-]+$/.test(x))return esc(x.replace(/^\//,''));return '';};
function home(h){if(!h||!/\/(index\.html)?$/.test(location.pathname))return;
 const hero=document.querySelector('.hero-bg');if(hero&&imgUrl(h.hero))hero.src=imgUrl(h.hero).replace(/&amp;/g,'&');
 const cards=[...document.querySelectorAll('#services .service-card')];
 (h.services||[]).forEach((c,i)=>{const a=cards[i];if(!a||!c)return;const im=a.querySelector('img'),u=imgUrl(c.image);if(u&&im)im.src=u.replace(/&amp;/g,'&');
  if(c.title){if(im)im.alt=c.title;const h3=a.querySelector('h3');if(h3&&h3.firstChild)h3.firstChild.textContent=c.title+' ';}
  const p=a.querySelector('p');if(c.text&&p)p.textContent=c.text;if(c.link)a.href=safeUrl(c.link);});
 const grid=document.querySelector('#work .comparison-grid');
 if(grid&&Array.isArray(h.compare)){grid.innerHTML=h.compare.map(c=>'<article class="comparison-card"><div class="compare" style="--split:50%"><div class="bd-photo-layer"><img style="'+BDPhoto.style(c.bTransform)+'" src="'+imgUrl(c.b)+'" alt="'+esc(c.title)+': '+esc(c.lb)+'" loading="lazy"></div><div class="bd-photo-layer compare-top"><img style="'+BDPhoto.style(c.aTransform)+'" src="'+imgUrl(c.a)+'" alt="'+esc(c.title)+': '+esc(c.la)+'" loading="lazy"></div><span class="view-label left">'+esc(c.la)+'</span><span class="view-label right">'+esc(c.lb)+'</span><span class="compare-line" aria-hidden="true"><b>‹ ›</b></span><input type="range" min="0" max="100" value="50" aria-label="Reveal '+esc(c.title)+' views" aria-valuetext="50 percent '+esc(c.la)+', 50 percent '+esc(c.lb)+'"></div><h3>'+esc(c.title)+'</h3><p>'+esc(c.sub)+'</p><small>↔︎ DRAG TO EXPLORE</small></article>').join('');if(window.bdCompare)bdCompare(grid);}
 const car=document.querySelector('#portfolio .carousel');
 if(car&&Array.isArray(h.slides)){const n=h.slides.length;if(!n){car.remove();return;}const pad=i=>String(i+1).padStart(2,'0');
  const html='<div class="carousel" role="region" aria-roledescription="carousel" aria-label="Beach Dawgs portfolio"><div class="carousel-track" tabindex="0" aria-label="Scrollable vehicle photo gallery">'+h.slides.map((s,i)=>'<figure class="carousel-slide" role="group" aria-roledescription="slide" aria-label="'+(i+1)+' of '+n+'"><a class="bd-slide-frame" href="'+esc(safeUrl(s.link||'gallery.html'))+'"><img style="'+BDPhoto.style(s.transform)+'" src="'+imgUrl(s.image)+'" alt="'+esc(s.title||'Beach Dawgs vehicle care photo '+(i+1))+'" loading="lazy"></a><figcaption><span>'+esc(s.title||'BEACH DAWGS & CO.')+'</span><b>'+pad(i)+' / '+pad(n-1)+'</b></figcaption></figure>').join('')+'</div><div class="carousel-controls"><button type="button" data-direction="-1" aria-label="Previous gallery photo">←</button><span class="carousel-status" aria-live="polite">1 / '+n+'</span><button type="button" data-direction="1" aria-label="Next gallery photo">→</button></div></div>';
  const t=document.createElement('div');t.innerHTML=html;const nc=t.firstChild;car.replaceWith(nc);if(window.bdCarousel)bdCarousel(nc.parentNode);}}
function theme(t){if(!t)return;const ok=v=>/^#[0-9a-fA-F]{6}$/.test(v||''),r=document.documentElement.style;
 [['orange','--orange'],['bg','--bg'],['panel','--panel'],['text','--text'],['muted','--muted'],['line','--line']].forEach(([k,v])=>{if(ok(t[k]))r.setProperty(v,t[k]);});}
const linkList=a=>(a||[]).filter(x=>x&&x.label).map(x=>'<a href="'+esc(safeUrl(x.href))+'">'+esc(x.label)+'</a>').join('');
function chrome(s){if(!s)return;
 if(s.nav&&s.nav.length){const n=document.querySelector('header nav');if(n)n.innerHTML=linkList(s.nav);}
 if(s.book&&s.book.label){const b=document.querySelector('header a.btn.small');if(b){b.textContent=s.book.label;if(s.book.href)b.href=safeUrl(s.book.href);}}
 const f=s.footer;if(!f)return;
 if(f.tagline){const p=document.querySelector('footer .footer-grid > div:first-child > p');if(p)p.innerHTML=esc(f.tagline).replace(/\n/g,'<br>');}
 if(f.social&&f.social.length){const so=document.querySelector('footer .social');if(so)so.innerHTML=f.social.filter(x=>x&&x.label).map(x=>'<a href="'+esc(safeUrl(x.href))+'">'+esc(x.label)+'</a>').join('');}
 if(f.explore&&f.explore.length){const d=document.querySelector('footer .footer-grid > div:nth-child(3)');if(d)d.innerHTML='<h4>'+esc(f.exploreTitle||'EXPLORE')+'</h4>'+linkList(f.explore);}
 if(f.copyright){const cp=document.querySelector('footer .copyright');if(cp){const sp=cp.querySelector('span');cp.firstChild.nodeValue=f.copyright+' ';if(sp&&f.copyrightNote!==undefined)sp.textContent=f.copyrightNote;}}}
function pageEdits(pe){if(!pe)return;const T=pe.text||{},I=pe.img||{},H=pe.href||{};
 IDX.forEach(([e,k])=>{if(T[k]!==undefined&&document.body.contains(e))e.innerHTML=clean(T[k]);});
 IMGS.forEach((k,im)=>{const u=I[k]&&imgUrl(I[k]);if(u)im.src=u.replace(/&amp;/g,'&');});
 LINKS.forEach((k,a)=>{if(H[k])a.setAttribute('href',safeUrl(H[k]));});
 (pe.hide||[]).forEach(k=>{const e=hideEl(k);if(e)e.style.display='none';});}
const SB='https://gxjgqxqcvkfanvydbztv.supabase.co',KEY='sb_publishable_pI_tA_OhNtH4sGaZ8yor-g_b7kKJ2F3';
const db=()=>{const c=new AbortController();const t=setTimeout(()=>c.abort(),4000);
 return fetch(SB+'/rest/v1/beach_content?select=key,data',{headers:{apikey:KEY},signal:c.signal,cache:'no-store'}).then(r=>r.ok?r.json():[]).then(a=>{clearTimeout(t);const m={};a.forEach(x=>{if(x&&x.key&&x.data)m[x.key]=x.data;});return m;}).catch(()=>({}));};
const names=['site','packages','faq','gallery'];
Promise.all([db(),Promise.all(names.map(get))]).then(([m,r])=>{const v=names.map((n,i)=>m[n]||r[i]);const S=v[0]||{};theme(S.theme);if(PAGE)pageEdits(S.pages&&S.pages[PAGE]);chrome(S);site(v[0]);home(S.home);if(/[?&]edit(=|&|$)/.test(location.search)&&PAGE){const sc=document.createElement('script');sc.src='edit.js';document.body.append(sc);}packages(v[1]);faq(v[2]);gallery(v[3]);});
})();
