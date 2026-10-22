/* Google Drive photo picker (Google Picker API). Needs data/google.json with {"clientId","apiKey"}. Only files the user picks are shared with this page. */
window.BDDrive=(function(){
const load=src=>new Promise((ok,no)=>{if(document.querySelector('script[src="'+src+'"]'))return ok();const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>no(new Error('Could not load Google. Check your connection or ad blocker.'));document.head.append(s);});
let cfgP=null;
function config(root){if(!cfgP)cfgP=fetch(root+'data/google.json',{cache:'no-cache'}).then(r=>r.ok?r.json():{}).catch(()=>({}));return cfgP;}
async function pick(opts){const root=(opts&&opts.root)||'',multi=!(opts&&opts.single);const c=await config(root);
 if(!c.clientId||!c.apiKey)throw new Error('Google Drive is not set up yet. Ask Claude to finish the Google Drive connection.');
 await Promise.all([load('https://accounts.google.com/gsi/client'),load('https://apis.google.com/js/api.js')]);
 await new Promise(ok=>gapi.load('picker',ok));
 const token=await new Promise((ok,no)=>{const t=google.accounts.oauth2.initTokenClient({client_id:c.clientId,scope:'https://www.googleapis.com/auth/drive.file',callback:r=>r.access_token?ok(r.access_token):no(new Error(r.error_description||r.error||'Google sign-in was cancelled.')),error_callback:e=>no(new Error(e&&e.message||'Google sign-in was cancelled.'))});t.requestAccessToken({prompt:''});});
 const docs=await new Promise(ok=>{const v=new google.picker.DocsView(google.picker.ViewId.DOCS_IMAGES).setIncludeFolders(true).setMimeTypes('image/jpeg,image/png,image/webp');
  const b=new google.picker.PickerBuilder().addView(v).setOAuthToken(token).setDeveloperKey(c.apiKey).setAppId(String(c.clientId).split('-')[0]).setTitle('Choose photos from Google Drive').setCallback(d=>{if(d.action==='picked')ok(d.docs);else if(d.action==='cancel')ok([]);});
  if(multi)b.enableFeature(google.picker.Feature.MULTISELECT_ENABLED);b.build().setVisible(true);});
 const out=[];for(const d of docs){const r=await fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(d.id)+'?alt=media',{headers:{Authorization:'Bearer '+token}});
  if(!r.ok)throw new Error('Could not read "'+d.name+'" from Drive.');const blob=await r.blob();blob.name=d.name;out.push(blob);}
 return out;}
return{pick};})();
