/* Visual page editor. Loads only when an owner or manager opens a page with ?edit=1 while signed in to the portal. */
(async function(){
const B=window.__bd;if(!B||!B.PAGE)return;
const SB_URL='https://gxjgqxqcvkfanvydbztv.supabase.co',SB_KEY='sb_publishable_pI_tA_OhNtH4sGaZ8yor-g_b7kKJ2F3';
const $=(t,p,k)=>{const e=document.createElement(t);Object.assign(e,p||{});(k||[]).forEach(x=>e.append(x));return e;};
const css=document.createElement('style');
css.textContent='#bd-ui,#bd-ui *{box-sizing:border-box;font:14px/1.4 system-ui,sans-serif;letter-spacing:0;text-transform:none}#bd-bar{position:fixed;top:0;left:0;right:0;z-index:99999;background:#111;color:#fff;border-bottom:2px solid #ff7900;padding:8px 12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}#bd-bar b{color:#ff7900}#bd-ui button{background:#ff7900;color:#111;border:0;border-radius:99px;padding:8px 16px;font-weight:700;cursor:pointer}#bd-ui button.alt{background:#333;color:#fff}#bd-ui button.danger{background:#7a1f1f;color:#fff}#bd-panel{position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#151515;color:#eee;border-top:2px solid #ff7900;padding:12px;max-height:55vh;overflow:auto;display:none}#bd-panel label{display:block;color:#aaa;font-size:12px;margin:8px 0 3px}#bd-panel textarea,#bd-panel input[type=text],#bd-panel select{width:100%;padding:8px;border-radius:8px;border:1px solid #444;background:#0b0b0b;color:#fff}#bd-panel textarea{min-height:70px}.bd-hover{outline:2px dashed #ff7900!important;outline-offset:2px;cursor:pointer!important}.bd-sel{outline:3px solid #ff7900!important;outline-offset:2px}body{padding-top:56px!important}';
document.head.append(css);
const ui=$('div',{id:'bd-ui'});const bar=$('div',{id:'bd-bar'}),panel=$('div',{id:'bd-panel'});ui.append(bar,panel);document.body.append(ui);
const say=t=>{status.textContent=t;};
const status=$('span',{textContent:'Loading editor...'});bar.append($('b',{textContent:'EDITING PAGE'}),status);
const lib=document.createElement('script');lib.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
await new Promise((ok,no)=>{lib.onload=ok;lib.onerror=no;document.head.append(lib);}).catch(()=>{});
if(!window.supabase){say('Could not load the editor library. Check your connection.');return;}
const sb=window.supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
const{data:{session}}=await sb.auth.getSession();
const exit=$('button',{className:'alt',textContent:'Exit editor',onclick:()=>{location.search='';}});
if(!session){say('Sign in at the portal first (with your two-step code), then reopen this page.');bar.append($('a',{href:'portal/',textContent:'Open portal',style:'color:#ff7900'}),exit);return;}
const{data:acc}=await sb.rpc('beach_my_access');const role=acc&&acc.role;
if(role!=='owner'&&role!=='manager'){say('Only the owner or a manager can edit pages. Sign in to the portal with your two-step code first.');bar.append(exit);return;}
let base={};{const{data}=await sb.from('beach_content').select('data').eq('key','site').maybeSingle();if(data&&data.data)base=data.data;else{try{base=await (await fetch('data/site.json',{cache:'no-cache'})).json();}catch(e){}}}
const slug=B.PAGE;const PE=JSON.parse(JSON.stringify((base.pages&&base.pages[slug])||{}));PE.text=PE.text||{};PE.img=PE.img||{};PE.href=PE.href||{};PE.hide=PE.hide||[];
const ORIG=new Map();let dirty=false,sel=null;
const mark=()=>{dirty=true;save.textContent='Save changes *';};
const save=$('button',{textContent:'Save changes',onclick:async()=>{save.disabled=true;say('Saving...');
 const{data:cur}=await sb.from('beach_content').select('data').eq('key','site').maybeSingle();const site=(cur&&cur.data)||base;
 const pages=Object.assign({},site.pages);pages[slug]=PE;const{error}=await sb.rpc('beach_save_content',{k:'site',d:Object.assign({},site,{pages})});
 if(error)say(error.message);else{dirty=false;save.textContent='Save changes';say('Saved. Live on the site now.');}save.disabled=false;}});
bar.append(save,exit);say('Click any text, photo or link on this page to change it. Changes apply to this page only.');
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
function pick(t){if(t.tagName==='IMG')return{img:t};let best=null;B.IDX.forEach(([e])=>{if(e.contains(t)&&document.body.contains(e))best=e;});return best?{text:best}:null;}
document.addEventListener('mouseover',e=>{if(ui.contains(e.target))return;document.querySelectorAll('.bd-hover').forEach(x=>x.classList.remove('bd-hover'));const p=pick(e.target);const el=p&&(p.img||p.text);if(el)el.classList.add('bd-hover');});
document.addEventListener('click',e=>{if(ui.contains(e.target))return;e.preventDefault();e.stopPropagation();const p=pick(e.target);if(!p){panel.style.display='none';return;}
 if(sel)sel.classList.remove('bd-sel');sel=p.img||p.text;sel.classList.add('bd-sel');p.img?imgPanel(p.img):textPanel(p.text,e.target.closest('a'));},true);
function head(t){panel.innerHTML='';panel.style.display='block';const h=$('div',{style:'display:flex;justify-content:space-between;align-items:center;gap:8px'},[$('b',{textContent:t}),$('button',{className:'alt',textContent:'Close',onclick:()=>{panel.style.display='none';if(sel)sel.classList.remove('bd-sel');}})]);panel.append(h);}
function textPanel(el,a){head('Edit text');const key=(ORIG.get(el)||(ORIG.set(el,B.IDX.find(x=>x[0]===el)[1]),ORIG.get(el)));
 const tx=$('textarea',{value:el.innerHTML.replace(/<br\s*\/?>/gi,'\n').trim()});
 tx.oninput=()=>{const h=B.clean(tx.value.replace(/\n/g,'<br>'));el.innerHTML=h;PE.text[key]=h;mark();};
 panel.append($('label',{textContent:'Text. This applies everywhere this exact text appears on this page. Keep tags like <em>word</em> to keep highlighted words.'}),tx);
 if(a){const orig=B.LINKS.get(a)||a.getAttribute('href');const hi=$('input',{type:'text',value:a.getAttribute('href')});
  hi.oninput=()=>{PE.href[orig]=hi.value.trim();B.LINKS.forEach((k,x)=>{if(k===orig)x.setAttribute('href',hi.value.trim());});mark();};
  panel.append($('label',{textContent:'Link address (where this goes when tapped, for example customs.html or https://...)'}),hi);}
 const hk=B.hideKey(el);if(hk){const cb=$('input',{type:'checkbox',checked:PE.hide.includes(hk)});cb.onchange=()=>{const s=el.closest('section,footer,header');if(cb.checked){if(!PE.hide.includes(hk))PE.hide.push(hk);s.style.opacity='.35';}else{PE.hide=PE.hide.filter(x=>x!==hk);s.style.opacity='';}mark();};
  panel.append($('label',{},[cb,document.createTextNode(' Hide the whole section this belongs to (shown faded here, hidden on the live page)')]));}
 panel.append($('button',{className:'danger',textContent:'Undo my change to this text',style:'margin-top:10px',onclick:()=>{delete PE.text[key];el.innerHTML=key;tx.value=key.replace(/<br\s*\/?>/gi,'\n');mark();}}));}
async function shrink(file){const url=URL.createObjectURL(file);const im=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=url;});const sc=Math.min(1,2000/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*sc);c.height=Math.round(im.height*sc);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(url);return new Promise(ok=>c.toBlob(ok,'image/jpeg',.85));}
async function imgPanel(im){head('Change photo');const key=B.IMGS.get(im)||im.getAttribute('src');const setAll=u=>B.IMGS.forEach((k,x)=>{if(k===key)x.src=u;});
 const f=$('input',{type:'file',accept:'image/jpeg,image/png,image/webp'});
 f.onchange=async()=>{if(!f.files[0])return;say('Uploading photo...');try{const blob=await shrink(f.files[0]);const path='pages/'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.jpg';
  const{error}=await sb.storage.from('site-media').upload(path,blob,{contentType:'image/jpeg'});if(error)throw error;const u=sb.storage.from('site-media').getPublicUrl(path).data.publicUrl;
  PE.img[key]=u;setAll(u);mark();say('Photo changed. Click Save changes to publish it.');}catch(x){say(x.message||'Upload failed');}};
 panel.append($('label',{textContent:'Upload a new photo (this replaces it everywhere this photo appears on this page)'}),f);
 const dvb=$('button',{className:'alt',textContent:'Choose from Google Drive',style:'margin-top:8px',onclick:async()=>{try{say('Opening Google Drive...');if(!window.BDDrive)await new Promise((ok,no)=>{const s=document.createElement('script');s.src='drive.js';s.onload=ok;s.onerror=no;document.head.append(s);});
  const r=await window.BDDrive.pick({root:'',single:true});if(!r[0]){say('');return;}say('Uploading photo...');const blob=await shrink(r[0]);const path='pages/'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.jpg';
  const{error}=await sb.storage.from('site-media').upload(path,blob,{contentType:'image/jpeg'});if(error)throw error;const u=sb.storage.from('site-media').getPublicUrl(path).data.publicUrl;PE.img[key]=u;setAll(u);mark();say('Photo changed. Click Save changes to publish it.');}catch(x){say(x.message||'Drive upload failed');}}});
 panel.append(dvb);
 const{data:g}=await sb.from('beach_content').select('data').eq('key','gallery').maybeSingle();const items=((g&&g.data&&g.data.items)||[]).concat(((g&&g.data&&g.data.library)||[]).map(x=>({image:x.url,caption:(x.folder?x.folder+' / ':'')+(x.name||'Photo')})));
 if(items.length){const sel2=$('select');sel2.append($('option',{value:'',textContent:'Or choose a photo you already uploaded'}));items.forEach(x=>sel2.append($('option',{value:x.image,textContent:x.caption||'Photo'})));
  sel2.onchange=()=>{if(!sel2.value)return;PE.img[key]=sel2.value;setAll(sel2.value);mark();};panel.append($('label',{textContent:'Your uploaded photos'}),sel2);}
 panel.append($('button',{className:'danger',textContent:'Put the original photo back',style:'margin-top:10px',onclick:()=>{delete PE.img[key];setAll(key);mark();}}));}
})();
