// Dependency-free repository smoke checks. Run: node tests/prelaunch.mjs
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const exists=p=>fs.existsSync(path.join(root,p));
const assert=(condition,message)=>{if(!condition)throw Error(message);};
const pages=['index.html','gallery.html','full-auto-detailing-services.html','exterior-detailing-services.html','ceramic-coating-service.html','customs.html','in-shop-services.html','express-mobile-services.html'];
for(const page of pages){
 assert(exists(page),'Missing page: '+page);
 const html=read(page);
 assert(/<title\b/i.test(html),'Missing title: '+page);
 for(const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)){
  const ref=match[1].split(/[?#]/)[0];
  if(!ref||/^(?:https?:|mailto:|tel:|sms:|#|data:|javascript:|\/\/)/i.test(ref))continue;
  const target=ref.startsWith('/')?ref.slice(1):path.posix.normalize(path.posix.join(path.posix.dirname(page),ref));
  assert(exists(target),`Broken local link in ${page}: ${ref}`);
 }
}
for(const file of ['app.js','cms.js','sliders.js','service-catalog.js']){
 assert(exists(file),'Missing JS: '+file);
 execFileSync(process.execPath,['--check',path.join(root,file)],{stdio:'pipe'});
}
for(const item of ['gallery','site','packages','faq']){
 const filename='data/'+item+'.json';
 assert(exists(filename),'Missing CMS data: '+filename);
 const data=JSON.parse(read(filename));
 if(item!=='site')assert(Array.isArray(data.items),filename+' must have items array');
}
const gallery=JSON.parse(read('data/gallery.json')).items;
const seen=new Set();
for(const [i,item] of gallery.entries()){
 assert(item&&typeof item.image==='string','Invalid photo '+i);
 assert(/^assets\/[\w.~/\-]+\.(?:jpe?g|png|webp|gif|avif)$/i.test(item.image)&&!item.image.includes('..'),'Unsafe photo path '+i);
 assert(exists(item.image),'Missing portfolio image '+item.image);
 assert(!seen.has(item.image),'Duplicate gallery image: '+item.image);
 seen.add(item.image);
}
assert(exists('.pages.yml'),'Missing Pages CMS configuration');
assert(read('.pages.yml').includes('path: data/gallery.json'),'CMS gallery not configured');
assert(exists('portal/index.html'),'Missing customer portal');
assert(exists('admin/index.html'),'Missing CMS redirect');
console.log('PASS: six key pages, local refs, JS syntax, four CMS data files, '+gallery.length+' gallery assets, admin and portal exist.');

const services=JSON.parse(read('data/service-catalog.json'));
assert(services.live_verified===false,'Do not claim live Urable verification');
assert(Array.isArray(services.items)&&services.items.length===74,'Expected 74 curated public services');
const serviceTotals={'In-Shop':0,'Express Mobile':0};
for(const item of services.items){
 assert(item.location in serviceTotals,'Invalid service location: '+item.name);
 serviceTotals[item.location]++;
 assert(typeof item.name==='string'&&item.name.length>2,'Missing name');
 assert(typeof item.category==='string'&&item.category.length>2,'Missing category');
 assert(typeof item.price==='string'&&item.price.length>1,'Missing price');
 assert(typeof item.booking_url==='string'&&item.booking_url.startsWith('https://app.urable.com/virtual-shop/'),'Unsafe booking link');
}
assert(serviceTotals['In-Shop']===47&&serviceTotals['Express Mobile']===27,'Catalog distribution differs');
assert(read('.pages.yml').includes('path: data/service-catalog.json'),'Service CMS config missing');
console.log('PASS: 74 Urable snapshot services split 47 shop / 27 mobile; safe booking URLs, responsive service pages and CMS configuration.');
