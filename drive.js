/* Google Drive photo picker (Google Picker API). Needs data/google.json with {"clientId","apiKey"}. Read-only Drive permission enables thumbnails; this page imports only selected photos. */
window.BDDrive=(function(){
const load=src=>new Promise((ok,no)=>{if(document.querySelector('script[src="'+src+'"]'))return ok();const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=()=>no(new Error('Could not load Google. Check your connection or ad blocker.'));document.head.append(s);});
let cfgP=null;
function config(root){if(!cfgP)cfgP=fetch(root+'data/google.json',{cache:'no-cache'}).then(r=>r.ok?r.json():{}).catch(()=>({}));return cfgP;}
async function pick(opts){const root=(opts&&opts.root)||'',multi=!(opts&&opts.single);const c=await config(root);
 if(!c.clientId||!c.apiKey)throw new Error('Google Drive is not set up yet. Ask Claude to finish the Google Drive connection.');
 await Promise.all([load('https://accounts.google.com/gsi/client'),load('https://apis.google.com/js/api.js')]);
 await new Promise(ok=>gapi.load('picker',ok));
 const scope='https://www.googleapis.com/auth/drive.readonly';
 const token=await new Promise((ok,no)=>{const t=google.accounts.oauth2.initTokenClient({client_id:c.clientId,scope,include_granted_scopes:false,callback:r=>{
  if(!r.access_token)return no(new Error(r.error_description||r.error||'Google sign-in was cancelled.'));
  if(!google.accounts.oauth2.hasGrantedAllScopes(r,scope))return no(new Error('Photo previews need Google Drive read access. Choose Google Drive again and allow viewing and downloading your files, or upload from your computer.'));
  ok(r.access_token);
 },error_callback:e=>no(new Error(e&&e.message||'Google sign-in was cancelled.'))});t.requestAccessToken({prompt:''});});
 // Google requires drive.readonly (or full Drive access) for thumbnails before selection.
 const docs=await new Promise(ok=>{const v=new google.picker.DocsView(google.picker.ViewId.DOCS_IMAGES).setMode(google.picker.DocsViewMode.GRID).setIncludeFolders(true).setMimeTypes('image/jpeg,image/png,image/webp');
  const b=new google.picker.PickerBuilder().addView(v).setOAuthToken(token).setDeveloperKey(c.apiKey).setAppId(String(c.clientId).split('-')[0]).setTitle('Choose photos from Google Drive').setCallback(d=>{if(d.action==='picked')ok(d.docs);else if(d.action==='cancel')ok([]);});
  if(multi)b.enableFeature(google.picker.Feature.MULTISELECT_ENABLED);b.build().setVisible(true);});
 const out=[];for(const d of docs){const r=await fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(d.id)+'?alt=media',{headers:{Authorization:'Bearer '+token}});
  if(!r.ok)throw new Error('Could not read "'+d.name+'" from Drive.');const blob=await r.blob();blob.name=d.name;out.push(blob);}
 return out;}
// Google's upload view handles large videos, progress and folder selection.
// Uploads use per-file access; no token or video is stored by this website.
async function uploadVideos(opts){
 const c=await config((opts&&opts.root)||'');
 if(!c.clientId||!c.apiKey)throw new Error('Google Drive is not configured.');
 await Promise.all([load('https://accounts.google.com/gsi/client'),load('https://apis.google.com/js/api.js')]);
 await new Promise(ok=>gapi.load('picker',ok));
 const scope='https://www.googleapis.com/auth/drive.file';
 const token=await new Promise((ok,no)=>{
  const client=google.accounts.oauth2.initTokenClient({client_id:c.clientId,scope,include_granted_scopes:false,
   callback:r=>{if(!r.access_token||!google.accounts.oauth2.hasGrantedAllScopes(r,scope))return no(new Error('Allow access to the files you upload to continue.'));ok(r.access_token);},
   error_callback:()=>no(new Error('Google sign-in was closed or blocked. Allow the Google popup and try again.'))});
  client.requestAccessToken({prompt:''});
 });
 return new Promise((ok,no)=>{
  const picker=new google.picker.PickerBuilder()
   .addView(new google.picker.DocsUploadView().setIncludeFolders(true))
   .setOAuthToken(token).setDeveloperKey(c.apiKey).setAppId(String(c.clientId).split('-')[0])
   .setOrigin(window.location.origin).setTitle('Upload videos to Google Drive')
   .setCallback(d=>{
    if(d.action==='cancel'){picker.dispose();ok([]);}
    else if(d.action==='picked'){
     picker.dispose();
     // Read back completed files before reporting success. Do not change sharing.
     Promise.all((d.docs||[]).map(async doc=>{
      const r=await fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(doc.id)+'?fields=id,name,mimeType,webViewLink&supportsAllDrives=true',{headers:{Authorization:'Bearer '+token}});
      if(!r.ok)throw new Error('Google may have uploaded your file, but confirmation failed. Check Drive before trying again.');
      return r.json();
     })).then(ok,no);
    }
   }).build();
  picker.setVisible(true);
 });
}
return{pick,uploadVideos};})();

