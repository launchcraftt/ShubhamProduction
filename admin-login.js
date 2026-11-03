import {initializeApp,deleteApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut,updatePassword,deleteUser,GoogleAuthProvider,linkWithPopup,reauthenticateWithPopup} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,collection,doc,getDoc,addDoc,updateDoc,deleteDoc,onSnapshot,query,where,writeBatch} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ====== Firebase console > Project settings > Your apps > Web app se config yahan paste karo ====== */
const firebaseConfig={apiKey:"AIzaSyDKAU2yXKvGUV6EvO1xrPp2MGP_IpUkYqo",authDomain:"shubhamproduction-540e8.firebaseapp.com",projectId:"shubhamproduction-540e8",storageBucket:"shubhamproduction-540e8.firebasestorage.app",messagingSenderId:"84744399932",appId:"1:84744399932:web:d05e6a0367d2b35d9f6739"};
/* ========================================================================================== */

const $=s=>document.querySelector(s),IDLE=5*60*1000,LAST='sp_last'; // localStorage me sirf login activity time
const ready=!firebaseConfig.apiKey.startsWith('PASTE');
const fbApp=ready?initializeApp(firebaseConfig):null,auth=ready?getAuth(fbApp):null,fs=ready?getFirestore(fbApp):null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inr=n=>'₹'+Number(n||0).toLocaleString('en-IN');
const genPass=()=>Math.random().toString(36).slice(2,6).toUpperCase()+Math.floor(1000+Math.random()*9000);
const em=p=>p.replace(/\D/g,'')+'@client.sp.app';
const toast=m=>{const t=$('#toast');t.textContent=m;t.hidden=false;setTimeout(()=>t.hidden=true,2600)};
/* ====== Apne links yahan badlo ====== */
const SITE={home:'index.html',wedding:'wedding.html',prewedding:'pre-wedding.html',about:'about.html',contact:'contact.html'};
const SOCIAL={instagram:'https://www.instagram.com/',facebook:'https://www.facebook.com/',youtube:'https://www.youtube.com/'};
const WA='https://wa.me/918802389087?text='+encodeURIComponent('Hello Shubham Production, mujhe portal me help chahiye.');
/* ===================================== */
const NAV=[['Home','home'],['Wedding','wedding'],['Pre-Wedding','prewedding'],['About','about'],['Contact','contact']];
const siteHeader=(extra='')=>`<header class="site-header"><a class="logo dark" href="${SITE.home}">Shubham <span>Production</span></a><nav>${NAV.map(n=>`<a href="${SITE[n[1]]}">${n[0]}</a>`).join('')}${extra}</nav></header>`;
const siteFooter=()=>`<footer class="site-footer"><div class="foot-grid"><div><div class="logo">Shubham <span>Production</span></div><p>Wedding aur pre-wedding photography. Aapki kahani, hamari nazar se.</p></div><div><h4>Explore</h4>${NAV.map(n=>`<a href="${SITE[n[1]]}">${n[0]}</a>`).join('')}</div><div><h4>Need help?</h4><p>Login ya project me koi dikkat ho to seedha WhatsApp karein.</p><a class="btn wa" href="${WA}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i>&nbsp; Chat on WhatsApp</a></div><div><h4>Follow us</h4><div class="social">${Object.entries(SOCIAL).map(([k,v])=>`<a href="${v}" target="_blank" rel="noopener" aria-label="${k}"><i class="fa-brands fa-${k}"></i></a>`).join('')}<a href="${WA}" target="_blank" rel="noopener" aria-label="whatsapp"><i class="fa-brands fa-whatsapp"></i></a></div></div></div><div class="foot-bottom">© ${new Date().getFullYear()} Shubham Production. All rights reserved.</div></footer>`;
const waFab=()=>`<a class="wa-fab" href="${WA}" target="_blank" rel="noopener" aria-label="WhatsApp help"><i class="fa-brands fa-whatsapp"></i></a>`;
let me=null,view='home',mode='login',month='',idleT,unsubs=[],setupDone=true,signingUp=false,authErr='';
let db={clients:[],projects:[],events:[],secrets:{},notes:{},self:null};
const cname=id=>(db.clients.find(c=>c.id===id)||{}).name||'—';
const pay=p=>{const t=+p.amount||0,pd=(p.payments||[]).reduce((a,x)=>a+(+x.amount||0),0);return{total:t,paid:pd,due:Math.max(0,t-pd)}};
const nice=e=>/invalid-credential|wrong-password|user-not-found/.test(e.code||'')?'Login ID ya password galat hai.':/email-already/.test(e.code||'')?'Ye account pehle se hai.':/permission/.test(e.message||'')?'Permission nahi hai (Firestore rules check karein).':e.message;

