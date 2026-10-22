/* Beach Dawgs service catalog: one editable website data file, Urable remains booking authority. */
(()=>{'use strict';
const mount=document.querySelector('[data-service-location]');
if(!mount)return;
const location=mount.dataset.serviceLocation;
const status=document.getElementById('catalog-status');
const groupsEl=document.getElementById('catalog-groups');
const search=document.getElementById('catalog-search');
const count=document.getElementById('catalog-count');
const bookingOrigin='https://app.urable.com/';
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const node=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
function validBooking(raw){
 try{
  const u=new URL(raw);
  return u.protocol==='https:'&&u.origin===bookingOrigin.slice(0,-1)&&u.pathname.startsWith('/virtual-shop/')?u.href:null;
 }catch{return null;}
}
function createCard(service){
 const a=node('article','catalog-card');
 const heading=node('h3','catalog-card-title',service.name);
 const price=node('p','catalog-price',service.price||'Request a quote');
 const desc=node('p','catalog-desc',service.description||'Service availability, inclusions and vehicle-size options are confirmed in Urable.');
 const link=node('a','btn catalog-book','View in Urable ↗');
 const href=validBooking(service.booking_url);
 if(href){link.href=href;link.target='_blank';link.rel='noopener noreferrer';}
 else{link.href='https://app.urable.com/virtual-shop/4JiKIDotPBi6kMyy9gSX/gXfg1vwW5TaIhWV62jeO?jobType=shop';link.target='_blank';link.rel='noopener noreferrer';}
 link.setAttribute('aria-label','View '+service.name+' in Urable');
 a.append(heading,price,desc,link);return a;
}
function render(items,term=''){
 groupsEl.replaceChildren();
 const query=term.trim().toLocaleLowerCase();
 const selected=items.filter(x=>x.location===location&&(x.name+' '+x.category+' '+(x.description||'')).toLocaleLowerCase().includes(query));
 const byGroup=new Map();
 for(const svc of selected){if(!byGroup.has(svc.category))byGroup.set(svc.category,[]);byGroup.get(svc.category).push(svc);}
 for(const [cat,entries] of byGroup){
  const group=node('section','catalog-group');
  group.id=slug(cat);
  const top=node('div','catalog-group-head');
  top.append(node('h2','catalog-group-title',cat),node('span','catalog-group-count',entries.length+' services'));
  const grid=node('div','catalog-cards');
  entries.forEach(x=>grid.appendChild(createCard(x)));
  group.append(top,grid);groupsEl.appendChild(group);
 }
 if(count)count.textContent=selected.length+' services';
 if(!selected.length)groupsEl.append(node('p','catalog-empty','No matching services. Try a different search term.'));
}
fetch('data/service-catalog.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('catalog unavailable');return r.json();}).then(data=>{
 if(!data||!Array.isArray(data.items))throw Error('invalid catalog');
 const entries=data.items.filter(x=>x&&typeof x.name==='string'&&typeof x.category==='string'&&typeof x.location==='string');
 render(entries);
 search?.addEventListener('input',()=>render(entries,search.value));
 status.textContent='Website services are based on the October 19, 2026 Urable catalog snapshot. Final pricing, service availability, and location are confirmed in Urable when booking.';
}).catch(()=>{
 status.textContent='Service list is temporarily unavailable. Please use the Urable booking button or call (252) 933-7311.';
 if(search)search.disabled=true;
});
})();