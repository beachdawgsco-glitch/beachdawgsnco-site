/* Loads owner-editable content from /data/*.json (edited in the admin at /admin). Page HTML already holds the same content as a fallback. */
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
function gallery(g){const box=document.querySelector('.gallery.full');if(!g||!g.items||!box)return;const dlg=document.querySelector('#lightbox');
 g.items.forEach((x,i)=>{if(!x.image)return;const src=String(x.image).replace(/^\//,'');const b=document.createElement('button');b.className='photo';b.setAttribute('aria-label','Enlarge photo '+(i+1));b.dataset.image=src;
  b.innerHTML='<img src="'+esc(src)+'" alt="'+esc(x.caption||'Beach Dawgs & Co. work')+'" loading="lazy">';
  b.addEventListener('click',()=>{if(dlg){dlg.querySelector('img').src=src;dlg.showModal();}});box.prepend(b);});}
Promise.all(['site','packages','faq','gallery'].map(get)).then(r=>{site(r[0]);packages(r[1]);faq(r[2]);gallery(r[3]);});
})();