/* ---------- session (Firebase Auth) ---------- */
const touch=()=>localStorage.setItem(LAST,Date.now());
function resetIdle(){if(me?.role!=='admin')return;touch();clearTimeout(idleT);idleT=setTimeout(()=>{signOut(auth);authErr='5 minute inactive rehne se logout ho gaya.'},IDLE)}
['click','keydown','touchstart'].forEach(e=>addEventListener(e,resetIdle,{passive:true}));
const stop=()=>{unsubs.forEach(u=>u());unsubs=[]};
const listen=(q,fn)=>unsubs.push(onSnapshot(q,s=>{fn(s);render()},e=>toast(nice(e))));
async function enter(u){
  stop();db={clients:[],projects:[],events:[],secrets:{},notes:{},self:null};
  if(!u){me=null;clearTimeout(idleT);try{setupDone=(await getDoc(doc(fs,'config','setup'))).exists()}catch{}return render()}
  const a=await getDoc(doc(fs,'admins',u.uid));
  if(a.exists()){
    if(Date.now()-(+localStorage.getItem(LAST)||0)>IDLE){authErr='Session expire ho gaya, dobara login karein.';return signOut(auth)}
    me={role:'admin',uid:u.uid,name:a.data().name};view='home';resetIdle();
    listen(collection(fs,'clients'),s=>db.clients=s.docs.map(d=>({id:d.id,...d.data()})));
    listen(collection(fs,'clientSecrets'),s=>{db.secrets={};s.docs.forEach(d=>{db.secrets[d.id]=d.data().pw;db.notes[d.id]=d.data().note||''})});
    listen(collection(fs,'projects'),s=>db.projects=s.docs.map(d=>({id:d.id,...d.data()})));
    listen(collection(fs,'events'),s=>db.events=s.docs.map(d=>({id:d.id,...d.data()})));
  }else{
    const c=await getDoc(doc(fs,'clients',u.uid));
    if(!c.exists()){authErr='Ye account portal se juda nahi hai.';return signOut(auth)}
    me={role:'client',uid:u.uid,name:c.data().name};
    listen(doc(fs,'clients',u.uid),s=>db.self=s.data());
    listen(query(collection(fs,'projects'),where('clientId','==',u.uid)),s=>db.projects=s.docs.map(d=>({id:d.id,...d.data()})));
    listen(query(collection(fs,'events'),where('clientId','==',u.uid)),s=>db.events=s.docs.map(d=>({id:d.id,...d.data()})));
  }
  render();
}
if(ready)onAuthStateChanged(auth,u=>{if(!signingUp)enter(u)});

