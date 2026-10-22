/* Loads owner-editable content from the site database (edited in /portal/), falling back to /data/*.json, then to the content already in the page HTML. */
(function(){
const D={phone:'(252) 933-7311',phone2:'252-933-7311',digits:'12529337311',email:'management@beachdawgsnco.com',a1:'16881 US-17, Unit F',a2:'Hampstead, NC 28443',hours:'Mon to Sat, 7 AM to 5 PM'};
const get=n=>fetch('data/'+n+'.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).catch(()=>null);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const safeUrl=u=>/^(https?:|mailto:|tel:|sms:|\/|#|[\w.-]+\.html)/.test(u)?u:'#';
const md=s=>esc(s).replace(/\[([^\]]+)\]\(([^)]+)\)/g,(m,t,u)=>'<a href="'+esc(safeUrl(u.replace(/&amp;/g,'&')))+'">'+t+' ↗</a>');
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
  b.style.cssText='display:block;text-align:center;background:#ff7a00;color:#111;font-weight:700;font-size:14px;padding:10px 16px;text-decoration:none;position:relative;z-index:60';document.body.prepend(b);}}
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
  b.innerHTML='<img src="'+esc(src)+'" alt="'+esc(x.caption||'Beach Dawgs & Co. work')+'" loading="lazy">';b.addEventListener('click',()=>open(src,x.caption||''));return b;};
 if(slug==='gallery'){const box=document.querySelector('.gallery.full');if(!box)return;const dlg=document.querySelector('#lightbox');[...mine].reverse().forEach((x,i)=>{const src=String(x.image).replace(/^\//,'');const b=document.createElement('button');b.className='photo';b.type='button';b.dataset.image=src;b.setAttribute('aria-label','Enlarge photo '+(i+1));b.innerHTML='<img src="'+esc(src)+'" alt="'+esc(x.caption||'Beach Dawgs & Co. work')+'" loading="lazy">';b.addEventListener('click',()=>{if(dlg&&dlg.showModal){dlg.querySelector('img').src=src;dlg.showModal();}else open(src,x.caption||'');});box.prepend(b);});return;}
 const sec=document.createElement('section');sec.className='section cms-photos';sec.innerHTML='<div style="max-width:1200px;margin:0 auto;padding:0 20px"><span class="eyebrow">OUR WORK</span><h2>RECENT WORK</h2><div class="cms-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px;margin-top:16px"></div></div>';
 const grid=sec.querySelector('.cms-grid');mine.forEach((x,i)=>{const b=tile(x,i);b.style.cssText='padding:0;border:0;background:none;cursor:zoom-in;border-radius:12px;overflow:hidden;aspect-ratio:4/3';b.firstChild.style.cssText='width:100%;height:100%;object-fit:cover;display:block';grid.append(b);});
 const ft=document.querySelector('footer');if(ft)ft.before(sec);else document.body.append(sec);}
const imgUrl=x=>{x=String(x||'').trim();if(/^https:\/\/[^\s"'<>]+$/.test(x))return esc(x);if(/^\/?assets\/[\w.~%\/-]+$/.test(x))return esc(x.replace(/^\//,''));return '';};
function home(h){if(!h||!/\/(index\.html)?$/.test(location.pathname))return;
 const hero=document.querySelector('.hero-bg');if(hero&&imgUrl(h.hero))hero.src=imgUrl(h.hero).replace(/&amp;/g,'&');
 const cards=[...document.querySelectorAll('#services .service-card')];
 (h.services||[]).forEach((c,i)=>{const a=cards[i];if(!a||!c)return;const im=a.querySelector('img'),u=imgUrl(c.image);if(u&&im)im.src=u.replace(/&amp;/g,'&');
  if(c.title){if(im)im.alt=c.title;const h3=a.querySelector('h3');if(h3&&h3.firstChild)h3.firstChild.textContent=c.title+' ';}
  const p=a.querySelector('p');if(c.text&&p)p.textContent=c.text;if(c.link)a.href=safeUrl(c.link);});
 const grid=document.querySelector('#work .comparison-grid');
 if(grid&&h.compare&&h.compare.length){grid.innerHTML=h.compare.map(c=>'<article class="comparison-card"><div class="compare" style="--split:50%"><img src="'+imgUrl(c.b)+'" alt="'+esc(c.title)+': '+esc(c.lb)+'" loading="lazy"><img class="compare-top" src="'+imgUrl(c.a)+'" alt="'+esc(c.title)+': '+esc(c.la)+'" loading="lazy"><span class="view-label left">'+esc(c.la)+'</span><span class="view-label right">'+esc(c.lb)+'</span><span class="compare-line" aria-hidden="true"><b>‹ ›</b></span><input type="range" min="0" max="100" value="50" aria-label="Reveal '+esc(c.title)+' views" aria-valuetext="50 percent '+esc(c.la)+', 50 percent '+esc(c.lb)+'"></div><h3>'+esc(c.title)+'</h3><p>'+esc(c.sub)+'</p><small>↔ DRAG TO EXPLORE</small></article>').join('');if(window.bdCompare)bdCompare(grid);}
 const car=document.querySelector('#portfolio .carousel');
 if(car&&h.slides&&h.slides.length){const n=h.slides.length;const pad=i=>String(i+1).padStart(2,'0');
  const html='<div class="carousel" role="region" aria-roledescription="carousel" aria-label="Beach Dawgs portfolio"><div class="carousel-track" tabindex="0" aria-label="Scrollable vehicle photo gallery">'+h.slides.map((s,i)=>'<figure class="carousel-slide" role="group" aria-roledescription="slide" aria-label="'+(i+1)+' of '+n+'"><a href="'+esc(safeUrl(s.link||'gallery.html'))+'"><img src="'+imgUrl(s.image)+'" alt="'+esc(s.title||'Beach Dawgs vehicle care photo '+(i+1))+'" loading="lazy"></a><figcaption><span>'+esc(s.title||'BEACH DAWGS & CO.')+'</span><b>'+pad(i)+' / '+pad(n-1)+'</b></figcaption></figure>').join('')+'</div><div class="carousel-controls"><button type="button" data-direction="-1" aria-label="Previous gallery photo">←</button><span class="carousel-status" aria-live="polite">1 / '+n+'</span><button type="button" data-direction="1" aria-label="Next gallery photo">→</button></div></div>';
  const t=document.createElement('div');t.innerHTML=html;const nc=t.firstChild;car.replaceWith(nc);if(window.bdCarousel)bdCarousel(nc.parentNode);}}
const SB='https://gxjgqxqcvkfanvydbztv.supabase.co',KEY='sb_publishable_pI_tA_OhNtH4sGaZ8yor-g_b7kKJ2F3';
const db=()=>{const c=new AbortController();const t=setTimeout(()=>c.abort(),4000);
 return fetch(SB+'/rest/v1/beach_content?select=key,data',{headers:{apikey:KEY},signal:c.signal,cache:'no-store'}).then(r=>r.ok?r.json():[]).then(a=>{clearTimeout(t);const m={};a.forEach(x=>{if(x&&x.key&&x.data)m[x.key]=x.data;});return m;}).catch(()=>({}));};
const names=['site','packages','faq','gallery'];
Promise.all([db(),Promise.all(names.map(get))]).then(([m,r])=>{const v=names.map((n,i)=>m[n]||r[i]);site(v[0]);home(v[0]&&v[0].home);packages(v[1]);faq(v[2]);gallery(v[3]);});
})();