/* ---------- login / sign up ---------- */
function authView(){
  const setup=!ready;
  $('#app').innerHTML=`${siteHeader()}<div class="auth"><div class="auth-art"><div><div class="eyebrow">Studio portal</div><h1>Shoots, payments and deliveries, <em>in one place.</em></h1><p>Admin sab manage karta hai. Client apna project, events aur delivery link dekhta hai.</p></div></div>
  <div class="auth-form"><div class="card-auth"><h2>${mode==='login'?'Welcome back':'Create admin account'}</h2>
  <div class="tabs"><button data-m="login" class="${mode==='login'?'on':''}">Login</button>${setupDone?'':`<button data-m="signup" class="${mode==='signup'?'on':''}">Sign up</button>`}</div>
  <form id="af">${mode==='login'?`<label>Email or mobile number</label><input id="id" required autocomplete="username"><label>Password</label><input id="pw" type="password" required autocomplete="current-password">`:`<label>Name</label><input id="nm" required><label>Email</label><input id="id" type="email" required><label>Password (min 6)</label><input id="pw" type="password" minlength="6" required>`}
  <div class="err" id="err">${setup?'Pehle admin-login.js me Firebase config paste karein.':esc(authErr)}</div><button class="btn full" ${setup?'disabled':''}>${mode==='login'?'Login':'Create account'}</button></form>
  <p class="hint">${mode==='login'?'Admin email se, client apne mobile number se login karta hai.':'Ye sirf pehle admin ke liye hai. Uske baad sign up band ho jata hai.'}</p></div></div></div>${siteFooter()}${waFab()}`;
  authErr='';
  document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{mode=b.dataset.m;authView()});
  $('#af').onsubmit=async e=>{e.preventDefault();const id=$('#id').value.trim(),pw=$('#pw').value,err=$('#err');err.textContent='';
    try{
      if(mode==='signup'){
        signingUp=true;touch();const cr=await createUserWithEmailAndPassword(auth,id.toLowerCase(),pw);
        try{const b=writeBatch(fs);b.set(doc(fs,'admins',cr.user.uid),{name:$('#nm').value.trim(),email:id.toLowerCase()});b.set(doc(fs,'config','setup'),{at:Date.now()});await b.commit()}
        catch(x){await deleteUser(cr.user);throw x}
        signingUp=false;setupDone=true;await enter(cr.user);
      }else{touch();await signInWithEmailAndPassword(auth,id.includes('@')?id.toLowerCase():em(id),pw)}
    }catch(x){signingUp=false;err.textContent=nice(x)}
  };
}

/* ---------- modal form ---------- */
function form(title,fields,vals,onSave){
  const m=$('#modal');m.hidden=false;
  m.innerHTML=`<form><h3>${title}</h3>${fields.map(f=>`<label>${f.l}</label>${f.t==='select'?`<select name="${f.k}">${f.o.map(o=>`<option value="${esc(o[0])}" ${String(vals[f.k]??'')===String(o[0])?'selected':''}>${esc(o[1])}</option>`).join('')}</select>`:f.t==='area'?`<textarea name="${f.k}" rows="3">${esc(vals[f.k])}</textarea>`:`<input name="${f.k}" type="${f.t||'text'}" value="${esc(vals[f.k])}" ${f.r?'required':''} ${f.ro?'readonly':''}>`}`).join('')}<div class="acts"><button type="button" class="btn outline" id="cx">Cancel</button><button class="btn">Save</button></div></form>`;
  $('#cx').onclick=()=>m.hidden=true;
  m.querySelector('form').onsubmit=async e=>{e.preventDefault();const btn=e.target.querySelector('.acts .btn:last-child');btn.disabled=true;
    try{await onSave(Object.fromEntries(new FormData(e.target)));m.hidden=true;toast('Saved')}catch(x){toast(nice(x));btn.disabled=false}};
}
async function withSecondary(fn){const a=initializeApp(firebaseConfig,'sec'+Date.now());try{return await fn(getAuth(a))}finally{await signOut(getAuth(a)).catch(()=>{});deleteApp(a)}}
const num=d=>({...d,amount:+d.amount||0,paid:+d.paid||0});

/* ---------- shared helpers ---------- */
const TYPES=['Wedding','Pre-wedding','Engagement','Haldi','Mehendi','Sangeet','Reception','Birthday','Baby shoot','Maternity','Corporate','Fashion','Product','Cinematic film','Other'];
const EST=['Pending','Confirmed','Success','Cancelled'];
const todayS=()=>new Date().toLocaleDateString('en-CA');
let cid=null;
const evSort=(a,b)=>((a.date||'')+(a.time||'')).localeCompare((b.date||'')+(b.time||''));
const pname=id=>(db.projects.find(p=>p.id===id)||{}).title||'—';
const tot=ps=>ps.reduce((a,p)=>{const x=pay(p);a.total+=x.total;a.paid+=x.paid;a.due+=x.due;return a},{total:0,paid:0,due:0});
const pill=(t,w)=>`<span class="pill ${w?'warn':''}">${esc(t)}</span>`;
const btn=(a,id,t)=>`<button class="btn sm outline" data-${a}="${id}">${t}</button>`;
const kv=(k,v)=>v?`<div><small>${k}</small><span>${esc(v)}</span></div>`:'';
const stat=(l,v,d)=>`<div class="stat ${d?'dark':''}"><small>${l}</small><b>${v}</b></div>`;
const bars=rows=>{const m=Math.max(1,...rows.map(r=>r[1]));return rows.map(r=>`<div class="bar-row"><span>${esc(r[0])}</span><div class="track"><i style="width:${r[1]/m*100}%"></i></div><b>${r[1]}</b></div>`).join('')};
const cards=(a,fn,empty)=>a.length?`<div class="cards">${a.map(fn).join('')}</div>`:`<p class="empty">${empty}</p>`;
const projCard=(p,adm)=>{const x=pay(p),pc=x.total?Math.min(100,Math.round(x.paid/x.total*100)):0;
  return`<article class="card"><div class="card-h"><div><h3>${esc(p.title)}</h3><small>${adm?esc(cname(p.clientId))+' · ':''}${esc(p.service)}</small></div>${pill(p.status,p.status==='Ongoing')}</div>${p.details?`<p>${esc(p.details)}</p>`:''}<div class="meta">${kv('Start',p.startDate)}${kv('Delivery by',p.deliveryDate)}${kv('Deliverables',p.deliverables)}</div><div class="prog"><div class="track"><i style="width:${pc}%"></i></div><div class="prog-t"><span>Paid ${inr(x.paid)} of ${inr(x.total)}</span><b>${x.due?'Pending '+inr(x.due):'Clear'}</b></div></div>${adm?`<div class="row-actions">${btn('pp',p.id,'Add payment')}${(p.payments||[]).length?btn('pu',p.id,'Undo last payment'):''}${btn('pe',p.id,'Edit')}${btn('pd',p.id,'Delete')}</div>`:''}</article>`};
const evCard=(e,adm)=>{const d=e.date?new Date(e.date+'T00:00'):null;
  return`<article class="card ev"><div class="date">${d?`<b>${d.getDate()}</b><span>${d.toLocaleString('en-IN',{month:'short'})}</span>`:''}</div><div class="ev-b"><div class="card-h"><div><h3>${esc(e.type)}</h3><small>${adm?esc(cname(e.clientId))+' · ':''}${esc(pname(e.projectId))}</small></div>${pill(e.status,e.status==='Pending')}</div><div class="meta">${kv('Time',[e.time,e.endTime].filter(Boolean).join(' – '))}${kv('Venue',e.place)}${kv('Team',e.team)}${kv('On-site contact',e.contact)}</div>${e.notes?`<p>${esc(e.notes)}</p>`:''}${adm?`<div class="row-actions">${btn('ee',e.id,'Edit')}${btn('ed',e.id,'Delete')}</div>`:''}</div></article>`};
const payLog=ps=>{const r=ps.flatMap(p=>(p.payments||[]).map(x=>({...x,p:p.title}))).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  return r.length?`<table><tr><th>Date</th><th>Project</th><th>Amount</th><th>Mode</th><th>Note</th></tr>${r.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.p)}</td><td>${inr(x.amount)}</td><td>${esc(x.mode)}</td><td>${esc(x.note)}</td></tr>`).join('')}</table>`:'<p class="empty">Abhi koi payment record nahi.</p>'};

/* ---------- admin actions ---------- */
const SERV=['Photography','Videography','Photo + Video','Drone','Photo + Video + Drone','Other'];
const projF=()=>[{k:'title',l:'Project name',r:1},{k:'clientId',l:'Client',t:'select',o:[['','— select —'],...db.clients.map(c=>[c.id,c.name])]},{k:'service',l:'Service',t:'select',o:SERV.map(x=>[x,x])},{k:'details',l:'Details',t:'area'},{k:'deliverables',l:'Deliverables (album, reels, edited photos...)',t:'area'},{k:'startDate',l:'Start date',t:'date'},{k:'deliveryDate',l:'Delivery deadline',t:'date'},{k:'amount',l:'Total amount (₹)',t:'number'},{k:'status',l:'Status',t:'select',o:['Ongoing','Completed'].map(x=>[x,x])}];
const saveP=(d,id)=>{if(!d.clientId)throw Error('Client select karein');const x={...d,amount:+d.amount||0};return id?updateDoc(doc(fs,'projects',id),x):addDoc(collection(fs,'projects'),{...x,payments:[]})};
const addProject=(pre={})=>form('New project',projF(),{status:'Ongoing',service:'Photography',amount:0,...pre},d=>saveP(d));
const editProject=p=>form('Edit project',projF(),p,d=>saveP(d,p.id));
const delProject=async id=>{if(!confirm('Project aur uske events delete honge. Continue?'))return;try{const w=writeBatch(fs);db.events.filter(e=>e.projectId===id).forEach(e=>w.delete(doc(fs,'events',e.id)));w.delete(doc(fs,'projects',id));await w.commit()}catch(x){toast(nice(x))}};
const addPayment=p=>form('Add payment',[{k:'amount',l:'Amount received (₹)',t:'number',r:1},{k:'date',l:'Date',t:'date',r:1},{k:'mode',l:'Mode',t:'select',o:['UPI','Cash','Bank transfer','Cheque','Other'].map(x=>[x,x])},{k:'note',l:'Note'}],{date:todayS(),mode:'UPI'},d=>updateDoc(doc(fs,'projects',p.id),{payments:[...(p.payments||[]),{amount:+d.amount||0,date:d.date,mode:d.mode,note:d.note||''}]}));
const undoPayment=p=>confirm('Last payment hata dein?')&&updateDoc(doc(fs,'projects',p.id),{payments:(p.payments||[]).slice(0,-1)}).catch(x=>toast(nice(x)));
const evF=()=>[{k:'projectId',l:'Project',t:'select',o:[['','— select —'],...db.projects.map(p=>[p.id,`${p.title} (${cname(p.clientId)})`])]},{k:'type',l:'Event type',t:'select',o:TYPES.map(x=>[x,x])},{k:'date',l:'Date',t:'date',r:1},{k:'time',l:'Start time',t:'time'},{k:'endTime',l:'End time',t:'time'},{k:'place',l:'Venue / place'},{k:'contact',l:'On-site contact (name, number)'},{k:'team',l:'Team (names, comma separated)',t:'area'},{k:'notes',l:'Notes for client (dress code, call time...)',t:'area'},{k:'status',l:'Status',t:'select',o:EST.map(x=>[x,x])}];
const saveE=(d,id)=>{const p=db.projects.find(x=>x.id===d.projectId);if(!p)throw Error('Project select karein');const x={...d,clientId:p.clientId};return id?updateDoc(doc(fs,'events',id),x):addDoc(collection(fs,'events'),x)};
const addEvent=(pre={})=>db.projects.length?form('New event',evF(),{type:'Wedding',status:'Pending',...pre},d=>saveE(d)):toast('Pehle ek project banayein');
const editEvent=e=>form('Edit event',evF(),e,d=>saveE(d,e.id));
const delEvent=id=>confirm('Delete this event?')&&deleteDoc(doc(fs,'events',id)).catch(x=>toast(nice(x)));
const CF=ro=>[{k:'name',l:'Client name',r:1},{k:'phone',l:'Login mobile number',r:1,ro},{k:'altPhone',l:'Alternate / WhatsApp number'},{k:'email',l:'Email',t:'email'},{k:'address',l:'Address / city',t:'area'},{k:'link',l:'Data delivery link',t:'url'},{k:'pw',l:'Password (min 6)',r:1},{k:'note',l:'Private note (sirf aapko dikhega)',t:'area'}];
const cData=d=>({name:d.name,altPhone:d.altPhone||'',email:d.email||'',address:d.address||'',link:d.link||''});
const addClient=()=>form('New client',CF(0),{pw:genPass()},async d=>{
  const ph=d.phone.replace(/\D/g,'');if(db.clients.some(c=>c.phone===ph))throw Error('Ye number pehle se hai');
  const uid=await withSecondary(async a=>(await createUserWithEmailAndPassword(a,em(ph),d.pw)).user.uid);
  const b=writeBatch(fs);b.set(doc(fs,'clients',uid),{...cData(d),phone:ph,verified:false});b.set(doc(fs,'clientSecrets',uid),{pw:d.pw,note:d.note||''});await b.commit()});
const editClient=c=>{const old=db.secrets[c.id];form('Edit client',CF(1),{...c,pw:old,note:db.notes[c.id]},async d=>{
  if(d.pw!==old)await withSecondary(async a=>{const u=await signInWithEmailAndPassword(a,em(c.phone),old);await updatePassword(u.user,d.pw)});
  await updateDoc(doc(fs,'clientSecrets',c.id),{pw:d.pw,note:d.note||''});await updateDoc(doc(fs,'clients',c.id),cData(d))})};
const delClient=async c=>{if(!confirm('Client, uske projects aur events delete honge. Continue?'))return;
  try{await withSecondary(async a=>{const u=await signInWithEmailAndPassword(a,em(c.phone),db.secrets[c.id]);await deleteUser(u.user)}).catch(()=>{});
    const w=writeBatch(fs);db.projects.filter(p=>p.clientId===c.id).forEach(p=>w.delete(doc(fs,'projects',p.id)));db.events.filter(e=>e.clientId===c.id).forEach(e=>w.delete(doc(fs,'events',e.id)));w.delete(doc(fs,'clients',c.id));w.delete(doc(fs,'clientSecrets',c.id));await w.commit();view='clients'}catch(x){toast(nice(x))}};
function wire(){
  const on=(a,fn)=>document.querySelectorAll(`[data-${a}]`).forEach(b=>b.onclick=e=>{e.preventDefault();fn(b.dataset[a])});
  const P=id=>db.projects.find(x=>x.id===id);
  on('pe',id=>editProject(P(id)));on('pd',delProject);on('pp',id=>addPayment(P(id)));on('pu',id=>undoPayment(P(id)));
  on('ee',id=>editEvent(db.events.find(x=>x.id===id)));on('ed',delEvent);
  on('co',id=>{cid=id;view='client';render()});
  on('ce',id=>editClient(db.clients.find(x=>x.id===id)));on('cd',id=>delClient(db.clients.find(x=>x.id===id)));
}

/* ---------- admin views ---------- */
function adminView(){
  const nav=[['home','Home'],['projects','Projects'],['events','Events'],['clients','Clients']];
  $('#app').innerHTML=`<div class="shell"><aside class="side"><div class="logo">Shubham <span>Production</span></div>${nav.map(n=>`<button class="${view===n[0]||(view==='client'&&n[0]==='clients')?'on':''}" data-v="${n[0]}">${n[1]}</button>`).join('')}<a class="sidelink" href="${SITE.home}">View website</a><div class="grow"></div><button id="lo">Logout</button></aside><div class="col"><div class="bar"><span class="who">${esc(me.name)}</span></div><main id="main"></main></div></div>`;
  document.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{view=b.dataset.v;render()});
  $('#lo').onclick=()=>signOut(auth);
  ({home,projects,events,clients,client:clientPage})[view]();wire();
}
function home(){
  const t=tot(db.projects),td=todayS(),ym=td.slice(0,7);
  const up=db.events.filter(e=>e.date>=td&&e.status!=='Cancelled').sort(evSort);
  const ms=[...Array(6)].map((_,i)=>{const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-5+i);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')});
  const due={};db.projects.forEach(p=>{const x=pay(p).due;if(x)due[p.clientId]=(due[p.clientId]||0)+x});
  const dl=Object.entries(due).sort((a,b)=>b[1]-a[1]).slice(0,5),ty=TYPES.map(s=>[s,db.events.filter(e=>e.type===s).length]).filter(r=>r[1]).sort((a,b)=>b[1]-a[1]).slice(0,6);
  $('#main').innerHTML=`<div class="top"><h1>Home</h1></div><div class="stats">${stat('Clients',db.clients.length,1)}${stat('Projects',db.projects.length)}${stat('Events this month',db.events.filter(e=>(e.date||'').startsWith(ym)).length)}${stat('Upcoming events',up.length)}${stat('Total billed',inr(t.total))}${stat('Received',inr(t.paid))}${stat('Payment pending',inr(t.due),1)}${stat('Collection rate',(t.total?Math.round(t.paid/t.total*100):0)+'%')}</div>
  <div class="grid2"><div class="panel"><h3>Events per month</h3>${bars(ms.map(m=>[m,db.events.filter(e=>(e.date||'').startsWith(m)).length]))}</div><div class="panel"><h3>Events by status</h3>${bars(EST.map(s=>[s,db.events.filter(e=>e.status===s).length]))}</div></div>
  <div class="grid2"><div class="panel"><h3>Top pending payments</h3>${dl.length?`<table style="min-width:0">${dl.map(r=>`<tr><td><a href="#" data-co="${r[0]}">${esc(cname(r[0]))}</a></td><td>${pill(inr(r[1]),1)}</td></tr>`).join('')}</table>`:'<p class="empty">Koi payment pending nahi.</p>'}</div><div class="panel"><h3>Events by type</h3>${ty.length?bars(ty):'<p class="empty">Events add karne par yahan dikhenge.</p>'}</div></div>
  <h3 class="sec">Upcoming events</h3>${cards(up.slice(0,6),e=>evCard(e,1),'Koi upcoming event nahi.')}`;
}
function projects(){
  $('#main').innerHTML=`<div class="top"><h1>Projects</h1><button class="btn" id="add">Add project</button></div>${cards(db.projects,p=>projCard(p,1),'Abhi koi project nahi. Add project dabayein.')}`;
  $('#add').onclick=()=>addProject();
}
function events(){
  const list=db.events.filter(e=>!month||(e.date||'').startsWith(month)).sort(evSort);
  $('#main').innerHTML=`<div class="top"><h1>Events</h1><div class="filter"><input type="month" id="mf" value="${month}"><button class="btn" id="add">Add event</button></div></div>${cards(list,e=>evCard(e,1),'Is month me koi event nahi.')}`;
  $('#mf').onchange=e=>{month=e.target.value;render()};$('#add').onclick=()=>addEvent();
}
function clients(){
  $('#main').innerHTML=`<div class="top"><h1>Clients</h1><button class="btn" id="add">Add client</button></div><div class="panel">${db.clients.length?`<table><tr><th>Name</th><th>Login number</th><th>Password</th><th>Verification</th><th>Projects</th><th>Pending</th><th></th></tr>${db.clients.map(c=>`<tr><td><a href="#" data-co="${c.id}">${esc(c.name)}</a></td><td>${esc(c.phone)}</td><td>${esc(db.secrets[c.id])}</td><td>${c.verified?pill('Verified'):pill('Pending',1)}${c.googleEmail?`<br><small>${esc(c.googleEmail)}</small>`:''}</td><td>${db.projects.filter(p=>p.clientId===c.id).length}</td><td>${inr(tot(db.projects.filter(p=>p.clientId===c.id)).due)}</td><td><div class="row-actions">${btn('co',c.id,'Open')}${btn('cd',c.id,'Delete')}</div></td></tr>`).join('')}</table>`:'<p class="empty">Abhi koi client nahi. Add client dabayein, number dein, password auto-generate hoga.</p>'}</div>`;
  $('#add').onclick=addClient;
}
function clientPage(){
  const c=db.clients.find(x=>x.id===cid);if(!c){view='clients';return render()}
  const ps=db.projects.filter(p=>p.clientId===c.id),es=db.events.filter(e=>e.clientId===c.id).sort(evSort),t=tot(ps);
  $('#main').innerHTML=`<button class="btn sm outline" id="bk">← All clients</button><div class="top" style="margin-top:16px"><div class="who-box"><div class="avatar">${esc(c.name.trim().slice(0,1).toUpperCase())}</div><div><h1>${esc(c.name)}</h1><p>${c.verified?pill('Verified'):pill('Verification pending',1)}</p></div></div><div class="row-actions">${btn('ce',c.id,'Edit client')}${c.verified?'<button class="btn sm outline" id="rv">Ask to re-verify</button>':''}${btn('cd',c.id,'Delete client')}</div></div>
  <div class="stats">${stat('Projects',ps.length,1)}${stat('Billed',inr(t.total))}${stat('Paid',inr(t.paid))}${stat('Pending',inr(t.due),1)}</div>
  <div class="panel"><h3>Client details</h3><div class="kvs">${kv('Login number',c.phone)}${kv('Password',db.secrets[c.id])}${kv('Alternate / WhatsApp',c.altPhone)}${kv('Email',c.email)}${kv('Address',c.address)}${kv('Verified Google account',c.googleEmail)}${kv('Verified on',c.verifiedAt?new Date(c.verifiedAt).toLocaleDateString('en-IN'):'')}${c.link?`<div><small>Delivery link</small><a href="${esc(c.link)}" target="_blank" rel="noopener">Open link</a></div>`:''}${kv('Private note',db.notes[c.id])}</div></div>
  <div class="top sec"><h3>Projects</h3><button class="btn sm" id="ap">Add project</button></div>${cards(ps,p=>projCard(p,1),'Is client ka koi project nahi.')}
  <div class="top sec"><h3>Events</h3><button class="btn sm" id="ae">Add event</button></div>${cards(es,e=>evCard(e,1),'Koi event nahi.')}
  <div class="panel" style="margin-top:22px"><h3>Payment history</h3>${payLog(ps)}</div>`;
  $('#bk').onclick=()=>{view='clients';render()};
  $('#ap').onclick=()=>addProject({clientId:c.id});$('#ae').onclick=()=>addEvent({projectId:ps[0]?.id||''});
  const rv=$('#rv');if(rv)rv.onclick=()=>updateDoc(doc(fs,'clients',c.id),{verified:false}).then(()=>toast('Client ko dobara verify karna hoga')).catch(x=>toast(nice(x)));
}

/* ---------- client panel (view only) + Google verification ---------- */
function verifyView(){
  const c=db.self;
  $('#app').innerHTML=`${siteHeader('<button class="btn sm" id="lo">Logout</button>')}<div class="auth"><div class="auth-art"><div><div class="eyebrow">One-time check</div><h1>Confirm it's really you.</h1><p>Ek baar apne Google account se verify karein. Isse pakka hota hai ki ye login sirf aap use kar rahe hain.</p></div></div><div class="auth-form"><div class="card-auth"><h2>Verify your account</h2><p style="margin-top:8px">Mobile: <b>${esc(c.phone)}</b></p><div class="err" id="err"></div><button class="btn full" id="gv"><i class="fa-brands fa-google"></i>&nbsp; Verify with Google</button><p class="hint">Aapka Google password hume nahi milta. Sirf email confirm hota hai.</p></div></div></div>${siteFooter()}${waFab()}`;
  $('#lo').onclick=()=>signOut(auth);
  $('#gv').onclick=async()=>{const u=auth.currentUser,pr=new GoogleAuthProvider();
    try{const linked=u.providerData.some(p=>p.providerId==='google.com');
      const r=linked?await reauthenticateWithPopup(u,pr):await linkWithPopup(u,pr);
      await u.getIdToken(true);
      const g=r.user.providerData.find(p=>p.providerId==='google.com');
      await updateDoc(doc(fs,'clients',me.uid),{verified:true,verifiedAt:Date.now(),googleEmail:g?g.email:''});
    }catch(x){const k=x.code||'';$('#err').textContent=/credential-already-in-use/.test(k)?'Ye Google account kisi aur client se juda hai.':/user-mismatch/.test(k)?'Wahi Google account use karein jo pehle verify kiya tha.':/popup/.test(k)?'Popup band hua ya block ho gaya. Dobara try karein.':nice(x)}};
}
function clientView(){
  const c=db.self;if(!c)return $('#app').innerHTML='<p style="padding:40px">Loading…</p>';
  if(!c.verified)return verifyView();
  const ps=db.projects,es=[...db.events].sort(evSort),t=tot(ps);
  $('#app').innerHTML=`${siteHeader('<button class="btn sm" id="lo">Logout</button>')}<main class="cmain"><div class="top"><div class="who-box"><div class="avatar">${esc(c.name.trim().slice(0,1).toUpperCase())}</div><div><div class="eyebrow" style="margin:0">Client portal</div><h1>Hello, ${esc(c.name)}</h1></div></div></div>
  <div class="stats">${stat('Projects',ps.length,1)}${stat('Total',inr(t.total))}${stat('Paid',inr(t.paid))}${stat('Pending',inr(t.due),1)}</div>
  <div class="panel"><h3>Your photos & videos</h3>${c.link?`<a class="btn" href="${esc(c.link)}" target="_blank" rel="noopener">Open delivery link</a>`:'<p class="empty">Link abhi ready nahi hai. Delivery hote hi yahan dikhega.</p>'}</div>
  <h3 class="sec">Your projects</h3>${cards(ps,p=>projCard(p,0),'Aapka project abhi add nahi hua hai.')}
  <h3 class="sec">Your events</h3>${cards(es,e=>evCard(e,0),'Abhi koi event nahi.')}
  <div class="panel" style="margin-top:26px"><h3>Payment history</h3>${payLog(ps)}</div></main>${siteFooter()}${waFab()}`;
  $('#lo').onclick=()=>signOut(auth);
}
function render(){if(!me)authView();else if(me.role==='admin')adminView();else clientView()}
if(!ready)render();
