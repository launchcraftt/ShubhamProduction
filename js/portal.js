/* =========================================================
   SHUBHAM PRODUCTION — Client, Staff & Admin Portal (login.html)
   login screen -> client portal / staff portal / admin dashboard
   v2: completed events, staff project-wise payments, activity log
   ========================================================= */
import {initializeApp,deleteApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut,updatePassword,deleteUser,GoogleAuthProvider,linkWithPopup,reauthenticateWithPopup,setPersistence,browserSessionPersistence,browserLocalPersistence} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,collection,doc,getDoc,setDoc,addDoc,updateDoc,deleteDoc,onSnapshot,query,where,writeBatch,orderBy,limit,arrayUnion,arrayRemove,deleteField} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ====== Firebase config ====== */
const firebaseConfig={apiKey:"AIzaSyDKAU2yXKvGUV6EvO1xrPp2MGP_IpUkYqo",authDomain:"shubhamproduction-540e8.firebaseapp.com",projectId:"shubhamproduction-540e8",storageBucket:"shubhamproduction-540e8.firebasestorage.app",messagingSenderId:"84744399932",appId:"1:84744399932:web:d05e6a0367d2b35d9f6739"};
/* ============================= */

/* ====== GOOGLE REVIEW LINK ====== */
const REVIEW_URL='https://g.page/r/PASTE_YOUR_REVIEW_LINK/review';
/* ================================ */

const $=s=>document.querySelector(s),IDLE=5*60*1000,LAST='sp_last';
const ready=!firebaseConfig.apiKey.startsWith('PASTE');
const fbApp=ready?initializeApp(firebaseConfig):null,auth=ready?getAuth(fbApp):null,fs=ready?getFirestore(fbApp):null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inr=n=>'₹'+Number(n||0).toLocaleString('en-IN');
const genPass=()=>Math.random().toString(36).slice(2,6).toUpperCase()+Math.floor(1000+Math.random()*9000);
const em=p=>p.replace(/\D/g,'')+'@client.sp.app';      // client login id
const emS=p=>p.replace(/\D/g,'')+'@staff.sp.app';      // staff login id
const toast=m=>{const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2800)};
const WA_NUMBER='918802389087';
const WA='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent('Hello Shubham Production, I need help with the client portal.');
const PAGE=location.href.split('#')[0].split('?')[0];
const reviewHref=REVIEW_URL.includes('PASTE')?'https://www.google.com/search?q='+encodeURIComponent('Shubham Production Faridabad reviews'):REVIEW_URL;
const REVIEW_TIPS=[
  'Shubham Production captured our wedding beautifully. The team was friendly, punctual and never made us feel awkward in front of the camera. Every emotion is there in our photos — highly recommended!',
  'Loved our pre-wedding shoot and the final delivery. The photos were edited with great detail and delivered on time. Thank you Shubham Production for making our memories timeless.'
];
const copyText=(t,msg)=>(navigator.clipboard?navigator.clipboard.writeText(String(t)):Promise.reject()).then(()=>toast(msg||'Copied')).catch(()=>toast('Could not copy. Please select the text and copy it.'));
const waLink=(num,text)=>{const d=String(num||'').replace(/\D/g,'');return 'https://wa.me/'+(d.length===10?'91'+d:d)+(text?'?text='+encodeURIComponent(text):'')};

let me=null,view='home',mode='login',month='',idleT,unsubs=[],setupDone=true,signingUp=false,authErr='',navOpen=false,q='',sid=null,draft='',syncT;
const blank=()=>({clients:[],projects:[],events:[],deliveries:[],staff:[],reqs:[],staffPay:[],spAmt:{},activity:[],secrets:{},ssecrets:{},notes:{},self:null,studio:null});
let db=blank();
const cname=id=>(db.clients.find(c=>c.id===id)||{}).name||'—';
const pay=p=>{const t=+p.amount||0,pd=(p.payments||[]).reduce((a,x)=>a+(+x.amount||0),0);return{total:t,paid:pd,due:Math.max(0,t-pd)}};
const nice=e=>/invalid-credential|wrong-password|user-not-found/.test(e.code||'')?'Incorrect login ID or password.':/email-already/.test(e.code||'')?'This account already exists.':/too-many-requests/.test(e.code||'')?'Too many attempts. Please wait a few minutes and try again.':/network/.test(e.code||'')?'Network problem. Check your connection and try again.':/permission/.test(e.message||'')?'Permission denied. Please check the Firestore rules.':e.message;

/* ---------- 12-hour time helpers ---------- */
const fmt12=t=>{if(!t)return'';const[h,m]=String(t).split(':').map(Number);if(isNaN(h))return'';return(h%12||12)+':'+String(m||0).padStart(2,'0')+' '+(h<12?'AM':'PM')};
const fmtDay=d=>d?new Date(d+'T00:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'}):'No date';
const fmtAt=t=>t?new Date(t).toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit',hour12:true}):'';
const t12wire=w=>{w.onchange=()=>{const[h,mi,a]=[...w.querySelectorAll('select')].map(s=>s.value);w.querySelector('input').value=h?String(+h%12+(a==='PM'?12:0)).padStart(2,'0')+':'+mi:''}};
const t12Html=(k,v)=>{let h='',mi='00',a='AM';
  if(v){const[H,M]=String(v).split(':').map(Number);h=String(H%12||12);mi=String(M||0).padStart(2,'0');a=H<12?'AM':'PM'}
  const mins=[...new Set([...Array(12)].map((_,i)=>String(i*5).padStart(2,'0')).concat(mi))].sort();
  return`<div class="t12"><input type="hidden" name="${k}" value="${esc(v||'')}"><select aria-label="Hour"><option value="">--</option>${[...Array(12)].map((_,i)=>`<option ${String(i+1)===h?'selected':''}>${i+1}</option>`).join('')}</select><span>:</span><select aria-label="Minute">${mins.map(x=>`<option ${x===mi?'selected':''}>${x}</option>`).join('')}</select><select aria-label="AM or PM">${['AM','PM'].map(x=>`<option ${x===a?'selected':''}>${x}</option>`).join('')}</select></div>`};

/* ---------- session ---------- */
const touch=()=>localStorage.setItem(LAST,Date.now());
let lastTouch=0;
function resetIdle(){
  if(me?.role!=='admin')return;
  const n=Date.now();if(n-lastTouch>1000){lastTouch=n;touch()}
  clearTimeout(idleT);idleT=setTimeout(()=>{authErr='You were logged out after 5 minutes of inactivity.';signOut(auth)},IDLE)
}
['click','keydown','touchstart','mousemove','scroll'].forEach(e=>addEventListener(e,resetIdle,{passive:true}));
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&me?.role==='admin'&&Date.now()-(+localStorage.getItem(LAST)||0)>IDLE){authErr='You were logged out after 5 minutes of inactivity.';signOut(auth)}});
const stop=()=>{unsubs.forEach(u=>u());unsubs=[]};
const listen=(q,fn)=>unsubs.push(onSnapshot(q,s=>{fn(s);render()},e=>toast(nice(e))));
const mapDocs=s=>s.docs.map(d=>({id:d.id,...d.data()}));

/* Events carry client name, project title and the staff who may see them,
   so staff never need to read projects (which hold the prices). Kept in sync automatically. */
const owners=p=>p.ownerIds&&p.ownerIds.length?p.ownerIds:(p.clientId?[p.clientId]:[]);
const ownerNames=p=>owners(p).map(cname).join(' & ')||'—';
const evMeta=(p,S=db.staff,C=db.clients)=>{const o=owners(p);return{clientId:o[0]||'',clientIds:[...o].sort(),clientName:o.map(i=>(C.find(c=>c.id===i)||{}).name||'').filter(Boolean).join(' & '),projectTitle:p.title||'',staffIds:S.filter(s=>(s.projectIds||[]).includes(p.id)).map(s=>s.id).sort()}};
async function syncEvents(){
  if(me?.role!=='admin'||!db.projects.length)return;
  const mig=db.projects.filter(p=>!(p.ownerIds&&p.ownerIds.length)&&p.clientId);   // old single-client projects -> owners list
  for(let i=0;i<mig.length;i+=400){const b=writeBatch(fs);mig.slice(i,i+400).forEach(p=>b.update(doc(fs,'projects',p.id),{ownerIds:[p.clientId]}));await b.commit()}
  const w=[];
  db.events.forEach(e=>{const p=db.projects.find(x=>x.id===e.projectId);if(!p)return;const x=evMeta(p);
    if(x.clientId!==e.clientId||JSON.stringify(x.clientIds)!==JSON.stringify([...(e.clientIds||[])].sort())||x.clientName!==(e.clientName||'')||x.projectTitle!==(e.projectTitle||'')||JSON.stringify(x.staffIds)!==JSON.stringify([...(e.staffIds||[])].sort()))w.push([e.id,x])});
  for(let i=0;i<w.length;i+=400){const b=writeBatch(fs);w.slice(i,i+400).forEach(([id,x])=>b.update(doc(fs,'events',id),x));await b.commit()}
}
const queueSync=()=>{clearTimeout(syncT);syncT=setTimeout(()=>syncEvents().catch(()=>{}),2500)};

function adminListen(full){
  listen(collection(fs,'clients'),s=>{db.clients=mapDocs(s);queueSync()});
  listen(collection(fs,'clientSecrets'),s=>{db.secrets={};s.docs.forEach(d=>{db.secrets[d.id]=d.data().pw;db.notes[d.id]=d.data().note||''})});
  listen(collection(fs,'projects'),s=>{db.projects=mapDocs(s);queueSync()});
  listen(collection(fs,'events'),s=>{db.events=mapDocs(s);queueSync()});
  listen(collection(fs,'deliveries'),s=>db.deliveries=mapDocs(s));
  listen(collection(fs,'staff'),s=>{db.staff=mapDocs(s);queueSync()});
  if(!full)listen(collection(fs,'staffSecrets'),s=>{db.ssecrets={};s.docs.forEach(d=>{db.ssecrets[d.id]=d.data().pw;db.notes[d.id]=d.data().note||''})});
  listen(collection(fs,'staffRequests'),s=>db.reqs=mapDocs(s));
  listen(collection(fs,'staffPay'),s=>{db.staffPay=mapDocs(s);queueMig()});
  listen(collection(fs,'staffPayAmt'),s=>{db.spAmt={};s.docs.forEach(x=>db.spAmt[x.id]=+x.data().total||0);queueMig()});
  listen(query(collection(fs,'activity'),orderBy('at','desc'),limit(400)),s=>db.activity=mapDocs(s));
  listen(doc(fs,'config','studio'),s=>db.studio=s.data()||null);
}
const listenTwo=(name,key,uid,f1,f2)=>{const r={a:[],b:[]},set=()=>{const m=new Map();[...r.a,...r.b].forEach(x=>m.set(x.id,x));db[key]=[...m.values()]};
  listen(query(collection(fs,name),where(f1,'==',uid)),s=>{r.a=mapDocs(s);set()});
  listen(query(collection(fs,name),where(f2,'array-contains',uid)),s=>{r.b=mapDocs(s);set()})};
const reenter=()=>setTimeout(()=>enter(auth.currentUser),0);
async function enter(u){
  stop();clearTimeout(syncT);db=blank();view='home';navOpen=false;
  if(!u){me=null;clearTimeout(idleT);try{setupDone=(await getDoc(doc(fs,'config','setup'))).exists()}catch{}return render()}
  const a=await getDoc(doc(fs,'admins',u.uid)),st=a.exists()?null:await getDoc(doc(fs,'staff',u.uid));
  const fullStaff=!!st&&st.exists()&&st.data().access==='full'&&st.data().active!==false;
  if(a.exists()||fullStaff){
    // owner admin, or a staff member the owner gave "Full access"
    if(Date.now()-(+localStorage.getItem(LAST)||0)>IDLE){authErr='Your session expired. Please log in again.';return signOut(auth)}
    me=a.exists()?{role:'admin',uid:u.uid,name:a.data().name,photo:a.data().photo||''}:{role:'admin',full:true,uid:u.uid,name:st.data().name,photo:st.data().photo||'',title:st.data().role||'Staff'};
    resetIdle();adminListen(!a.exists());
    if(fullStaff)listen(doc(fs,'staff',u.uid),s=>{const x=s.data()||{};if(x.access!=='full'||x.active===false)reenter()});
  }else if(st&&st.exists()){
    if(st.data().active===false){authErr='Your access is paused. Please contact the studio.';return signOut(auth)}
    me={role:'staff',uid:u.uid,name:st.data().name};
    listen(doc(fs,'staff',u.uid),s=>{db.self=s.data();if((s.data()||{}).access==='full')reenter()});
    listen(query(collection(fs,'events'),where('staffIds','array-contains',u.uid)),s=>db.events=mapDocs(s));
    listen(query(collection(fs,'staffRequests'),where('staffId','==',u.uid)),s=>db.reqs=mapDocs(s));
    listen(query(collection(fs,'staffPay'),where('staffId','==',u.uid)),s=>db.staffPay=mapDocs(s));
  }else{
    const c=await getDoc(doc(fs,'clients',u.uid));
    if(!c.exists()){authErr='This account is not linked to the portal.';return signOut(auth)}
    me={role:'client',uid:u.uid,name:c.data().name};
    listen(doc(fs,'clients',u.uid),s=>db.self=s.data());
    listenTwo('projects','projects',u.uid,'clientId','ownerIds');
    listenTwo('events','events',u.uid,'clientId','clientIds');
    listen(query(collection(fs,'deliveries'),where('clientId','==',u.uid)),s=>db.deliveries=mapDocs(s));
    listen(doc(fs,'config','studio'),s=>db.studio=s.data()||null);
  }
  render();
}
if(ready)onAuthStateChanged(auth,u=>{if(!signingUp)enter(u)});

/* ---------- small UI helpers ---------- */
const TYPES=['Wedding','Pre-wedding','Engagement','Haldi','Mehendi','Sangeet','Reception','Birthday','Baby shoot','Maternity','Corporate','Fashion','Product','Cinematic film','Other'];
const EST=['Pending','Confirmed','Success','Cancelled'];
const SERV=['Wedding Photography & Videography','Engagement','Prewedding','Editing','Other'];
const DELV=['Classic','Signature','Premium'];
const SIDES=['Groom side','Bride side','Both sides'];
const TEAMR=[['candid','Candid Photographer'],['trad','Traditional Photographer'],['cine','Cinematographer'],['tvid','Traditional Videographer'],['drone','Drone Operator'],['other','Other']];
const ROLES=['CEO','Founder','Manager','Photographer','Videographer','Editor','Staff'];
const etypes=e=>e.types&&e.types.length?e.types:[e.type];
const schedText=e=>(e.evDetails||[]).map(r=>[r.type+(r.time?' · '+fmt12(r.time):'')+(r.hours?' · '+r.hours+' hrs':''),r.details].filter(Boolean).join('\n')).join('\n\n');
const coordOf=e=>[e.coordName,e.coordPhone].filter(Boolean).join(' · ');
const todayS=()=>new Date().toLocaleDateString('en-CA');
let cid=null;
const evSort=(a,b)=>((a.date||'')+(a.time||'')).localeCompare((b.date||'')+(b.time||''));
/* an event is COMPLETED when it is marked Success, or its date has passed (cancelled events are never "completed") */
const isDone=e=>e.status!=='Cancelled'&&(e.status==='Success'||(!!e.date&&e.date<todayS()));
const pname=id=>(db.projects.find(p=>p.id===id)||{}).title||'—';
const sname=id=>(db.staff.find(s=>s.id===id)||{}).name||'—';
const tot=ps=>ps.reduce((a,p)=>{const x=pay(p);a.total+=x.total;a.paid+=x.paid;a.due+=x.due;return a},{total:0,paid:0,due:0});
const ico=(n,b)=>`<i class="fa-${b||'solid'} fa-${n}" aria-hidden="true"></i>`;
const pill=(t,c)=>`<span class="pill ${c||''}">${esc(t)}</span>`;
const stPill=s=>pill(s,{Ongoing:'warn',Pending:'warn',Confirmed:'ok',Success:'dark',Completed:'dark',Cancelled:'bad'}[s]||'');
const btn=(a,id,t,ic)=>`<button class="btn sm outline" data-${a}="${id}">${ic?ico(ic)+' ':''}${t}</button>`;
const kv=(k,v)=>v?`<div><small>${k}</small><span>${esc(v)}</span></div>`:'';
const kvl=(k,v)=>v?`<div class="wide"><small>${k}</small><span class="pre">${esc(v)}</span></div>`:'';
const stat=(l,v,d,ic,k)=>{const inner=`${ic?`<i class="fa-solid fa-${ic} kpi-ic" aria-hidden="true"></i>`:''}<small>${l}</small><b>${v}</b>${k?`<em class="kpi-go">View details ${ico('arrow-right')}</em>`:''}`;return k?`<button type="button" class="kpi click ${d?'dark':''}" data-kpi="${esc(k)}">${inner}</button>`:`<div class="kpi ${d?'dark':''}">${inner}</div>`};
const mLabel=m=>{const[y,mo]=m.split('-');return new Date(+y,+mo-1,1).toLocaleString('en-IN',{month:'short',year:'2-digit'})};
const bars=(rows,kind)=>{const m=Math.max(1,...rows.map(r=>r[1]));return rows.map(r=>{const inner=`<span>${esc(r[0])}</span><div class="track"><i style="width:${r[1]/m*100}%"></i></div><b>${r[1]}</b>`;return kind?`<button type="button" class="bar-row clickable" data-bar="${kind}|${esc(r[2]??r[0])}">${inner}</button>`:`<div class="bar-row">${inner}</div>`}).join('')};
const empty=(t,ic)=>`<div class="empty">${ico(ic||'folder-open')}<p>${t}</p></div>`;
const cards=(a,fn,msg,ic)=>a.length?`<div class="cards">${a.map(fn).join('')}</div>`:empty(msg,ic);
const heading=(t,act)=>`<div class="sec-h"><h3>${t}</h3>${act||''}</div>`;
const initial=n=>esc(String(n||'?').trim().slice(0,1).toUpperCase());
const av=(n,ph,cls)=>`<span class="avatar ${cls||''}">${ph?`<img src="${esc(ph)}" alt="">`:initial(n)}</span>`;
const projCard=(p,adm)=>{const x=pay(p),pc=x.total?Math.min(100,Math.round(x.paid/x.total*100)):0;
  return`<article class="card">${p.side?`<div class="sidebadge">${esc(p.side)}</div>`:''}<div class="card-h"><div><h3>${esc(p.title)}</h3><small>${adm?esc(ownerNames(p))+' · ':''}${esc(p.service)}</small></div>${stPill(p.status)}</div>${p.details?`<p>${esc(p.details)}</p>`:''}<div class="meta">${kvl('Function dates',p.funcDates)}${kv('Start',p.startDate)}${kv('Delivery by',p.deliveryDate)}${kv('Deliverables',p.deliverables)}</div><div class="prog paybox ${x.due?'':'is-clear'}"><div class="pay-grid"><div><small>Total</small><b>${inr(x.total)}</b></div><div class="pg"><small>Received</small><b>${inr(x.paid)}</b></div><div class="pd"><small>Pending</small><b>${inr(x.due)}</b></div></div><div class="track"><i style="width:${pc}%"></i></div><div class="pay-state">${x.due?`${pc}% paid`:`${ico('circle-check')} Fully paid`}</div></div>${termsBlock(p)}${adm?`<div class="row-actions">${btn('pp',p.id,'Add payment','plus')}${btn('pcm',p.id,'Staff cost','wallet')}${(p.payments||[]).length?btn('pu',p.id,'Undo last payment','rotate-left'):''}${btn('pe',p.id,'Edit','pen')}${btn('pd',p.id,'Delete','trash')}</div>`:''}</article>`};
/* m: 0 = client view, 1 = admin, 2 = staff (no prices, no client contact) */
const evCard=(e,m)=>{const d=e.date?new Date(e.date+'T00:00'):null,dn=isDone(e);
  const sub=m===1?esc(e.clientName||cname(e.clientId))+' · '+esc(e.projectTitle||pname(e.projectId)):m===2?esc(e.clientName||'')+' · '+esc(e.projectTitle||''):esc(pname(e.projectId));
  return`<article class="card ev ${dn?'done':''}"><div class="date">${d?`<b>${d.getDate()}</b><span>${d.toLocaleString('en-IN',{month:'short'})}</span>`:''}</div><div class="ev-b">${e.side?`<div class="sidebadge">${esc(e.side)}</div>`:''}<div class="card-h"><div><h3>${esc(e.type)}</h3><small>${sub}</small></div>${dn?`<span class="pill ok done-pill">${ico('circle-check')} Completed</span>`:stPill(e.status)}</div><div class="meta">${e.evDetails&&e.evDetails.length?kvl('Schedule',schedText(e)):kv('Time',[fmt12(e.time),fmt12(e.endTime)].filter(Boolean).join(' – '))}${kv('Venue',e.place)}${kvl('Team',e.team)}${kv('Team members',e.teamNames)}${kv('Coordinator',coordOf(e))}${kv('On-site contact',e.contact)}</div>${e.notes?`<p>${esc(e.notes)}</p>`:''}${m===1?`<div class="row-actions">${btn('es',e.id,'Share','share-nodes')}${btn('ee',e.id,'Edit','pen')}${btn('ed',e.id,'Delete','trash')}</div>`:''}</div></article>`};
const payLog=(ps,adm)=>{const r=ps.flatMap(p=>(p.payments||[]).map(x=>({...x,p:p.title}))).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  return r.length?`<div class="table-wrap"><table><thead><tr><th>Date</th><th>Project</th><th>Amount</th><th>Mode</th><th>Note</th>${adm?'<th>Recorded by</th>':''}</tr></thead><tbody>${r.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.p)}</td><td><b>${inr(x.amount)}</b></td><td>${esc(x.mode)}</td><td>${esc(x.note)}</td>${adm?`<td>${x.by?`${esc(x.by)}<br><small>${fmtAt(x.at)}</small>`:'—'}</td>`:''}</tr>`).join('')}</tbody></table></div>`:empty('No payments recorded yet.','receipt')};
const groupByDate=l=>{const g=[];l.forEach(e=>{const k=e.date||'',last=g[g.length-1];if(last&&last.d===k)last.a.push(e);else g.push({d:k,a:[e]})});return g};
const evGroups=(l,m)=>groupByDate(l).map(x=>`<div class="day-h"><b>${esc(fmtDay(x.d))}</b><span>${x.a.length} event${x.a.length===1?'':'s'}</span></div><div class="cards">${x.a.map(e=>evCard(e,m)).join('')}</div>`).join('');
/* upcoming / running events first, COMPLETED events always at the very bottom (light-green cards) */
const evSplit=(l,m)=>{const a=l.filter(e=>!isDone(e)),d=l.filter(isDone).sort((x,y)=>evSort(y,x));
  return(a.length?evGroups(a,m):'')+(d.length?`<div class="done-h">${ico('circle-check')}<h3>Completed events</h3><span>${d.length}</span></div>${evGroups(d,m)}`:'')};

/* ---------- delivery cards ---------- */
const DL_SUGG=['Pre-wedding','Wedding','Haldi','Mehendi','Sangeet','Engagement','Reception','Cinematic film','Reels','Album'];
const safeUrl=u=>/^https?:\/\//i.test(u||'')?u:'#';
const delivSort=(a,b)=>(a.createdAt||0)-(b.createdAt||0);
const shrink=(f,max=800)=>new Promise((res,rej)=>{const u=URL.createObjectURL(f),i=new Image();
  i.onload=()=>{const k=Math.min(1,max/i.naturalWidth),c=document.createElement('canvas');c.width=Math.round(i.naturalWidth*k);c.height=Math.round(i.naturalHeight*k);c.getContext('2d').drawImage(i,0,0,c.width,c.height);URL.revokeObjectURL(u);
    let ql=.82,o=c.toDataURL('image/jpeg',ql);while(o.length>600000&&ql>.4){ql-=.1;o=c.toDataURL('image/jpeg',ql)}res(o)};
  i.onerror=rej;i.src=u});
const imgHtml=(k,v,max)=>`<div class="imgf" data-max="${max||800}"><img class="imgf-pv" alt="Preview" ${v?`src="${esc(v)}"`:'hidden'}><input type="hidden" name="${k}" value="${esc(v||'')}"><input type="file" accept="image/*"><button type="button" class="lnk" data-rm>Remove photo</button></div>`;
const delivCard=(d,adm)=>{
  const th=`<div class="dthumb">${d.thumb?`<img src="${esc(d.thumb)}" alt="${esc(d.title)}" loading="lazy">`:ico('photo-film')}</div>`;
  return adm
    ?`<div class="dcard adm">${th}<div class="dtitle"><b>${esc(d.title)}</b><span class="dl">${esc(d.link)}</span></div><div class="row-actions"><a class="btn sm btn-gold" href="${esc(safeUrl(d.link))}" target="_blank" rel="noopener">${ico('arrow-up-right-from-square')} Open</a>${btn('de',d.id,'Edit','pen')}${btn('dd',d.id,'Delete','trash')}</div></div>`
    :`<a class="dcard" href="${esc(safeUrl(d.link))}" target="_blank" rel="noopener">${th}<div class="dtitle"><b>${esc(d.title)}</b><span class="open-btn">Open ${ico('arrow-up-right-from-square')}</span></div></a>`};

/* ---------- studio contact card (client portal) ---------- */
const studioCard=()=>{const s=db.studio||{},n=s.name||'Shubham Production',ph=s.phone||'+91 88023 89087';
  return`<section class="studio">${av(n,s.photo,'lg')}<div class="studio-b"><small>Your photographer</small><h3>${esc(n)}</h3><span>${ico('phone')} ${esc(ph)}</span></div><a class="btn btn-gold sm" href="${esc(waLink(ph,'Hello '+n+', this is '+(me?.name||'')+' from the client portal.'))}" target="_blank" rel="noopener">${ico('whatsapp','brands')} WhatsApp</a></section>`};

/* ---------- Google review card (client) ---------- */
const reviewCard=()=>`<section class="review" id="rvCard" role="link" tabindex="0" aria-label="Write a review on Google">
  <div class="review-top"><div class="stars">${'<i class="fa-solid fa-star" aria-hidden="true"></i>'.repeat(5)}</div><div class="review-txt"><h3>Loved your experience? Leave us a Google review</h3><p>Tap this card to open our Google profile and write your review.</p></div><span class="btn btn-gold sm">${ico('star')}&nbsp; Write a review</span></div>
  <div class="review-tips"><h4>Not sure what to write? Use one of these</h4>
  ${REVIEW_TIPS.map((t,i)=>`<div class="tip"><p>“${esc(t)}”</p><button type="button" class="btn sm outline" data-copy="${i}">${ico('copy','regular')} Copy</button></div>`).join('')}
  <div class="photo-tip">${ico('camera')}<p><b>Add photos to your review.</b> Upload 2–3 of your favourite shots from your album along with your review — reviews with photos feel real, get noticed more and help other couples trust us.</p></div></div></section>`;
const copyTip=i=>copyText(REVIEW_TIPS[+i],'Copied — paste it in your Google review');

/* ---------- login / sign up ---------- */
function authView(){
  const setup=!ready;
  $('#app').innerHTML=`<section class="auth"><div class="auth-art"><div class="auth-art-in"><p class="eyebrow">Studio Portal</p><h1>Shoots, payments and deliveries, <em>in one place.</em></h1><p class="lead">Clients follow their project, events and delivery link. Staff see their assigned work. The studio manages everything from one dashboard.</p></div>
  <ul class="auth-points"><li>${ico('calendar-days')}<span><b>Event schedule</b>Dates, venues and team for every function.</span></li><li>${ico('indian-rupee-sign')}<span><b>Payments</b>What is paid, what is pending, always up to date.</span></li><li>${ico('photo-film')}<span><b>Delivery</b>Your photos and films, one tap away.</span></li></ul></div>
  <div class="auth-form"><div class="card-auth"><p class="eyebrow">${mode==='login'?'Secure login':'First-time setup'}</p><h2>${mode==='login'?'Welcome back':'Create admin account'}</h2>
  ${setupDone?'':`<div class="tabs"><button data-m="login" class="${mode==='login'?'on':''}">Login</button><button data-m="signup" class="${mode==='signup'?'on':''}">Sign up</button></div>`}
  <form id="af" novalidate>${mode==='login'?`<label for="id">Email or mobile number</label><div class="field">${ico('user')}<input id="id" required autocomplete="username" inputmode="email" placeholder="Admin email / client or staff mobile"></div><label for="pw">Password</label><div class="field">${ico('lock')}<input id="pw" type="password" required autocomplete="current-password" placeholder="Your password"><button type="button" class="eye" id="eye" aria-label="Show password">${ico('eye')}</button></div>`:`<label for="nm">Name</label><div class="field">${ico('user')}<input id="nm" required></div><label for="id">Email</label><div class="field">${ico('envelope','regular')}<input id="id" type="email" required></div><label for="pw">Password (min 6)</label><div class="field">${ico('lock')}<input id="pw" type="password" minlength="6" required><button type="button" class="eye" id="eye" aria-label="Show password">${ico('eye')}</button></div>`}
  <div class="err" id="err" role="alert">${setup?'Firebase config is missing in js/portal.js.':esc(authErr)}</div><button class="btn btn-gold full" ${setup?'disabled':''}>${mode==='login'?'Login':'Create account'}</button></form>
  <p class="hint">${mode==='login'?'Studio admins log in with email. Clients and staff log in with their registered mobile number and the password shared by the studio.':'This is only for the first admin. Sign up closes automatically afterwards.'}</p>
  <p class="hint help">Trouble logging in? <a href="${WA}" target="_blank" rel="noopener">${ico('whatsapp','brands')} Message us on WhatsApp</a></p></div></div></section>`;
  authErr='';
  document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{mode=b.dataset.m;authView()});
  const eye=$('#eye');if(eye)eye.onclick=()=>{const p=$('#pw'),s=p.type==='password';p.type=s?'text':'password';eye.innerHTML=ico(s?'eye-slash':'eye');eye.setAttribute('aria-label',s?'Hide password':'Show password')};
  $('#af').onsubmit=async e=>{e.preventDefault();const id=$('#id').value.trim(),pw=$('#pw').value,err=$('#err'),sb=e.target.querySelector('button.full');err.textContent='';
    if(!id||!pw){err.textContent='Please fill in all fields.';return}
    sb.disabled=true;
    try{
      await setPersistence(auth,id.includes('@')?browserSessionPersistence:browserLocalPersistence);
      if(mode==='signup'){
        signingUp=true;touch();const cr=await createUserWithEmailAndPassword(auth,id.toLowerCase(),pw);
        try{const b=writeBatch(fs);b.set(doc(fs,'admins',cr.user.uid),{name:$('#nm').value.trim(),email:id.toLowerCase()});b.set(doc(fs,'config','setup'),{at:Date.now()});await b.commit()}
        catch(x){await deleteUser(cr.user);throw x}
        signingUp=false;setupDone=true;await enter(cr.user);
      }else if(id.includes('@')){touch();await signInWithEmailAndPassword(auth,id.toLowerCase(),pw)}
      else{ // mobile number: try client account first, then staff account
        touch();
        try{await signInWithEmailAndPassword(auth,em(id),pw)}
        catch(x){if(/invalid-credential|wrong-password|user-not-found/.test(x.code||''))await signInWithEmailAndPassword(auth,emS(id),pw);else throw x}
      }
    }catch(x){signingUp=false;err.textContent=nice(x);sb.disabled=false}
  };
}

/* ---------- modal helpers ---------- */
function popup(title,body,acts){
  const m=$('#modal');m.hidden=false;m.dataset.term='';m.dataset.sp='';m.dataset.pj='';document.body.classList.add('modal-open');
  const close=()=>{m.hidden=true;document.body.classList.remove('modal-open')};
  m.innerHTML=`<div class="modal-card"><div class="modal-h"><h3>${title}</h3><button type="button" class="x" id="cx" aria-label="Close">${ico('xmark')}</button></div><div class="modal-b">${body}</div><div class="acts">${acts}</div></div>`;
  $('#cx').onclick=close;m.onclick=e=>{if(e.target===m)close()};m.onkeydown=e=>{if(e.key==='Escape')close()};
  return{m,close}
}
const evdBlock=(t,r)=>`<div class="evb" data-t="${esc(t)}"><h4>${esc(t)}</h4><div class="evb-g"><div><small>Start time</small>${t12Html('evt__time',r.time)}</div><div><small>Coverage</small><select data-f="hours"><option value="">—</option>${[6,12].map(h=>`<option value="${h}" ${String(r.hours)===String(h)?'selected':''}>${h} hours</option>`).join('')}</select></div></div><textarea rows="2" placeholder="Details for ${esc(t)} (rituals, call time, special notes...)">${esc(r.details||'')}</textarea></div>`;
const termRow=r=>`<div class="trw"><input name="pt__label" list="dl_pterm" placeholder="e.g. Advance" value="${esc(r.label||'')}" aria-label="Term"><input type="date" name="pt__date" value="${esc(r.date||'')}" aria-label="Date"><input type="number" min="0" name="pt__amount" placeholder="₹ Amount" value="${esc(r.amount||'')}" aria-label="Amount"><button type="button" class="lnk" data-delrow aria-label="Remove">✕</button></div>`;
const funcRow=r=>`<div class="frow"><input type="date" name="fd_date" value="${esc(r.date||'')}" aria-label="Date"><select name="fd_event" aria-label="Event">${TYPES.map(x=>`<option ${x===(r.event||'Wedding')?'selected':''}>${esc(x)}</option>`).join('')}</select><select name="fd_side" aria-label="Side">${SIDES.map(x=>`<option ${x===(r.side||'Both sides')?'selected':''}>${x}</option>`).join('')}</select><button type="button" class="lnk" data-delrow aria-label="Remove date">✕</button></div>`;
const fieldHtml=(f,vals)=>{const v=vals[f.k];let h=`<label class="${f.big?'big':''}">${f.l}</label>`;
  if(f.t==='select')h+=`<select name="${f.k}" class="${f.big?'big':''}">${f.o.map(o=>`<option value="${esc(o[0])}" ${String(v??'')===String(o[0])?'selected':''}>${esc(o[1])}</option>`).join('')}</select>`;
  else if(f.t==='terms')h+=`<datalist id="dl_pterm">${['Advance','Booking amount','Before wedding','On function day','After function','On photo / album delivery','Final payment'].map(x=>`<option value="${x}">`).join('')}</datalist><div class="terms">${(v&&v.length?v:[{}]).map(termRow).join('')}</div><button type="button" class="btn sm outline" data-addterm>+ Add payment term</button><p class="hint">Shown as a live payment tracker. Payments you record are matched to the terms in date order.</p>`;
  else if(f.t==='funcs')h+=`<div class="funcs">${(v&&v.length?v:[{}]).map(funcRow).join('')}</div><button type="button" class="btn sm outline" data-addrow>+ Add date</button>`;
  else if(f.t==='team'){const c=v||{};h+=`<div class="teamg">${TEAMR.map(r=>`<div class="trow"><span>${r[1]}</span><input type="number" min="0" max="50" inputmode="numeric" name="${f.k}__${r[0]}" value="${esc(c[r[0]]||'')}" placeholder="0"></div>${r[0]==='other'?`<input type="text" class="tother" name="${f.k}__otherName" value="${esc(c.otherName||'')}" placeholder="Other role name (e.g. Drone operator)">`:''}`).join('')}</div>`}
  else if(f.t==='evd')h+=`<div class="evd" data-v="${esc(JSON.stringify(v||[]))}"></div>`;
  else if(f.t==='time12')h+=t12Html(f.k,v);
  else if(f.t==='img')h+=imgHtml(f.k,v,f.max);
  else if(f.t==='checks')h+=`${f.search?'<input type="search" class="chk-search" placeholder="Search...">':''}<div class="checks ${f.cols?'two':''}" ${f.max?`data-max="${f.max}"`:''}>${f.o.length?f.o.map(o=>`<label class="chk"><input type="checkbox" name="${f.k}" value="${esc(o[0])}" ${(v||[]).includes(o[0])?'checked':''}><span>${esc(o[1])}</span></label>`).join(''):'<p class="hint">Nothing to select yet.</p>'}</div>`;
  else if(f.t==='area')h+=`<textarea name="${f.k}" rows="${f.rows||3}" ${f.ph?`placeholder="${esc(f.ph)}"`:''}>${esc(v)}</textarea>`;
  else h+=`<input name="${f.k}" type="${f.t||'text'}" value="${esc(v)}" ${f.r?'required':''} ${f.ro?'readonly':''} ${f.dl?`list="dl_${f.k}"`:''}>${f.dl?`<datalist id="dl_${f.k}">${f.dl.map(x=>`<option value="${esc(x)}">`).join('')}</datalist>`:''}`;
  return f.dep?`<div class="dep" data-k="${f.dep[0]}" data-v="${esc(f.dep[1])}" ${String(vals[f.dep[0]]??'')===f.dep[1]?'':'hidden'}>${h}</div>`:h};
function form(title,fields,vals,onSave){
  const m=$('#modal');m.hidden=false;m.dataset.term='';m.dataset.sp='';m.dataset.pj='';document.body.classList.add('modal-open');
  const close=()=>{m.hidden=true;document.body.classList.remove('modal-open')};
  m.innerHTML=`<form class="modal-card"><div class="modal-h"><h3>${title}</h3><button type="button" class="x" id="cx" aria-label="Close">${ico('xmark')}</button></div><div class="modal-b">${fields.map(f=>fieldHtml(f,vals)).join('')}</div><div class="acts"><button type="button" class="btn outline" id="cx2">Cancel</button><button class="btn btn-gold">Save</button></div></form>`;
  $('#cx').onclick=$('#cx2').onclick=close;
  m.onclick=e=>{if(e.target===m)close()};
  m.onkeydown=e=>{if(e.key==='Escape')close()};
  m.querySelectorAll('.t12').forEach(t12wire);
  m.querySelectorAll('.imgf').forEach(w=>{const fi=w.querySelector('input[type=file]'),h=w.querySelector('input[type=hidden]'),im=w.querySelector('img');
    fi.onchange=async()=>{const f=fi.files[0];if(!f)return;try{h.value=await shrink(f,+w.dataset.max||800);im.src=h.value;im.hidden=false}catch{toast('Could not read this image')}};
    w.querySelector('[data-rm]').onclick=()=>{h.value='';im.hidden=true;im.removeAttribute('src');fi.value=''}});
  // fields that only appear for a chosen option (e.g. "Other" service)
  m.querySelectorAll('.dep').forEach(d=>{const s=m.querySelector(`[name="${d.dataset.k}"]`);if(s)s.addEventListener('change',()=>{d.hidden=s.value!==d.dataset.v})});
  m.querySelectorAll('.terms').forEach(w=>{w.nextElementSibling.onclick=()=>{if(w.children.length>=10)return toast('Maximum 10 payment terms');w.insertAdjacentHTML('beforeend',termRow({}))};
    w.addEventListener('click',e=>{if(!e.target.closest('[data-delrow]'))return;const r=e.target.closest('.trw');if(w.children.length>1)r.remove();else r.querySelectorAll('input').forEach(i=>i.value='')})});
  m.querySelectorAll('.funcs').forEach(w=>{w.nextElementSibling.onclick=()=>{if(w.children.length>=10)return toast('Maximum 10 dates');w.insertAdjacentHTML('beforeend',funcRow({}))};
    w.addEventListener('click',e=>{if(!e.target.closest('[data-delrow]'))return;const r=e.target.closest('.frow');if(w.children.length>1)r.remove();else r.querySelector('input').value=''})});
  m.querySelectorAll('.evd').forEach(box=>{let init=[];try{init=JSON.parse(box.dataset.v)}catch{}
    const boxes=()=>[...m.querySelectorAll('input[name="types"]')];
    const read=()=>[...box.querySelectorAll('.evb')].map(b=>({type:b.dataset.t,time:b.querySelector('input[type=hidden]').value,hours:b.querySelector('[data-f=hours]').value,details:b.querySelector('textarea').value}));
    const build=()=>{const cur=read(),sel=boxes().filter(i=>i.checked).map(i=>i.value);
      box.innerHTML=sel.length?sel.map(t=>evdBlock(t,cur.find(x=>x.type===t)||init.find(x=>x.type===t)||{hours:'6'})).join(''):'<p class="hint">Select the event type(s) above to add time and details for each one.</p>';
      box.querySelectorAll('.t12').forEach(t12wire)};
    boxes().forEach(i=>i.addEventListener('change',()=>setTimeout(build,0)));build()});
  m.querySelectorAll('.chk-search').forEach(i=>i.addEventListener('input',()=>{const q=i.value.toLowerCase();i.nextElementSibling.querySelectorAll('.chk').forEach(l=>l.hidden=!l.textContent.toLowerCase().includes(q))}));
  m.querySelectorAll('.checks[data-max]').forEach(w=>w.addEventListener('change',e=>{if(w.querySelectorAll('input:checked').length>+w.dataset.max){e.target.checked=false;toast('You can select up to '+w.dataset.max)}}));
  const first=m.querySelector('input:not([readonly]):not([type=hidden]):not([type=file]):not([type=checkbox]),select,textarea');if(first)first.focus();
  m.querySelector('form').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('.acts .btn:last-child');b.disabled=true;
    try{const fd=new FormData(e.target),d=Object.fromEntries(fd);fields.forEach(f=>{
        if(f.t==='checks')d[f.k]=fd.getAll(f.k);
        if(f.t==='evd')d[f.k]=[...e.target.querySelectorAll('.evb')].map(b=>({type:b.dataset.t,time:b.querySelector('input[type=hidden]').value,hours:b.querySelector('[data-f=hours]').value,details:b.querySelector('textarea').value.trim()}));
        if(f.t==='terms'){const a=fd.getAll('pt__label'),b=fd.getAll('pt__date'),c=fd.getAll('pt__amount');d[f.k]=a.map((x,i)=>({label:x.trim(),date:b[i],amount:+c[i]||0})).filter(r=>r.amount>0)}
        if(f.t==='funcs'){const a=fd.getAll('fd_date'),b=fd.getAll('fd_event'),c=fd.getAll('fd_side');d[f.k]=a.map((x,i)=>({date:x,event:b[i],side:c[i]})).filter(r=>r.date)}
        if(f.t==='team'){const o={};TEAMR.forEach(r=>{const n=Math.max(0,Math.floor(+fd.get(f.k+'__'+r[0])||0));if(n)o[r[0]]=n});o.otherName=String(fd.get(f.k+'__otherName')||'').trim();d[f.k]=o}});
      Object.keys(d).forEach(k=>{if(/__|^fd_/.test(k))delete d[k]});
      await onSave(d);close();toast('Saved')}catch(x){toast(nice(x));b.disabled=false}};
}
async function withSecondary(fn){const a=initializeApp(firebaseConfig,'sec'+Date.now());try{return await fn(getAuth(a))}finally{await signOut(getAuth(a)).catch(()=>{});deleteApp(a)}}

/* shown right after a client / staff account is created: copy number + password */
function credsModal(title,name,phone,pw,alt,staff){
  const row=(l,v,k)=>`<div class="cred"><div><small>${l}</small><b>${esc(v)}</b></div><button type="button" class="btn sm outline" data-cp2="${k}">${ico('copy','regular')} Copy</button></div>`;
  const{m,close}=popup(title,`<p class="mt-s">Login details for <b>${esc(name)}</b>. Copy them and share.</p>${row('Mobile number',phone,'n')}${row('Password',pw,'p')}`,`<button type="button" class="btn outline" id="cwa">${ico('whatsapp','brands')} Send on WhatsApp</button><button type="button" class="btn btn-gold" id="cdone">Done</button>`);
  m.querySelectorAll('[data-cp2]').forEach(b=>b.onclick=()=>copyText(b.dataset.cp2==='n'?phone:pw,b.dataset.cp2==='n'?'Number copied':'Password copied'));
  $('#cwa').onclick=()=>shareLogin({name,phone,altPhone:alt},pw,staff);$('#cdone').onclick=close;
}

/* ---------- activity log (who did what, and when) ---------- */
const roleLabel=()=>me.role==='staff'?'Staff':(me.full?'Full access':'Admin');
const logAct=(text,x={})=>me?addDoc(collection(fs,'activity'),{at:Date.now(),by:me.uid,byName:me.name,role:roleLabel(),text,...x}).catch(()=>{}):0;
const actRow=a=>`<div class="act-i"><span class="act-dot ${a.role==='Staff'?'st':'ad'}"></span><div><p>${esc(a.text)}</p><small><b>${esc(a.byName)}</b> · ${esc(a.role)} · ${fmtAt(a.at)}</small></div></div>`;
const actList=(n,f)=>{const l=[...db.activity].filter(f||(()=>true)).sort((a,b)=>(b.at||0)-(a.at||0)).slice(0,n);return l.length?`<div class="act">${l.map(actRow).join('')}</div>`:empty('No activity recorded yet.','clock-rotate-left')};
const actPanel=n=>heading('Recent activity',db.activity.length>n?`<button class="btn sm outline" data-go="activity">View all</button>`:'')+`<div class="panel">${actList(n)}</div>`;

/* ---------- admin actions ---------- */
const projF=v=>{const dv=[...DELV];if(v&&v.deliverables&&!dv.includes(v.deliverables))dv.push(v.deliverables);
  return[{k:'side',l:'Coverage side (team by / coverage from)',t:'select',o:SIDES.map(x=>[x,x]),big:1},{k:'title',l:'Project name',r:1},{k:'ownerIds',l:'Project owners — tick one or more clients',t:'checks',o:db.clients.map(c=>[c.id,c.name+(c.phone?' · '+c.phone:'')]),search:1},{k:'service',l:'Service',t:'select',o:SERV.map(x=>[x,x])},{k:'serviceOther',l:'Which service? (type here)',dep:['service','Other']},{k:'funcList',l:'Function dates — pick date, event & side (up to 10)',t:'funcs'},{k:'deliverables',l:'Deliverables',t:'select',o:dv.map(x=>[x,x])},{k:'details',l:'Details',t:'area'},{k:'startDate',l:'Start date',t:'date'},{k:'deliveryDate',l:'Delivery deadline',t:'date'},{k:'amount',l:'Total amount (₹)',t:'number'},{k:'terms',l:'Payment terms — which day, how much',t:'terms'},{k:'status',l:'Status',t:'select',o:['Ongoing','Completed'].map(x=>[x,x])}]};
const saveP=(d,id)=>{const ids=d.ownerIds||[];if(!ids.length)throw Error('Select at least one client as owner');const old=id?db.projects.find(z=>z.id===id):null,prim=old&&ids.includes(old.clientId)?old.clientId:ids[0];const x={...d,ownerIds:[prim,...ids.filter(i=>i!==prim)],clientId:prim,amount:+d.amount||0};
  x.terms=(x.terms||[]).map(t=>({label:t.label||'Payment',date:t.date||'',amount:+t.amount||0})).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999'));
  const tsum=x.terms.reduce((a,t)=>a+t.amount,0);if(x.amount&&tsum>x.amount)throw Error(`Payment terms total (${inr(tsum)}) is more than the project amount (${inr(x.amount)})`);
  if(x.service==='Other')x.service=(x.serviceOther||'').trim()||'Other';delete x.serviceOther;x.funcList=(x.funcList||[]).sort((a,b)=>a.date.localeCompare(b.date));if(x.funcList.length)x.funcDates=x.funcList.map(r=>`${fmtDay(r.date)} – ${r.event} (${r.side})`).join('\n');
  const r=id?updateDoc(doc(fs,'projects',id),x):addDoc(collection(fs,'projects'),{...x,payments:[]});
  return r.then(v=>{logAct((id?'Updated':'Created')+' project — '+x.title,{clientId:x.clientId,projectId:id||(v&&v.id)||'',kind:'project'});return v})};
const addProject=(pre={})=>{const v={status:'Ongoing',service:SERV[0],side:'Both sides',deliverables:'Classic',amount:0,...pre};v.ownerIds=pre.ownerIds||(pre.clientId?[pre.clientId]:[]);return db.clients.length?form('New project',projF(v),v,d=>saveP(d)):toast('Add a client first')};
const editProject=p=>{const v={...p,ownerIds:owners(p),terms:p.terms||[]};if(!SERV.includes(p.service)){v.service='Other';v.serviceOther=p.service}form('Edit project',projF(v),v,d=>saveP(d,p.id))};
const delProject=async id=>{if(!confirm('This deletes the project and all its events (and its staff payment records). Continue?'))return;try{const w=writeBatch(fs);db.events.filter(e=>e.projectId===id).forEach(e=>w.delete(doc(fs,'events',e.id)));db.staffPay.filter(z=>z.projectId===id).forEach(z=>{w.delete(doc(fs,'staffPay',z.id));w.delete(doc(fs,'staffPayAmt',z.id))});w.delete(doc(fs,'projects',id));const pj=db.projects.find(z=>z.id===id)||{};await w.commit();logAct('Deleted project — '+(pj.title||''),{clientId:pj.clientId,kind:'project'})}catch(x){toast(nice(x))}};
const addPayment=(p,after)=>form('Add payment',[{k:'amount',l:'Amount received (₹)',t:'number',r:1},{k:'date',l:'Date',t:'date',r:1},{k:'mode',l:'Mode',t:'select',o:['UPI','Cash','Bank transfer','Cheque','Other'].map(x=>[x,x])},{k:'note',l:'Note'}],{date:todayS(),mode:'UPI'},async d=>{await updateDoc(doc(fs,'projects',p.id),{payments:[...(p.payments||[]),{amount:+d.amount||0,date:d.date,mode:d.mode,note:d.note||'',by:me.name,at:Date.now()}]});logAct('Payment received '+inr(+d.amount||0)+' ('+d.mode+') — '+p.title,{clientId:p.clientId,projectId:p.id,kind:'payment'});if(after)setTimeout(after,80)});
const undoPayment=p=>confirm('Remove the last payment?')&&updateDoc(doc(fs,'projects',p.id),{payments:(p.payments||[]).slice(0,-1)}).then(()=>{const l=(p.payments||[]).slice(-1)[0]||{};logAct('Removed payment '+inr(l.amount)+' — '+p.title,{clientId:p.clientId,projectId:p.id,kind:'payment'})}).catch(x=>toast(nice(x)));
/* ---------- payment terms: live tracker (payments received are matched to the terms in date order) ---------- */
const termStates=p=>{let rem=pay(p).paid;const td=todayS();return(p.terms||[]).map(t=>{const a=+t.amount||0,pd=Math.min(a,rem);rem-=pd;return{...t,amount:a,paid:pd,due:a-pd,state:a>0&&pd>=a?'paid':pd>0?'partial':(t.date&&t.date<td?'overdue':'upcoming')}})};
const termsBlock=p=>{const ts=termStates(p);if(!ts.length)return'';const done=ts.filter(t=>t.state==='paid').length,nx=ts.find(t=>t.state!=='paid');
  return`<button type="button" class="terms-btn" data-pt="${p.id}"><div class="tb-h"><b>${ico('timeline')} Payment terms</b><span>${done} of ${ts.length} paid · View ${ico('chevron-right')}</span></div><div class="tb-seg">${ts.map(t=>`<i class="${t.state}"></i>`).join('')}</div>${nx?`<div class="tb-n">Next: <b>${esc(nx.label)}</b> · ${inr(nx.due)}${nx.date?' · '+esc(fmtDay(nx.date)):''}</div>`:`<div class="tb-n ok">${ico('circle-check')} All payment terms completed</div>`}</button>`};
function termsModal(id,refresh){
  const p=db.projects.find(x=>x.id===id);if(!p)return;
  const old=$('#modal .modal-b'),sc=refresh&&old?old.scrollTop:0;
  const ts=termStates(p),x=pay(p),pc=x.total?Math.min(100,Math.round(x.paid/x.total*100)):0,td=todayS(),adm=me.role==='admin';
  const unsched=Math.max(0,x.total-ts.reduce((a,t)=>a+t.amount,0)),nx=ts.find(t=>t.state!=='paid'),nowIdx=ts.indexOf(nx);
  const dd=d=>Math.round((new Date(d+'T00:00')-new Date(td+'T00:00'))/864e5);
  const when=t=>{if(!t.date)return'';const n=dd(t.date);return n<0?`Overdue by ${-n} day${-n===1?'':'s'}`:n===0?'Due today':`Due in ${n} day${n===1?'':'s'}`};
  const LBL={paid:['Paid','ok'],partial:['Partly paid','warn'],overdue:['Overdue','bad'],upcoming:['Upcoming','']};
  const body=`<div class="paybox ${x.due?'':'is-clear'}"><div class="pay-grid"><div><small>Total</small><b>${inr(x.total)}</b></div><div class="pg"><small>Received</small><b>${inr(x.paid)}</b></div><div class="pd"><small>Pending</small><b>${inr(x.due)}</b></div></div><div class="track"><i style="width:${pc}%"></i></div><div class="pay-state">${x.due?`${pc}% paid`:`${ico('circle-check')} Fully paid`}</div></div>
  ${nx?`<div class="tnext ${nx.state==='overdue'?'bad':''}">${ico(nx.state==='overdue'?'triangle-exclamation':'bell')}<div><b>Next: ${esc(nx.label)} — ${inr(nx.due)}</b><span>${nx.date?esc(fmtDay(nx.date))+' · '+when(nx):'No date set'}</span></div></div>`:ts.length?`<div class="tnext done">${ico('circle-check')}<div><b>All payment terms are completed</b><span>Thank you!</span></div></div>`:''}
  <div class="tl">${ts.map((t,i)=>`<div class="tl-i ${t.state} ${i===nowIdx?'now':''}"><span class="tl-dot">${t.state==='paid'?ico('check'):t.state==='overdue'?ico('exclamation'):t.state==='partial'?ico('hourglass-half'):i+1}</span><div class="tl-b"><div class="tl-h"><b>${esc(t.label)}</b>${pill(LBL[t.state][0],LBL[t.state][1])}</div><div class="tl-m">${t.date?esc(fmtDay(t.date)):'No date'} · <b>${inr(t.amount)}</b>${t.state!=='paid'&&t.date?` · <em>${when(t)}</em>`:''}</div>${t.state==='partial'?`<div class="tl-sub">Received ${inr(t.paid)} · Pending ${inr(t.due)}</div>`:''}</div></div>`).join('')}</div>
  ${unsched>0?`<p class="hint">${inr(unsched)} of the project amount is not scheduled in any term yet.</p>`:''}`;
  const{m,close}=popup(esc(p.title)+' — payment terms',body,`${adm?`<button type="button" class="btn outline" id="tadd">${ico('plus')} Add payment</button>`:''}<button type="button" class="btn btn-gold" id="tclose">Close</button>`);
  m.dataset.term=id;$('#tclose').onclick=close;const ta=$('#tadd');if(ta)ta.onclick=()=>addPayment(p,()=>termsModal(id));
  const nb=$('#modal .modal-b');if(nb)nb.scrollTop=sc;
}
const evF=()=>[{k:'side',l:'Coverage side (team by / coverage from)',t:'select',o:SIDES.map(x=>[x,x]),big:1},{k:'projectId',l:'Project',t:'select',o:[['','— select —'],...db.projects.map(p=>[p.id,`${p.title} (${ownerNames(p)})`])]},{k:'types',l:'Event type (select up to 5)',t:'checks',o:TYPES.map(x=>[x,x]),max:5,cols:1},{k:'date',l:'Date',t:'date',r:1},{k:'evDetails',l:'Time & details for each selected event',t:'evd'},{k:'place',l:'Venue / place'},{k:'contact',l:'On-site contact (name, number)'},{k:'teamCounts',l:'Team — how many members',t:'team'},{k:'coordName',l:'Coordinator name'},{k:'coordPhone',l:'Coordinator number',t:'tel'},{k:'notes',l:'Notes for client (dress code, call time...)',t:'area'},{k:'status',l:'Status',t:'select',o:EST.map(x=>[x,x])}];
const saveE=(d,id)=>{const p=db.projects.find(x=>x.id===d.projectId);if(!p)throw Error('Please select a project');const types=d.types||[];if(!types.length)throw Error('Select at least one event type');
  const tc=d.teamCounts||{},old=id?db.events.find(z=>z.id===id):null,x={...d,...evMeta(p),type:types.join(', '),types};
  if(Object.keys(tc).some(k=>k!=='otherName')||!old||old.teamCounts)x.team=TEAMR.filter(r=>tc[r[0]]).map(r=>`${r[0]==='other'?(tc.otherName||'Other'):r[1]} × ${tc[r[0]]}`).join('\n');const ev=(d.evDetails||[]).filter(r=>r.type).sort((a,b)=>(a.time||'99').localeCompare(b.time||'99')),f1=ev.find(r=>r.time);
  const addH=(t,h)=>{const[H,M]=t.split(':').map(Number);return String((H+h)%24).padStart(2,'0')+':'+String(M).padStart(2,'0')};
  x.evDetails=ev;x.time=f1?f1.time:'';x.endTime=ev.length===1&&ev[0].time&&ev[0].hours?addH(ev[0].time,+ev[0].hours):'';
  const r=id?updateDoc(doc(fs,'events',id),x):addDoc(collection(fs,'events'),x);
  return r.then(v=>{logAct((id?'Updated':'Added')+' event — '+x.type+' ('+x.projectTitle+') · '+fmtDay(x.date)+' · '+x.status,{clientId:x.clientId,projectId:x.projectId,kind:'event'});return v})};
const addEvent=(pre={})=>db.projects.length?form('New event',evF(),{types:['Wedding'],status:'Pending',side:'Both sides',...pre},d=>saveE(d)):toast('Create a project first');
const editEvent=e=>{const v={...e,types:etypes(e),evDetails:e.evDetails||etypes(e).map((t,i)=>({type:t,time:i?'':(e.time||''),hours:'',details:''}))};form('Edit event',evF(),v,d=>saveE(d,e.id))};
const delEvent=id=>{const e=db.events.find(z=>z.id===id)||{};return confirm('Delete this event?')&&deleteDoc(doc(fs,'events',id)).then(()=>logAct('Deleted event — '+(e.type||'')+' · '+fmtDay(e.date),{clientId:e.clientId,projectId:e.projectId,kind:'event'})).catch(x=>toast(nice(x)))};

/* share an event: builds a WhatsApp-ready message the admin can edit, then send anywhere */
const evText=e=>{const cn=e.clientName||cname(e.clientId),pn=e.projectTitle||pname(e.projectId),tm=[fmt12(e.time),fmt12(e.endTime)].filter(Boolean).join(' – ');
  return['*Shubham Production – Event Details*','',`*Event:* ${e.type}`,e.side?`*Coverage:* ${e.side}`:'',cn&&cn!=='—'?`*Client:* ${cn}`:'',pn&&pn!=='—'?`*Project:* ${pn}`:'',`*Date:* ${fmtDay(e.date)}`,schedText(e)?`*Schedule:*\n${schedText(e)}`:tm?`*Time:* ${tm}`:'',e.place?`*Venue:* ${e.place}`:'',e.team?`*Team:*\n${e.team}`:'',e.teamNames?`*Team members:* ${e.teamNames}`:'',coordOf(e)?`*Coordinator:* ${coordOf(e)}`:'',e.contact?`*On-site contact:* ${e.contact}`:'',e.notes?`*Notes:* ${e.notes}`:'',`*Status:* ${e.status}`].filter((x,i)=>x!==''||i===1).join('\n')};
/* builds a picture card of the event (PNG) that can be shared on WhatsApp / anywhere */
async function eventCardBlob(e){
  try{await Promise.all([document.fonts.load('700 64px "Playfair Display"'),document.fonts.load('500 30px Inter'),document.fonts.load('700 24px Inter')])}catch{}
  const W=1080,P=76,c=document.createElement('canvas'),x=c.getContext('2d'),SERIF='"Playfair Display",Georgia,serif',SANS='Inter,Arial,sans-serif',G='#7a9d6e';
  c.width=W;
  const tm=[fmt12(e.time),fmt12(e.endTime)].filter(Boolean).join(' – '),cn=e.clientName||cname(e.clientId);
  const items=[['Date',fmtDay(e.date)],['Schedule',schedText(e)||tm],['Venue',e.place],['Client',cn!=='—'?cn:''],['Team',e.team],['Coordinator',coordOf(e)],['Notes',e.notes]].filter(r=>r[1]);
  const wrap=(t,font,mw)=>{x.font=font;const out=[];String(t).split('\n').forEach(par=>{let line='';par.split(' ').forEach(w=>{const tr=line?line+' '+w:w;if(x.measureText(tr).width>mw&&line){out.push(line);line=w}else line=tr});out.push(line)});return out};
  const rr=(X,Y,w,h,r)=>{x.beginPath();x.roundRect?x.roundRect(X,Y,w,h,r):x.rect(X,Y,w,h)};
  const layout=draw=>{let y=96;
    if(draw){x.fillStyle='#0d0d0d';x.fillRect(0,0,W,c.height);x.fillStyle=G;x.fillRect(0,0,W,12)}
    if(draw){x.font=`700 26px ${SANS}`;x.fillStyle=G;x.textBaseline='alphabetic';if('letterSpacing' in x)x.letterSpacing='6px';x.fillText('SHUBHAM PRODUCTION',P,y);if('letterSpacing' in x)x.letterSpacing='0px'}
    y+=64;
    if(e.side){x.font=`700 24px ${SANS}`;const w=x.measureText(e.side.toUpperCase()).width+52;if(draw){rr(P,y,w,50,25);x.fillStyle=G;x.fill();x.fillStyle='#0d0d0d';x.font=`700 24px ${SANS}`;x.fillText(e.side.toUpperCase(),P+26,y+34)}y+=50+44}
    wrap(etypes(e).join(', '),`700 70px ${SERIF}`,W-2*P).forEach(l=>{y+=84;if(draw){x.font=`700 70px ${SERIF}`;x.fillStyle='#fff';x.fillText(l,P,y)}});
    y+=36;if(draw){x.fillStyle='rgba(255,255,255,.18)';x.fillRect(P,y,W-2*P,2)}y+=26;
    items.forEach(r=>{y+=38;if(draw){x.font=`700 21px ${SANS}`;x.fillStyle=G;if('letterSpacing' in x)x.letterSpacing='3px';x.fillText(r[0].toUpperCase(),P,y);if('letterSpacing' in x)x.letterSpacing='0px'}
      wrap(r[1],`500 33px ${SANS}`,W-2*P).forEach(l=>{y+=46;if(draw){x.font=`500 33px ${SANS}`;x.fillStyle='#fff';x.fillText(l,P,y)}});y+=18});
    y+=30;if(draw){x.fillStyle='rgba(255,255,255,.18)';x.fillRect(P,y,W-2*P,2)}y+=56;
    if(draw){x.font=`500 26px ${SANS}`;x.fillStyle='rgba(255,255,255,.7)';x.fillText('Wedding Photography & Films  ·  '+((db.studio&&db.studio.phone)||'+91 88023 89087'),P,y)}
    return y+84};
  const H=layout(false);c.height=H;layout(true);
  return new Promise(r=>c.toBlob(r,'image/png'))
}
const shareEvent=e=>{
  popup('Share event',`<img class="sprev" id="spv" alt="Event card preview"><label>Message (optional, you can edit)</label><textarea id="sm" rows="9">${esc(evText(e))}</textarea>`,`<button type="button" class="btn outline" id="sc">${ico('copy','regular')} Copy text</button><button type="button" class="btn outline" id="sw">${ico('whatsapp','brands')} WhatsApp text</button><button type="button" class="btn outline" id="sd" disabled>${ico('download')} Save image</button><button type="button" class="btn btn-gold" id="ss" disabled>${ico('share-nodes')} Share image</button>`);
  const txt=()=>$('#sm').value;let blob=null;const name='event-card-'+(e.date||'event')+'.png';
  const save=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click()};
  eventCardBlob(e).then(b=>{blob=b;$('#spv').src=URL.createObjectURL(b);$('#sd').disabled=false;$('#ss').disabled=false}).catch(()=>toast('Could not create the image'));
  $('#sw').onclick=()=>window.open('https://wa.me/?text='+encodeURIComponent(txt()),'_blank','noopener');
  $('#sc').onclick=()=>copyText(txt(),'Message copied');
  $('#sd').onclick=()=>blob&&save();
  $('#ss').onclick=()=>{if(!blob)return;const f=new File([blob],name,{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f],text:txt()}).catch(()=>{});
    else{save();toast('Image saved — attach it in WhatsApp')}};
};

const DF=()=>[{k:'title',l:'Heading (Pre-wedding, Haldi, Mehendi...)',r:1,dl:DL_SUGG},{k:'link',l:'Delivery link (Drive / Photos / YouTube...)',t:'url',r:1},{k:'thumb',l:'Preview photo',t:'img'}];
const saveD=(d,clientId,id)=>{if(!/^https?:\/\//i.test(d.link||''))throw Error('Link must start with http:// or https://');const x={title:d.title.trim(),link:d.link.trim(),thumb:d.thumb||'',clientId};const r=id?updateDoc(doc(fs,'deliveries',id),x):addDoc(collection(fs,'deliveries'),{...x,createdAt:Date.now()});return r.then(v=>{logAct((id?'Updated':'Added')+' delivery card — '+x.title,{clientId,kind:'delivery'});return v})};
const addDeliv=clientId=>form('New delivery card',DF(),{},d=>saveD(d,clientId));
const editDeliv=d=>form('Edit delivery card',DF(),d,x=>saveD(x,d.clientId,d.id));
const delDeliv=id=>confirm('Delete this delivery card?')&&deleteDoc(doc(fs,'deliveries',id)).catch(x=>toast(nice(x)));

/* clients (delivery links now live only in the "Delivery links" cards) */
const CF=ro=>[{k:'name',l:'Client name',r:1},{k:'phone',l:'Login mobile number',r:1,ro},{k:'altPhone',l:'Alternate / WhatsApp number'},{k:'email',l:'Email',t:'email'},{k:'address',l:'Address / city',t:'area'},{k:'pw',l:'Password (min 6)',r:1},{k:'note',l:'Private note (only visible to you)',t:'area'},{k:'photo',l:'Profile photo',t:'img',max:320}];
const cData=d=>({name:d.name,altPhone:d.altPhone||'',email:d.email||'',address:d.address||'',photo:d.photo||''});
const addClient=()=>form('New client',CF(0),{pw:genPass()},async d=>{
  const ph=d.phone.replace(/\D/g,'');if(db.clients.some(c=>c.phone===ph))throw Error('This number is already registered');
  const uid=await withSecondary(async a=>(await createUserWithEmailAndPassword(a,em(ph),d.pw)).user.uid);
  const b=writeBatch(fs);b.set(doc(fs,'clients',uid),{...cData(d),phone:ph,verified:false});b.set(doc(fs,'clientSecrets',uid),{pw:d.pw,note:d.note||''});await b.commit();
  logAct('Created client — '+d.name,{clientId:uid,kind:'client'});
  setTimeout(()=>credsModal('Client created',d.name,ph,d.pw,d.altPhone,0),60)});
const editClient=c=>{const old=db.secrets[c.id];form('Edit client',CF(1),{...c,pw:old,note:db.notes[c.id]},async d=>{
  if(d.pw!==old)await withSecondary(async a=>{const u=await signInWithEmailAndPassword(a,em(c.phone),old);await updatePassword(u.user,d.pw)});
  await updateDoc(doc(fs,'clientSecrets',c.id),{pw:d.pw,note:d.note||''});await updateDoc(doc(fs,'clients',c.id),cData(d));logAct('Updated client details — '+d.name,{clientId:c.id,kind:'client'})})};
const delClient=async c=>{if(!confirm('This deletes the client and the projects only they own. Projects shared with other clients are kept. Continue?'))return;
  try{await withSecondary(async a=>{const u=await signInWithEmailAndPassword(a,em(c.phone),db.secrets[c.id]);await deleteUser(u.user)}).catch(()=>{});
    const w=writeBatch(fs);db.projects.filter(p=>owners(p).includes(c.id)).forEach(p=>{const o=owners(p).filter(i=>i!==c.id);if(o.length)w.update(doc(fs,'projects',p.id),{ownerIds:o,clientId:o[0]});else{db.events.filter(e=>e.projectId===p.id).forEach(e=>w.delete(doc(fs,'events',e.id)));db.staffPay.filter(z=>z.projectId===p.id).forEach(z=>{w.delete(doc(fs,'staffPay',z.id));w.delete(doc(fs,'staffPayAmt',z.id))});w.delete(doc(fs,'projects',p.id))}});db.deliveries.filter(x=>x.clientId===c.id).forEach(x=>w.delete(doc(fs,'deliveries',x.id)));w.delete(doc(fs,'clients',c.id));w.delete(doc(fs,'clientSecrets',c.id));await w.commit();logAct('Deleted client — '+c.name,{kind:'client'});view='clients';render()}catch(x){toast(nice(x))}};
const shareLogin=(c,pw,staff)=>{const n=String(c.altPhone||c.phone).replace(/\D/g,'').slice(-10);
  const msg=`Hello ${c.name}, your Shubham Production ${staff?'staff':'client'} portal login:\nWebsite: ${PAGE}\nMobile: ${c.phone}\nPassword: ${pw}\n${staff?'You can see your assigned events here and message the studio.':'You can see your events, payments and delivery link here.'}`;
  window.open('https://wa.me/91'+n+'?text='+encodeURIComponent(msg),'_blank','noopener')};

/* staff accounts: roles + which projects they may see (never prices) */
const SF=ro=>[{k:'name',l:'Staff name',r:1},{k:'phone',l:'Login mobile number',r:1,ro},{k:'altPhone',l:'Alternate / WhatsApp number'},{k:'role',l:'Role',t:'select',o:ROLES.map(x=>[x,x])},{k:'projectIds',l:'Projects this person can see (client name + event details only, never prices)',t:'checks',o:db.projects.map(p=>[p.id,`${p.title} (${ownerNames(p)})`])},{k:'access',l:'Access level',t:'select',o:[['limited','Limited — only assigned projects, no prices'],['full','FULL ACCESS — everything, A to Z (clients, prices, payments, all projects)']]},{k:'active',l:'Login',t:'select',o:[['yes','Allowed'],['no','Paused']]},{k:'pw',l:'Password (min 6)',r:1},{k:'note',l:'Private note (only visible to you)',t:'area'},{k:'photo',l:'Profile photo',t:'img',max:320}];
const sData=d=>({name:d.name,altPhone:d.altPhone||'',role:d.role||'Staff',projectIds:d.projectIds||[],active:d.active!=='no',access:d.access==='full'?'full':'limited',photo:d.photo||''});
const addStaff=()=>form('New staff member',SF(0),{pw:genPass(),role:'Staff',active:'yes',access:'limited',projectIds:[]},async d=>{
  const ph=d.phone.replace(/\D/g,'');if(db.staff.some(s=>s.phone===ph))throw Error('This number is already registered');
  const uid=await withSecondary(async a=>(await createUserWithEmailAndPassword(a,emS(ph),d.pw)).user.uid);
  const b=writeBatch(fs);b.set(doc(fs,'staff',uid),{...sData(d),phone:ph});b.set(doc(fs,'staffSecrets',uid),{pw:d.pw,note:d.note||''});await b.commit();
  logAct('Created staff account — '+d.name,{staffId:uid,kind:'staff'});
  setTimeout(()=>credsModal('Staff account created',d.name,ph,d.pw,d.altPhone,1),60)});
const editStaff=s=>{const old=db.ssecrets[s.id];form('Edit staff',SF(1),{...s,active:s.active===false?'no':'yes',access:s.access==='full'?'full':'limited',pw:old,note:db.notes[s.id]},async d=>{
  if(d.pw!==old)await withSecondary(async a=>{const u=await signInWithEmailAndPassword(a,emS(s.phone),old);await updatePassword(u.user,d.pw)});
  await updateDoc(doc(fs,'staffSecrets',s.id),{pw:d.pw,note:d.note||''});await updateDoc(doc(fs,'staff',s.id),sData(d));logAct('Updated staff — '+d.name,{staffId:s.id,kind:'staff'})})};
const delStaff=async s=>{if(!confirm('Delete this staff account, their messages and their payment records?'))return;
  try{await withSecondary(async a=>{const u=await signInWithEmailAndPassword(a,emS(s.phone),db.ssecrets[s.id]);await deleteUser(u.user)}).catch(()=>{});
    const w=writeBatch(fs);db.reqs.filter(r=>r.staffId===s.id).forEach(r=>w.delete(doc(fs,'staffRequests',r.id)));db.staffPay.filter(z=>z.staffId===s.id).forEach(z=>{w.delete(doc(fs,'staffPay',z.id));w.delete(doc(fs,'staffPayAmt',z.id))});w.delete(doc(fs,'staff',s.id));w.delete(doc(fs,'staffSecrets',s.id));await w.commit();logAct('Deleted staff — '+s.name,{kind:'staff'});view='staff';render()}catch(x){toast(nice(x))}};
const replyReq=r=>form('Reply to '+esc(r.name),[{k:'reply',l:'Your reply',t:'area'}],{reply:r.reply||''},d=>updateDoc(doc(fs,'staffRequests',r.id),{reply:d.reply||'',repliedAt:Date.now(),status:'done'}));
const reqCard=(r,adm)=>`<article class="card req"><div class="card-h"><div><h3>${esc(adm?r.name:'Your message')}</h3><small>${adm?esc(r.role||'Staff')+' · ':''}${new Date(r.createdAt||0).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit',hour12:true})}</small></div>${stPill(r.status==='done'?'Completed':'Pending')}</div><p class="pre">${esc(r.text)}</p>${r.reply?`<p class="reply pre"><b>Admin reply:</b> ${esc(r.reply)}</p>`:''}${adm?`<div class="row-actions">${btn('rr',r.id,'Reply','reply')}${btn('rd',r.id,r.status==='done'?'Reopen':'Mark done','check')}${btn('rx',r.id,'Delete','trash')}</div>`:''}</article>`;

/* ---------- STAFF PAYMENTS: project-wise (agreed amount, paid, expenses by category, full who/when record) ----------
   one document per staff + project:  staffPay/{staffId}_{projectId}
   { staffId, projectId, projectTitle, total, note, entries:[{id,kind,amount,date,note,by,byName,byRole,at}] }
   kind = 'paid' (money paid to the staff)  |  team / editing / travel / other (project expenses)          */
const SPC=[['team','Team'],['editing','Editing'],['travel','Travelling'],['photography','Photography'],['other','Other']];
const spLbl=k=>k==='paid'?'Payment to staff':((SPC.find(c=>c[0]===k)||[0,k])[1]);
const spTotal=d=>(db.spAmt&&d.id in db.spAmt)?db.spAmt[d.id]:(+d.total||0);
/* agreed amounts are kept in an ADMIN-ONLY collection so staff can never read them; old records are moved automatically */
let migT,spMig=false;
const queueMig=()=>{clearTimeout(migT);migT=setTimeout(()=>migrateSp().catch(()=>{}),2500)};
async function migrateSp(){if(spMig||me?.role!=='admin')return;const old=db.staffPay.filter(d=>d.total!==undefined);if(!old.length)return;spMig=true;
  try{for(let i=0;i<old.length;i+=200){const b=writeBatch(fs);old.slice(i,i+200).forEach(d=>{if(!(d.id in db.spAmt))b.set(doc(fs,'staffPayAmt',d.id),{total:+d.total||0});b.update(doc(fs,'staffPay',d.id),{total:deleteField()})});await b.commit()}}catch{spMig=false}}
const spSum=d=>{const e=d.entries||[],s=k=>e.filter(x=>x.kind===k).reduce((a,x)=>a+(+x.amount||0),0),cats=SPC.map(c=>[c[0],c[1],s(c[0])]),total=spTotal(d),paid=s('paid');return{total,paid,due:Math.max(0,total-paid),spent:cats.reduce((a,c)=>a+c[2],0),cats}};
const spTotals=l=>l.map(spSum).reduce((a,x)=>({total:a.total+x.total,paid:a.paid+x.paid,due:a.due+x.due,spent:a.spent+x.spent}),{total:0,paid:0,due:0,spent:0});
const spStats=(t,sc='',adm=true)=>!adm?`<div class="stats s4">${stat('Received from studio',inr(t.paid),1,'circle-check','sp:paid|'+sc)}${stat('Expenses / other entries',inr(t.spent),0,'receipt','sp:spent|'+sc)}</div>`:`<div class="stats s4">${stat('Agreed amount',inr(t.total),1,'file-invoice','sp:total|'+sc)}${stat('Paid to staff',inr(t.paid),0,'circle-check','sp:paid|'+sc)}${stat('Pending',inr(t.due),1,'hourglass-half','sp:due|'+sc)}${stat('Expenses',inr(t.spent),0,'receipt','sp:spent|'+sc)}</div>`;
const spCard=(d,adm,open)=>{const x=spSum(d),pc=x.total?Math.min(100,Math.round(x.paid/x.total*100)):0,mx=Math.max(1,...x.cats.map(c=>c[2])),en=[...(d.entries||[])].sort((a,b)=>(b.at||0)-(a.at||0));
  const mine=e=>adm||(e.by===me.uid&&e.kind!=='paid');
  return`<article class="card sp"><div class="card-h"><div><h3>${esc(d.projectTitle||pname(d.projectId))}</h3><small>${adm?esc(sname(d.staffId))+' · ':''}${d.note?esc(d.note):d.projectId?'Project payment':'Separate payments (not linked to a project)'}</small></div>${adm?(x.total&&!x.due?pill('Settled','ok'):x.total?pill('Due '+inr(x.due),'warn'):pill('No amount set','')):''}</div>
  ${adm?`<div class="paybox ${x.total&&!x.due?'is-clear':''}"><div class="pay-grid"><div><small>Agreed</small><b>${inr(x.total)}</b></div><div class="pg"><small>Paid</small><b>${inr(x.paid)}</b></div><div class="pd"><small>Pending</small><b>${inr(x.due)}</b></div></div><div class="track"><i style="width:${pc}%"></i></div><div class="pay-state">${x.total?(x.due?pc+'% paid':ico('circle-check')+' Fully paid'):'Agreed amount not set'}</div></div>`:`<div class="paybox is-clear"><div class="pay-grid one"><div class="pg"><small>Received from studio</small><b>${inr(x.paid)}</b></div></div></div>`}
  <div class="spcats"><div class="spc-h"><b>${adm?'Spending by type':'Entries by type'}</b><span>${inr(x.spent)}</span></div>${x.cats.map(c=>`<div class="bar-row sp-row"><span>${c[1]}</span><div class="track"><i style="width:${c[2]/mx*100}%"></i></div><b>${inr(c[2])}</b></div>`).join('')}</div>
  <details class="splog" ${open?'open':''}><summary>${ico('clock-rotate-left')} ${en.length} record${en.length===1?'':'s'} — who updated &amp; when</summary>${en.length?`<div class="table-wrap"><table class="mini splt"><thead><tr><th>Type</th><th>Amount</th><th>Date</th><th>Updated by</th><th></th></tr></thead><tbody>${en.map(e=>`<tr><td>${esc(spLbl(e.kind))}${e.note?`<br><small>${esc(e.note)}</small>`:''}</td><td><b>${inr(e.amount)}</b></td><td>${esc(e.date||'')}</td><td>${esc(e.byName||'—')}<br><small>${esc(e.byRole||'')} · ${fmtAt(e.at)}</small></td><td>${mine(e)?`<button class="lnk bad" data-spd="${d.id}|${e.id}" aria-label="Remove record">${ico('trash')}</button>`:''}</td></tr>`).join('')}</tbody></table></div>`:'<p class="hint">Nothing recorded yet.</p>'}</details>
  <div class="row-actions">${open?'':btn('spm',d.id,'Open dashboard','expand')}${adm?btn('spx',d.id+'|paid','Add payment','plus')+btn('spx',d.id+'|exp','Add expense','receipt')+btn('spe',d.id,'Edit amount','pen')+btn('spr',d.id,'Remove','trash'):btn('spx',d.id+'|exp','Add expense','plus')}</div></article>`};
const addSpEntry=(id,mode,after)=>{const d=db.staffPay.find(x=>x.id===id);if(!d)return;
  const kinds=mode==='paid'?[['paid','Payment to staff']]:SPC.map(c=>[c[0],c[1]]);
  form(mode==='paid'?'Add payment to staff':'Add expense — '+esc(d.projectTitle||''),[{k:'kind',l:mode==='paid'?'Type':'Expense category',t:'select',o:kinds},{k:'amount',l:'Amount (₹)',t:'number',r:1},{k:'date',l:'Date',t:'date',r:1},{k:'note',l:'Note (what was it for)'}],{date:todayS(),kind:kinds[0][0]},async v=>{
    const amt=+v.amount||0;if(amt<=0)throw Error('Enter a valid amount');
    const en={id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),kind:v.kind,amount:amt,date:v.date,note:(v.note||'').trim(),by:me.uid,byName:me.name,byRole:roleLabel(),at:Date.now()};
    await updateDoc(doc(fs,'staffPay',id),{entries:arrayUnion(en)});
    logAct(spLbl(v.kind)+' '+inr(amt)+' — '+d.projectTitle+(en.note?' ('+en.note+')':''),{staffId:d.staffId,projectId:d.projectId,kind:'staffpay'});if(after)setTimeout(()=>spModal(id),80)})};
const delSpEntry=ref=>{const[id,eid]=ref.split('|'),d=db.staffPay.find(x=>x.id===id),en=d&&(d.entries||[]).find(x=>x.id===eid);if(!en||!confirm('Remove this record? The removal is also logged.'))return;
  updateDoc(doc(fs,'staffPay',id),{entries:arrayRemove(en)}).then(()=>logAct('Removed '+spLbl(en.kind)+' '+inr(en.amount)+' (added by '+en.byName+') — '+d.projectTitle,{staffId:d.staffId,projectId:d.projectId,kind:'staffpay'})).catch(x=>toast(nice(x)))};
const assignSp=staffId=>{const s=db.staff.find(x=>x.id===staffId);if(!s)return;const taken=db.staffPay.filter(x=>x.staffId===staffId).map(x=>x.projectId);
  const opts=db.projects.filter(p=>!taken.includes(p.id)).map(p=>[p.id,`${p.title} (${ownerNames(p)})`]);
  if(!opts.length)return toast(db.projects.length?'All projects are already added for this staff':'Create a project first');
  form('Add project payment — '+esc(s.name),[{k:'projectId',l:'Project',t:'select',o:opts},{k:'total',l:'Agreed amount for this staff on this project (₹)',t:'number',r:1},{k:'note',l:'Work / role on this project (optional)'}],{},async v=>{
    const p=db.projects.find(x=>x.id===v.projectId);if(!p)throw Error('Select a project');
    await setDoc(doc(fs,'staffPay',staffId+'_'+p.id),{staffId,projectId:p.id,projectTitle:p.title||'',note:(v.note||'').trim(),entries:[],createdAt:Date.now()});await setDoc(doc(fs,'staffPayAmt',staffId+'_'+p.id),{total:+v.total||0});
    logAct('Project payment set '+inr(+v.total||0)+' — '+p.title+' → '+s.name,{staffId,projectId:p.id,kind:'staffpay'})})};
const editSp=(id,after)=>{const d=db.staffPay.find(x=>x.id===id);if(!d)return;
  form('Edit agreed amount — '+esc(d.projectTitle||''),[{k:'total',l:'Agreed amount (₹)',t:'number',r:1},{k:'note',l:'Work / role on this project'}],{total:spTotal(d),note:d.note},async v=>{
    await setDoc(doc(fs,'staffPayAmt',id),{total:+v.total||0});await updateDoc(doc(fs,'staffPay',id),{note:(v.note||'').trim(),total:deleteField()});
    logAct('Agreed amount changed '+inr(spTotal(d))+' → '+inr(+v.total||0)+' — '+d.projectTitle+' ('+sname(d.staffId)+')',{staffId:d.staffId,projectId:d.projectId,kind:'staffpay'});if(after)setTimeout(()=>spModal(id),80)})};
const delSp=id=>{const d=db.staffPay.find(x=>x.id===id);if(!d||!confirm('Remove this project payment and all its records?'))return;
  deleteDoc(doc(fs,'staffPayAmt',id)).catch(()=>{});deleteDoc(doc(fs,'staffPay',id)).then(()=>{closeModal();logAct('Removed project payment record — '+d.projectTitle+' ('+sname(d.staffId)+')',{staffId:d.staffId,projectId:d.projectId,kind:'staffpay'})}).catch(x=>toast(nice(x)))};

const myProfile=()=>{const s=db.studio||{};form('Studio profile (shown to clients)',[{k:'name',l:'Name',r:1},{k:'phone',l:'Contact / WhatsApp number',r:1},{k:'photo',l:'Photo',t:'img',max:320}],{name:s.name||me.name,phone:s.phone||'+91 88023 89087',photo:s.photo||me.photo||''},async d=>{
  await setDoc(doc(fs,'config','studio'),{name:d.name.trim(),phone:d.phone.trim(),photo:d.photo||''});await updateDoc(doc(fs,'admins',me.uid),{photo:d.photo||''});me.photo=d.photo||'';render()})};

/* ---------- interactive dashboards: every number / row opens its details ---------- */
const closeModal=()=>{const m=$('#modal');m.hidden=true;document.body.classList.remove('modal-open')};
const inSp=()=>{const m=$('#modal');return!!(m&&!m.hidden&&m.dataset.sp)};
const rowBtn=(attr,id,main,sub,right)=>`<button type="button" class="lrow" data-${attr}="${esc(id)}"><span class="lr-b"><b>${main}</b>${sub?`<small>${sub}</small>`:''}</span><span class="lr-r">${right}</span>${ico('chevron-right')}</button>`;
function listModal(title,head,rows,emptyMsg){const{close}=popup(title,`${head||''}<div class="lrows">${rows||empty(emptyMsg||'Nothing to show.','folder-open')}</div>`,`<button type="button" class="btn btn-gold" id="lmx">Close</button>`);$('#lmx').onclick=close;wire()}
function kpiOpen(k){
  if(k.startsWith('sp:')){const[kk,sc]=k.slice(3).split('|');return spListOpen(kk,sc)}
  const[sc,key]=k.split(':');
  if(sc==='s')return go('events');
  if(sc==='c')return go(key==='pay'?'payments':'projects');
  if(key==='clients')return go('clients');
  if(key==='projects'){pf={...PF0};return go('projects')}
  if(key==='evmonth'){ef={...EF0,month:todayS().slice(0,7)};return go('events')}
  if(key==='evup'){ef={...EF0,when:'upcoming'};return go('events')}
  const ps=db.projects,t=tot(ps),pc=x=>x.total?Math.round(x.paid/x.total*100)+'%':'—';
  const cfg={billed:['Total billed — by project',ps],recv:['Received — by project',ps.filter(p=>pay(p).paid>0)],pend:['Payment pending — by project',ps.filter(p=>pay(p).due>0)],rate:['Collection rate — by project',ps]}[key];
  const f=p=>{const x=pay(p);return key==='recv'?x.paid:key==='pend'?x.due:key==='rate'?(x.total?x.paid/x.total:0):x.total};
  const rows=[...cfg[1]].sort((a,b)=>f(b)-f(a)).map(p=>{const x=pay(p);return rowBtn('pt',p.id,esc(p.title),esc(ownerNames(p))+' · Billed '+inr(x.total)+' · Received '+inr(x.paid)+' · Pending '+inr(x.due),key==='rate'?pc(x):inr(f(p)))}).join('');
  listModal(cfg[0],`<div class="lsum"><div><small>Billed</small><b>${inr(t.total)}</b></div><div><small>Received</small><b>${inr(t.paid)}</b></div><div><small>Pending</small><b>${inr(t.due)}</b></div></div><p class="hint">Tap a project to see its payment details.</p>`,rows,'No projects here yet.');
}
function barOpen(v){const[kind,val]=v.split('|');ef={...EF0};if(kind==='month')ef.month=val;if(kind==='status')ef.status=val;if(kind==='type')ef.type=val;go('events')}
function spListOpen(k,sc){
  const adm=me.role==='admin',T={total:'Agreed amounts — project-wise',paid:'Paid to staff — project-wise',due:'Pending payments — project-wise',spent:'Expenses — project-wise'}[k];
  const rows=db.staffPay.filter(d=>!sc||d.staffId===sc).map(d=>({d,x:spSum(d)})).filter(r=>k==='total'?r.x.total>0:k==='paid'?r.x.paid>0:k==='due'?r.x.due>0:r.x.spent>0).sort((a,b)=>b.x[k]-a.x[k]);
  const sum=rows.reduce((n,r)=>n+r.x[k],0);
  listModal(T,`<div class="lsum"><div><small>Total</small><b>${inr(sum)}</b></div><div><small>Records</small><b>${rows.length}</b></div></div><p class="hint">Tap any row to open its full payment dashboard.</p>`,
    rows.map(r=>rowBtn('spm',r.d.id,esc(r.d.projectTitle||'Separate payments'),(adm?esc(sname(r.d.staffId))+' · Agreed '+inr(r.x.total)+' · Paid '+inr(r.x.paid)+' · Pending '+inr(r.x.due)+' · Expenses '+inr(r.x.spent):'Received '+inr(r.x.paid)+' · Other entries '+inr(r.x.spent)),inr(r.x[k]))).join(''),'Nothing here yet.');
}
/* one staff + one project (or separate payments): full dashboard in a popup */
function spModal(id,refresh){
  const d=db.staffPay.find(x=>x.id===id);if(!d)return;const adm=me.role==='admin',old=$('#modal .modal-b'),sc=refresh&&old?old.scrollTop:0;
  const{m,close}=popup(esc(d.projectTitle||'Separate payments')+(adm?' — '+esc(sname(d.staffId)):''),`<div class="sp-modal">${spCard(d,adm,true)}</div>`,
    `${adm?`<button type="button" class="btn outline" id="spst">${ico('user-tie')} Staff dashboard</button>`:''}${adm&&d.projectId?`<button type="button" class="btn outline" id="sppj">${ico('camera-retro')} Project cost</button>`:''}<button type="button" class="btn btn-gold" id="spx0">Close</button>`);
  m.dataset.sp=id;$('#spx0').onclick=close;
  const a=$('#spst');if(a)a.onclick=()=>{close();sid=d.staffId;lf='';go('staffp')};
  const b=$('#sppj');if(b)b.onclick=()=>projModal(d.projectId);
  wire();const nb=$('#modal .modal-b');if(nb)nb.scrollTop=sc;
}
/* one project: client money vs staff cost, per staff */
function projModal(pid,refresh){
  const p=db.projects.find(x=>x.id===pid);if(!p)return;const old=$('#modal .modal-b'),sc=refresh&&old?old.scrollTop:0;
  const l=db.staffPay.filter(x=>x.projectId===pid),t=spTotals(l),cx=pay(p),cost=t.paid+t.spent,net=cx.paid-cost;
  const cats=SPC.map(c=>[c[0],c[1],l.reduce((n,d)=>n+spSum(d).cats.find(z=>z[0]===c[0])[2],0)]),mx=Math.max(1,...cats.map(c=>c[2]));
  const body=`<p class="hint" style="margin-top:6px">${esc(ownerNames(p))} · ${esc(p.service||'')}</p>
  <div class="pm-grid"><div><small>Client billed</small><b>${inr(cx.total)}</b></div><div class="pg"><small>Client received</small><b>${inr(cx.paid)}</b></div><div><small>Staff agreed</small><b>${inr(t.total)}</b></div><div><small>Paid to staff</small><b>${inr(t.paid)}</b></div><div><small>Expenses</small><b>${inr(t.spent)}</b></div><div class="${net<0?'pd':'pg'}"><small>Net so far</small><b>${inr(net)}</b></div></div>
  <div class="spcats"><div class="spc-h"><b>Spending by type</b><span>${inr(t.spent)}</span></div>${cats.map(c=>`<div class="bar-row sp-row"><span>${c[1]}</span><div class="track"><i style="width:${c[2]/mx*100}%"></i></div><b>${inr(c[2])}</b></div>`).join('')}</div>
  <h4 class="pm-h">Staff on this project <small>(tap to open)</small></h4><div class="lrows">${l.length?l.map(d=>{const x=spSum(d);return rowBtn('spm',d.id,esc(sname(d.staffId)),'Agreed '+inr(x.total)+' · Paid '+inr(x.paid)+' · Expenses '+inr(x.spent),x.total&&!x.due?'Settled':x.total?'Due '+inr(x.due):'—')}).join(''):empty('No staff added to this project yet.','user-tie')}</div>
  <p class="hint">Net so far = client received − (paid to staff + expenses).</p>`;
  const{m,close}=popup(esc(p.title)+' — cost dashboard',body,`<button type="button" class="btn outline" id="pmadd">${ico('user-plus')} Add staff</button><button type="button" class="btn outline" id="pmpay">${ico('indian-rupee-sign')} Client payments</button><button type="button" class="btn btn-gold" id="pmx">Close</button>`);
  m.dataset.pj=pid;$('#pmx').onclick=close;$('#pmadd').onclick=()=>assignProjStaff(pid);$('#pmpay').onclick=()=>termsModal(pid);
  wire();const nb=$('#modal .modal-b'),_=0;if(nb)nb.scrollTop=sc;
}
const newEntry=(kind,amt,date,note)=>({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),kind,amount:amt,date,note:(note||'').trim(),by:me.uid,byName:me.name,byRole:roleLabel(),at:Date.now()});
/* any payment / expense for a staff member — with or without a project (travel, photography, fee ...) */
const addSpAny=staffId=>{const s=db.staff.find(x=>x.id===staffId);if(!s)return;
  const popts=[['','— No project (separate payment) —'],...db.projects.map(p=>[p.id,`${p.title} (${ownerNames(p)})`])],kinds=[['paid','Payment to staff (fee)'],...SPC.map(c=>[c[0],c[1]])];
  form('Add payment / expense — '+esc(s.name),[{k:'projectId',l:'Project (optional)',t:'select',o:popts},{k:'kind',l:'Type',t:'select',o:kinds},{k:'amount',l:'Amount (₹)',t:'number',r:1},{k:'date',l:'Date',t:'date',r:1},{k:'note',l:'Note (what was it for)'}],{date:todayS(),kind:'paid'},async v=>{
    const amt=+v.amount||0;if(amt<=0)throw Error('Enter a valid amount');
    const p=v.projectId?db.projects.find(x=>x.id===v.projectId):null,id=staffId+'_'+(p?p.id:'general'),title=p?(p.title||''):'Separate payments (no project)',en=newEntry(v.kind,amt,v.date,v.note);
    if(db.staffPay.find(x=>x.id===id))await updateDoc(doc(fs,'staffPay',id),{entries:arrayUnion(en)});
    else await setDoc(doc(fs,'staffPay',id),{staffId,projectId:p?p.id:'',projectTitle:title,note:'',entries:[en],createdAt:Date.now()});
    logAct(spLbl(v.kind)+' '+inr(amt)+' — '+title+' → '+s.name+(en.note?' ('+en.note+')':''),{staffId,projectId:p?p.id:'',kind:'staffpay'})})};
/* add a staff member to a project from the project cost dashboard */
const assignProjStaff=pid=>{const p=db.projects.find(x=>x.id===pid);if(!p)return;const taken=db.staffPay.filter(x=>x.projectId===pid).map(x=>x.staffId);
  const opts=db.staff.filter(s=>!taken.includes(s.id)).map(s=>[s.id,s.name+' · '+(s.role||'Staff')]);
  if(!opts.length)return toast(db.staff.length?'All staff are already added to this project':'Add staff first');
  form('Add staff to — '+esc(p.title),[{k:'staffId',l:'Staff member',t:'select',o:opts},{k:'total',l:'Agreed amount (₹)',t:'number',r:1},{k:'note',l:'Work / role on this project (optional)'}],{},async v=>{
    const s=db.staff.find(x=>x.id===v.staffId);if(!s)throw Error('Select a staff member');
    await setDoc(doc(fs,'staffPay',s.id+'_'+pid),{staffId:s.id,projectId:pid,projectTitle:p.title||'',note:(v.note||'').trim(),entries:[],createdAt:Date.now()});await setDoc(doc(fs,'staffPayAmt',s.id+'_'+pid),{total:+v.total||0});
    logAct('Project payment set '+inr(+v.total||0)+' — '+p.title+' → '+s.name,{staffId:s.id,projectId:pid,kind:'staffpay'});setTimeout(()=>projModal(pid),80)})};
/* flat ledger of every payment / expense, filterable by type; each row opens its dashboard */
let lf='';
const LF=[['','All'],['paid','Payments'],...SPC.map(c=>[c[0],c[1]])];
function ledger(l){
  const all=l.flatMap(d=>(d.entries||[]).map(e=>({e,d}))).filter(r=>!lf||r.e.kind===lf).sort((a,b)=>(b.e.date||'').localeCompare(a.e.date||'')||(b.e.at||0)-(a.e.at||0)),sum=all.reduce((n,r)=>n+(+r.e.amount||0),0);
  return`<div class="panel"><div class="lg-h"><h3>Payment ledger</h3><span class="pill ok">${all.length} entr${all.length===1?'y':'ies'} · ${inr(sum)}</span></div><div class="chips">${LF.map(c=>`<button type="button" class="chip ${lf===c[0]?'on':''}" data-lf="${c[0]}">${c[1]}</button>`).join('')}</div>${all.length?`<div class="table-wrap"><table class="mini splt lgt"><thead><tr><th>Date</th><th>Type</th><th>Project</th><th>Amount</th><th>Updated by</th></tr></thead><tbody>${all.map(r=>`<tr class="clk" data-spm="${r.d.id}"><td>${esc(r.e.date||'')}</td><td>${esc(spLbl(r.e.kind))}${r.e.note?`<br><small>${esc(r.e.note)}</small>`:''}</td><td>${esc(r.d.projectTitle||'Separate')}</td><td><b>${inr(r.e.amount)}</b></td><td>${esc(r.e.byName||'—')}<br><small>${fmtAt(r.e.at)}</small></td></tr>`).join('')}</tbody></table></div>`:empty('No entries for this filter.','receipt')}</div>`}

function wire(){
  const on=(a,fn)=>document.querySelectorAll(`[data-${a}]`).forEach(b=>b.onclick=e=>{e.preventDefault();fn(b.dataset[a])});
  const P=id=>db.projects.find(x=>x.id===id),C=id=>db.clients.find(x=>x.id===id),S=id=>db.staff.find(x=>x.id===id),R=id=>db.reqs.find(x=>x.id===id);
  on('pe',id=>editProject(P(id)));on('pd',delProject);on('pp',id=>addPayment(P(id)));on('pu',id=>undoPayment(P(id)));
  on('ee',id=>editEvent(db.events.find(x=>x.id===id)));on('ed',delEvent);on('es',id=>shareEvent(db.events.find(x=>x.id===id)));
  on('co',id=>{cid=id;go('client')});
  on('ce',id=>editClient(C(id)));on('cd',id=>delClient(C(id)));on('cw',id=>shareLogin(C(id),db.secrets[id]));
  on('so',id=>{sid=id;lf='';go('staffp')});on('se',id=>editStaff(S(id)));on('sd',id=>delStaff(S(id)));on('sw',id=>shareLogin(S(id),db.ssecrets[id],1));
  on('rr',id=>replyReq(R(id)));on('rd',id=>{const r=R(id);updateDoc(doc(fs,'staffRequests',id),{status:r.status==='done'?'open':'done'}).catch(x=>toast(nice(x)))});on('rx',id=>confirm('Delete this message?')&&deleteDoc(doc(fs,'staffRequests',id)).catch(x=>toast(nice(x))));
  on('cp',t=>copyText(t));on('pt',id=>termsModal(id));
  on('spx',v=>{const[i,m]=v.split('|');addSpEntry(i,m,inSp())});on('spd',delSpEntry);on('spe',id=>editSp(id,inSp()));on('spr',delSp);on('kpi',kpiOpen);on('bar',barOpen);on('spm',id=>spModal(id));on('pcm',id=>projModal(id));on('cgo',id=>{closeModal();cid=id;go('client')});on('lf',v=>{lf=v;render()});
  on('rp',id=>{const t=document.querySelector(`[data-pwcell="${id}"]`),s=t.dataset.shown==='1';t.textContent=s?'••••••':(db.secrets[id]||db.ssecrets[id]||'—');t.dataset.shown=s?'0':'1'});
  on('go',v=>go(v));
  on('copy',copyTip);on('de',id=>editDeliv(db.deliveries.find(x=>x.id===id)));on('dd',delDeliv);
  const rc=$('#rvCard');
  if(rc){rc.onclick=e=>{if(e.target.closest('[data-copy]'))return;window.open(reviewHref,'_blank','noopener')};rc.onkeydown=e=>{if(e.key==='Enter'&&e.target===rc)window.open(reviewHref,'_blank','noopener')}}
}

/* ---------- shell (sidebar + hamburger) shared by admin, staff and client ---------- */
const ADMIN_NAV=[['home','Dashboard','chart-pie'],['projects','Projects','camera-retro'],['events','Events','calendar-days'],['clients','Clients','users'],['staff','Staff','user-tie'],['spay','Staff Payments','wallet'],['activity','Activity log','clock-rotate-left']];
const CLIENT_NAV=[['home','Overview','house'],['projects','My Projects','camera-retro'],['events','My Events','calendar-days'],['payments','Payments','indian-rupee-sign'],['delivery','Photos & Videos','photo-film']];
const STAFF_NAV=[['home','My Work','briefcase'],['events','All My Events','calendar-days'],['pay','My Payments','wallet'],['contact','Message / Request','message']];
const TITLES={home:'Dashboard',projects:'Projects',events:'Events',clients:'Clients',client:'Client',staff:'Staff',staffp:'Staff',spay:'Staff Payments',activity:'Activity log',pay:'My Payments',payments:'Payments',delivery:'Photos & Videos',contact:'Message admin'};
function go(v){view=v;navOpen=false;window.scrollTo({top:0,behavior:'instant'});render()}
function setNav(o){navOpen=o;$('#side')?.classList.toggle('open',o);$('#scrim')?.classList.toggle('show',o);const t=$('#sideToggle');if(t){t.classList.toggle('active',o);t.setAttribute('aria-expanded',String(o))}document.body.classList.toggle('side-open',o)}
function shell(){
  const R=me.role,adm=R==='admin',nav=adm?ADMIN_NAV:R==='staff'?STAFF_NAV:CLIENT_NAV,cur=view==='client'?'clients':view==='staffp'?'staff':view,ph=adm?me.photo:(db.self||{}).photo;
  const label=adm?(me.full?'Full access · '+esc(me.title||'Staff'):'Admin console'):R==='staff'?((db.self||{}).role||'Staff')+' portal':'Client portal';
  const title=view==='home'?(adm?'Dashboard':R==='staff'?'My work':'Overview'):TITLES[view]||'';
  const openReq=adm?db.reqs.filter(r=>r.status!=='done').length:0;
  $('#app').innerHTML=`<div class="shell"><aside class="side ${navOpen?'open':''}" id="side" aria-label="Portal menu"><div class="side-top"><button class="side-close" id="sideClose" aria-label="Close menu">${ico('xmark')}</button><div class="side-user">${av(me.name,ph)}<div><small>${label}</small><b>${esc(me.name)}</b>${adm&&!me.full?'<button class="lnk" id="myPh">Edit studio profile</button>':''}</div></div></div>
  <nav class="side-nav">${nav.map(n=>`<button class="${cur===n[0]?'on':''}" data-go="${n[0]}">${ico(n[2])}<span>${n[1]}</span>${n[0]==='staff'&&openReq?`<em class="badge">${openReq}</em>`:''}</button>`).join('')}</nav>
  <div class="side-foot"><a href="index.html">${ico('globe')}<span>View website</span></a>${adm?'':`<a href="${WA}" target="_blank" rel="noopener">${ico('whatsapp','brands')}<span>Need help? WhatsApp</span></a>`}<button id="lo">${ico('right-from-bracket')}<span>Logout</span></button></div></aside>
  <div class="scrim ${navOpen?'show':''}" id="scrim"></div>
  <div class="pcol"><div class="pbar"><button class="pbar-toggle ${navOpen?'active':''}" id="sideToggle" aria-label="Open portal menu" aria-expanded="${navOpen}"><span></span><span></span><span></span></button><div class="pbar-title"><small>${adm?'Admin':R==='staff'?'Staff portal':'Client portal'}</small><b>${title}</b></div><div class="pbar-user">${av(me.name,ph,'sm')}<span class="pbar-name">${esc(me.name)}</span></div></div><main id="main" class="pmain"></main></div></div>`;
  $('#sideToggle').onclick=()=>setNav(!navOpen);$('#scrim').onclick=()=>setNav(false);$('#sideClose').onclick=()=>setNav(false);$('#lo').onclick=()=>signOut(auth);
  const mp=$('#myPh');if(mp)mp.onclick=myProfile;
  document.body.classList.toggle('side-open',navOpen);
}

/* ---------- admin views ---------- */
function adminView(){
  shell();
  ({home,projects,events,clients,client:clientPage,staff:staffList,staffp:staffPage,spay:staffPayView,activity:activityView})[view]();wire();
}
function home(){
  const t=tot(db.projects),td=todayS(),ym=td.slice(0,7);
  const up=db.events.filter(e=>e.date>=td&&e.status!=='Cancelled'&&!isDone(e)).sort(evSort);
  const ms=[...Array(6)].map((_,i)=>{const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-5+i);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')});
  const due={};db.projects.forEach(p=>{const x=pay(p).due;if(x)due[p.clientId]=(due[p.clientId]||0)+x});
  const dl=Object.entries(due).sort((a,b)=>b[1]-a[1]).slice(0,5),ty=TYPES.map(s=>[s,db.events.filter(e=>etypes(e).includes(s)).length]).filter(r=>r[1]).sort((a,b)=>b[1]-a[1]).slice(0,6);
  $('#main').innerHTML=`<div class="top"><div><p class="eyebrow">Overview</p><h1>Studio dashboard</h1></div><div class="row-actions"><button class="btn btn-gold sm" data-go="clients">${ico('user-plus')} New client</button></div></div>
  <div class="stats">${stat('Clients',db.clients.length,1,'users','a:clients')}${stat('Projects',db.projects.length,0,'camera-retro','a:projects')}${stat('Events this month',db.events.filter(e=>(e.date||'').startsWith(ym)).length,0,'calendar-check','a:evmonth')}${stat('Upcoming events',up.length,0,'calendar-days','a:evup')}${stat('Total billed',inr(t.total),0,'file-invoice','a:billed')}${stat('Received',inr(t.paid),0,'circle-check','a:recv')}${stat('Payment pending',inr(t.due),1,'hourglass-half','a:pend')}${stat('Collection rate',(t.total?Math.round(t.paid/t.total*100):0)+'%',0,'chart-line','a:rate')}</div>
  <div class="grid2"><div class="panel"><h3>Events per month</h3>${bars(ms.map(m=>[mLabel(m),db.events.filter(e=>(e.date||'').startsWith(m)).length,m]),'month')}</div><div class="panel"><h3>Events by status</h3>${bars(EST.map(s=>[s,db.events.filter(e=>e.status===s).length]),'status')}</div></div>
  <div class="grid2"><div class="panel"><h3>Top pending payments</h3>${dl.length?`<table class="mini">${dl.map(r=>`<tr><td><a href="#" data-co="${r[0]}">${esc(cname(r[0]))}</a></td><td class="r">${pill(inr(r[1]),'warn')}</td></tr>`).join('')}</table>`:empty('No pending payments.','circle-check')}</div><div class="panel"><h3>Events by type</h3>${ty.length?bars(ty,'type'):empty('Add events to see this chart.','chart-simple')}</div></div>
  ${heading('Upcoming events',up.length>6?`<button class="btn sm outline" data-go="events">View all</button>`:'')}${cards(up.slice(0,6),e=>evCard(e,1),'No upcoming events.','calendar-days')}${actPanel(6)}`;
}

const sel=(id,label,opts,val)=>`<label class="f"><small>${label}</small><select id="${id}">${opts.map(o=>`<option value="${esc(o[0])}" ${o[0]===val?'selected':''}>${esc(o[1])}</option>`).join('')}</select></label>`;
const clientOpts=()=>[['','All clients'],...db.clients.map(c=>[c.id,c.name]).sort((a,b)=>a[1].localeCompare(b[1]))];

/* ---- projects (with filters) ---- */
const PF0={q:'',status:'',client:'',service:'',pay:''};let pf={...PF0};
function projFiltered(){const s=pf.q.toLowerCase();
  return db.projects.filter(p=>{
    if(pf.status&&p.status!==pf.status)return false;
    if(pf.client&&!owners(p).includes(pf.client))return false;
    if(pf.service){const std=SERV.includes(p.service)&&p.service!=='Other';if(pf.service==='Other'?std:p.service!==pf.service)return false}
    const x=pay(p);
    if(pf.pay==='due'&&!(x.due>0))return false;
    if(pf.pay==='paid'&&!(x.total>0&&x.due===0))return false;
    if(s&&![p.title,p.details,p.deliverables,p.service,p.funcDates,ownerNames(p)].join(' ').toLowerCase().includes(s))return false;
    return true}).sort((a,b)=>(b.startDate||'').localeCompare(a.startDate||''))}
function fillProj(){const l=projFiltered();
  $('#pjcount').textContent=`${l.length} of ${db.projects.length} project${db.projects.length===1?'':'s'}`;
  $('#pjlist').innerHTML=cards(l,p=>projCard(p,1),db.projects.length?'No project matches these filters.':'No projects yet. Use “Add project” to create one.','camera-retro');wire()}
function projects(){
  $('#main').innerHTML=`<div class="top"><div><p class="eyebrow">Manage</p><h1>Projects</h1></div><button class="btn btn-gold sm" id="add">${ico('plus')} Add project</button></div>
  <div class="fbar"><label class="f grow"><small>Search</small><div class="field search">${ico('magnifying-glass')}<input id="fq" type="search" placeholder="Project, client, deliverables" value="${esc(pf.q)}"></div></label>
  ${sel('fs','Status',[['','All'],['Ongoing','Ongoing'],['Completed','Completed']],pf.status)}${sel('fc','Client',clientOpts(),pf.client)}${sel('fv','Service',[['','All'],...SERV.map(x=>[x,x])],pf.service)}${sel('fy','Payment',[['','All'],['due','Payment pending'],['paid','Fully paid']],pf.pay)}
  <button class="btn sm outline" id="fx">${ico('filter-circle-xmark')} Clear</button></div>
  <div class="fcount" id="pjcount"></div><div id="pjlist"></div>`;
  $('#add').onclick=()=>addProject();
  $('#fq').oninput=e=>{pf.q=e.target.value;fillProj()};
  [['fs','status'],['fc','client'],['fv','service'],['fy','pay']].forEach(([id,k])=>$('#'+id).onchange=e=>{pf[k]=e.target.value;fillProj()});
  $('#fx').onclick=()=>{pf={...PF0};projects();wire()};
  fillProj();
}

/* ---- events (with filters, grouped by date; completed events at the bottom) ---- */
const EF0={q:'',when:'',month:'',date:'',status:'',type:'',client:'',project:'',sort:'asc'};let ef={...EF0};
function evFiltered(){
  const td=todayS(),wk=new Date();wk.setDate(wk.getDate()+7);const w=wk.toLocaleDateString('en-CA'),s=ef.q.toLowerCase();
  return db.events.filter(e=>{
    const d=e.date||'';
    if(ef.date&&d!==ef.date)return false;
    if(!ef.date&&ef.month&&!d.startsWith(ef.month))return false;
    if(ef.status&&e.status!==ef.status)return false;
    if(ef.type&&!etypes(e).includes(ef.type))return false;
    if(ef.client&&!(e.clientIds||[e.clientId]).includes(ef.client))return false;
    if(ef.project&&e.projectId!==ef.project)return false;
    if(ef.when==='today'&&d!==td)return false;
    if(ef.when==='upcoming'&&!(d>=td))return false;
    if(ef.when==='week'&&!(d>=td&&d<=w))return false;
    if(ef.when==='past'&&!(d<td))return false;
    if(s&&![e.type,e.place,e.team,e.contact,e.notes,cname(e.clientId),pname(e.projectId)].join(' ').toLowerCase().includes(s))return false;
    return true}).sort((a,b)=>ef.sort==='desc'?evSort(b,a):evSort(a,b))}
function fillEv(){
  const l=evFiltered();
  $('#evcount').textContent=`${l.length} of ${db.events.length} event${db.events.length===1?'':'s'} · ${l.filter(isDone).length} completed`;
  $('#evlist').innerHTML=l.length?evSplit(l,1):empty(db.events.length?'No event matches these filters.':'No events yet.','calendar-days');
  wire();
}
function events(){
  const pj=[['','All projects'],...db.projects.filter(p=>!ef.client||owners(p).includes(ef.client)).map(p=>[p.id,p.title])];
  $('#main').innerHTML=`<div class="top"><div><p class="eyebrow">Schedule</p><h1>Events</h1></div><button class="btn btn-gold sm" id="add">${ico('plus')} Add event</button></div>
  <div class="fbar"><label class="f grow"><small>Search</small><div class="field search">${ico('magnifying-glass')}<input id="fq" type="search" placeholder="Venue, team, client, notes" value="${esc(ef.q)}"></div></label>
  ${sel('fw','When',[['','All dates'],['today','Today'],['week','Next 7 days'],['upcoming','Upcoming'],['past','Past']],ef.when)}
  <label class="f"><small>Exact date</small><input type="date" id="fd" value="${esc(ef.date)}"></label>
  <label class="f"><small>Month</small><input type="month" id="fm" value="${esc(ef.month)}"></label>
  ${sel('fs','Status',[['','All'],...EST.map(x=>[x,x])],ef.status)}${sel('ft','Event type',[['','All'],...TYPES.map(x=>[x,x])],ef.type)}${sel('fc','Client',clientOpts(),ef.client)}${sel('fp','Project',pj,ef.project)}
  ${sel('fo','Sort',[['asc','Oldest first'],['desc','Newest first']],ef.sort)}
  <button class="btn sm outline" id="fx">${ico('filter-circle-xmark')} Clear</button></div>
  <div class="fcount" id="evcount"></div><div id="evlist"></div>`;
  $('#add').onclick=()=>addEvent();
  $('#fq').oninput=e=>{ef.q=e.target.value;fillEv()};
  [['fw','when'],['fd','date'],['fm','month'],['fs','status'],['ft','type'],['fc','client'],['fp','project'],['fo','sort']].forEach(([id,k])=>$('#'+id).onchange=e=>{ef[k]=e.target.value;if(k==='client')ef.project='';events();wire()});
  $('#fx').onclick=()=>{ef={...EF0};events();wire()};
  fillEv();
}
const cpBtn=(t,l)=>`<button class="lnk" data-cp="${esc(t)}" aria-label="Copy ${l}" title="Copy ${l}">${ico('copy','regular')}</button>`;
function clients(){
  const list=db.clients.filter(c=>!q||(c.name+' '+c.phone).toLowerCase().includes(q.toLowerCase()));
  $('#main').innerHTML=`<div class="top"><div><p class="eyebrow">People</p><h1>Clients</h1></div><div class="filter"><div class="field search">${ico('magnifying-glass')}<input id="qs" type="search" placeholder="Search name or number" value="${esc(q)}" aria-label="Search clients"></div><button class="btn btn-gold sm" id="add">${ico('user-plus')} Add client</button></div></div>
  <div class="panel flush">${list.length?`<div class="table-wrap"><table><thead><tr><th>Name</th><th>Login number</th><th>Password</th><th>Verification</th><th>Projects</th><th>Pending</th><th></th></tr></thead><tbody>${list.map(c=>`<tr><td><a href="#" data-co="${c.id}"><b>${esc(c.name)}</b></a></td><td>${esc(c.phone)} ${cpBtn(c.phone,'number')}</td><td><code data-pwcell="${c.id}" data-shown="0">••••••</code> <button class="lnk" data-rp="${c.id}" aria-label="Show or hide password">${ico('eye')}</button> ${cpBtn(db.secrets[c.id]||'','password')}</td><td>${c.verified?pill('Verified','ok'):pill('Pending','warn')}</td><td>${db.projects.filter(p=>owners(p).includes(c.id)).length}</td><td>${inr(tot(db.projects.filter(p=>owners(p).includes(c.id))).due)}</td><td><div class="row-actions">${btn('co',c.id,'Open')}${btn('cd',c.id,'Delete','trash')}</div></td></tr>`).join('')}</tbody></table></div>`:empty(db.clients.length?'No client matches your search.':'No clients yet. Use “Add client”, enter a mobile number and a password is generated for you.','users')}</div>`;
  $('#add').onclick=addClient;
  const qs=$('#qs');qs.oninput=e=>{q=e.target.value;const p=e.target.selectionStart;render();const n=$('#qs');n.focus();n.setSelectionRange(p,p)};
}
function clientPage(){
  const c=db.clients.find(x=>x.id===cid);if(!c){view='clients';return render()}
  const ps=db.projects.filter(p=>owners(p).includes(c.id)),es=db.events.filter(e=>(e.clientIds||[e.clientId]).includes(c.id)).sort(evSort),ds=db.deliveries.filter(x=>x.clientId===c.id).sort(delivSort),t=tot(ps);
  $('#main').innerHTML=`<button class="btn sm outline back" data-go="clients">${ico('arrow-left')} All clients</button><div class="top"><div class="who-box">${av(c.name,c.photo,'lg')}<div><h1>${esc(c.name)}</h1><p>${c.verified?pill('Verified','ok'):pill('Verification pending','warn')}</p></div></div><div class="row-actions">${btn('cw',c.id,'Send login on WhatsApp','whatsapp').replace('fa-solid fa-whatsapp','fa-brands fa-whatsapp')}${btn('ce',c.id,'Edit client','pen')}${c.verified?'<button class="btn sm outline" id="rv">Ask to re-verify</button>':''}${btn('cd',c.id,'Delete','trash')}</div></div>
  <div class="stats s4">${stat('Projects',ps.length,1,'camera-retro')}${stat('Billed',inr(t.total),0,'file-invoice')}${stat('Paid',inr(t.paid),0,'circle-check')}${stat('Pending',inr(t.due),1,'hourglass-half')}</div>
  <div class="panel"><h3>Client details</h3><div class="kvs">${kv('Login number',c.phone)}${kv('Password',db.secrets[c.id])}${kv('Alternate / WhatsApp',c.altPhone)}${kv('Email',c.email)}${kv('Address',c.address)}${kv('Verified Google account',c.googleEmail)}${kv('Verified on',c.verifiedAt?new Date(c.verifiedAt).toLocaleDateString('en-IN'):'')}${c.link?`<div><small>Delivery link</small><a href="${esc(c.link)}" target="_blank" rel="noopener">Open link</a></div>`:''}${kv('Private note',db.notes[c.id])}</div>
  <div class="row-actions mt"><button class="btn sm outline" data-cp="${esc(c.phone)}">${ico('copy','regular')} Copy number</button><button class="btn sm outline" data-cp="${esc(db.secrets[c.id]||'')}">${ico('copy','regular')} Copy password</button></div></div>
  ${heading('Delivery links',`<button class="btn sm btn-gold" id="adl">${ico('plus')} Add delivery card</button>`)}${ds.length?`<div class="dgrid">${ds.map(x=>delivCard(x,1)).join('')}</div>`:empty('No delivery cards yet. Add Pre-wedding, Wedding, Haldi, Mehendi etc. with a link and a preview photo.','photo-film')}
  ${heading('Projects',`<button class="btn sm btn-gold" id="ap">${ico('plus')} Add project</button>`)}${cards(ps,p=>projCard(p,1),'This client has no projects yet.','camera-retro')}
  ${heading('Events',`<button class="btn sm btn-gold" id="ae">${ico('plus')} Add event</button>`)}${es.length?evSplit(es,1):empty('No events yet.','calendar-days')}
  <div class="panel mt"><h3>Payment history</h3>${payLog(ps,1)}</div><div class="panel mt"><h3>Client activity</h3>${actList(40,a=>a.clientId===c.id)}</div>`;
  $('#ap').onclick=()=>addProject({ownerIds:[c.id]});$('#adl').onclick=()=>addDeliv(c.id);$('#ae').onclick=()=>addEvent({projectId:ps[0]?.id||''});
  const rv=$('#rv');if(rv)rv.onclick=()=>updateDoc(doc(fs,'clients',c.id),{verified:false}).then(()=>toast('The client will need to verify again')).catch(x=>toast(nice(x)));
}

/* ---- staff (admin side) ---- */
function staffList(){
  const open=db.reqs.filter(r=>r.status!=='done').sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)),done=db.reqs.filter(r=>r.status==='done').sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).slice(0,6);
  $('#main').innerHTML=`<div class="top"><div><p class="eyebrow">Team</p><h1>Staff</h1></div>${me.full?'':`<button class="btn btn-gold sm" id="add">${ico('user-plus')} Add staff</button>`}</div>
  ${heading('Messages &amp; access requests'+(open.length?` (${open.length} open)`:''))}${open.length?`<div class="cards">${open.map(r=>reqCard(r,1)).join('')}</div>`:empty('No open messages from staff.','message')}
  ${done.length?`<details class="mt"><summary class="lnk">Recently completed (${done.length})</summary><div class="cards mt">${done.map(r=>reqCard(r,1)).join('')}</div></details>`:''}
  ${heading('Team members')}<div class="panel flush">${db.staff.length?`<div class="table-wrap"><table><thead><tr><th>Name</th><th>Role</th><th>Login number</th><th>Password</th><th>Projects</th><th>Access</th><th></th></tr></thead><tbody>${[...db.staff].sort((a,b)=>(a.name||'').localeCompare(b.name||'')).map(s=>`<tr><td><a href="#" data-so="${s.id}"><b>${esc(s.name)}</b></a></td><td>${pill(s.role||'Staff')}</td><td>${esc(s.phone)} ${cpBtn(s.phone,'number')}</td><td>${me.full?'—':`<code data-pwcell="${s.id}" data-shown="0">••••••</code> <button class="lnk" data-rp="${s.id}" aria-label="Show or hide password">${ico('eye')}</button> ${cpBtn(db.ssecrets[s.id]||'','password')}`}</td><td>${(s.projectIds||[]).filter(id=>db.projects.some(p=>p.id===id)).length}</td><td>${s.active===false?pill('Paused','bad'):s.access==='full'?pill('Full access','dark'):pill('Limited','ok')}</td><td><div class="row-actions">${btn('so',s.id,'Open')}${me.full?'':btn('sd',s.id,'Delete','trash')}</div></td></tr>`).join('')}</tbody></table></div>`:empty('No staff yet. Use “Add staff”, enter a mobile number, choose a role and the projects they may see.','user-tie')}</div>`;
  const ad=$('#add');if(ad)ad.onclick=addStaff;
}
function staffPage(){
  const s=db.staff.find(x=>x.id===sid);if(!s){view='staff';return render()}
  const ids=s.projectIds||[],ps=db.projects.filter(p=>ids.includes(p.id)),es=db.events.filter(e=>ids.includes(e.projectId)).sort(evSort),rq=db.reqs.filter(r=>r.staffId===s.id).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  const sp=db.staffPay.filter(x=>x.staffId===s.id).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  $('#main').innerHTML=`<button class="btn sm outline back" data-go="staff">${ico('arrow-left')} All staff</button><div class="top"><div class="who-box">${av(s.name,s.photo,'lg')}<div><h1>${esc(s.name)}</h1><p>${pill(s.role||'Staff')} ${s.active===false?pill('Paused','bad'):s.access==='full'?pill('Full access','dark'):pill('Limited','ok')}</p></div></div>${me.full?'':`<div class="row-actions">${btn('sw',s.id,'Send login on WhatsApp','whatsapp').replace('fa-solid fa-whatsapp','fa-brands fa-whatsapp')}${btn('se',s.id,'Edit / access','pen')}${btn('sd',s.id,'Delete','trash')}</div>`}</div>
  <div class="panel"><h3>Staff details</h3><div class="kvs">${kv('Login number',s.phone)}${kv('Password',db.ssecrets[s.id])}${kv('Alternate / WhatsApp',s.altPhone)}${kv('Role',s.role)}${kv('Access',s.access==='full'?'Full access':'Limited')}${me.full?'':kv('Private note',db.notes[s.id])}</div>
  <div class="row-actions mt"><button class="btn sm outline" data-cp="${esc(s.phone)}">${ico('copy','regular')} Copy number</button>${me.full?'':`<button class="btn sm outline" data-cp="${esc(db.ssecrets[s.id]||'')}">${ico('copy','regular')} Copy password</button>`}</div></div>
  ${heading('Projects this person can see')}<div class="panel">${ps.length?`<table class="mini">${ps.map(p=>`<tr><td><b>${esc(p.title)}</b></td><td class="r">${esc(ownerNames(p))}</td></tr>`).join('')}</table>`:empty('No projects assigned. Use “Edit / access” to choose projects.','camera-retro')}</div>
  ${heading('Payment dashboard',`<div class="row-actions"><button class="btn sm btn-gold" id="asa">${ico('plus')} Add payment / expense</button><button class="btn sm outline" id="asp">${ico('file-invoice')} Add project amount</button></div>`)}${spStats(spTotals(sp),s.id)}${ledger(sp,1)}${heading('Project-wise payments')}${cards(sp,d=>spCard(d,1),'No project payments yet. Use “Add project payment”, choose a project and the agreed amount; then add payments and expenses (team, editing, travelling, other).','wallet')}
  ${heading('Events they can see')}${cards(es,e=>evCard(e,1),'No events in the assigned projects yet.','calendar-days')}
  ${heading('Messages from '+esc(s.name))}${rq.length?`<div class="cards">${rq.map(r=>reqCard(r,1)).join('')}</div>`:empty('No messages yet.','message')}
  ${heading('Activity of '+esc(s.name))}<div class="panel">${actList(40,a=>a.staffId===s.id||a.by===s.id)}</div>`;
  const asp=$('#asp');if(asp)asp.onclick=()=>assignSp(s.id);const asa=$('#asa');if(asa)asa.onclick=()=>addSpAny(s.id);
}

/* ---- staff payments overview (admin): every staff, every project ---- */
function staffPayView(){
  const rows=[...db.staff].sort((a,b)=>(a.name||'').localeCompare(b.name||'')).map(s=>{const l=db.staffPay.filter(x=>x.staffId===s.id);return{s,n:l.length,...spTotals(l)}});
  const g=spTotals(db.staffPay),pr={};
  db.staffPay.forEach(d=>{const k=d.projectId,x=spSum(d),r=pr[k]||(pr[k]={t:d.projectTitle||pname(k),total:0,paid:0,due:0,spent:0,n:0,id:k,c:{team:0,editing:0,travel:0,photography:0,other:0}});r.total+=x.total;r.paid+=x.paid;r.due+=x.due;r.spent+=x.spent;r.n++;x.cats.forEach(c=>r.c[c[0]]+=c[2])});
  const pl=Object.values(pr).sort((a,b)=>b.spent-a.spent);
  $('#main').innerHTML=`<div class="top"><div><p class="eyebrow">Team accounts</p><h1>Staff payments</h1></div></div>${spStats(g)}
  ${heading('Staff-wise')}<div class="panel flush">${rows.length?`<div class="table-wrap"><table><thead><tr><th>Staff</th><th>Projects</th><th>Agreed</th><th>Paid</th><th>Pending</th><th>Expenses</th><th></th></tr></thead><tbody>${rows.map(r=>`<tr><td><a href="#" data-so="${r.s.id}"><b>${esc(r.s.name)}</b></a><br><small>${esc(r.s.role||'Staff')}</small></td><td>${r.n}</td><td>${inr(r.total)}</td><td>${inr(r.paid)}</td><td>${r.due?pill(inr(r.due),'warn'):pill('Clear','ok')}</td><td>${inr(r.spent)}</td><td><div class="row-actions">${btn('so',r.s.id,'Open payments','wallet')}</div></td></tr>`).join('')}</tbody></table></div>`:empty('No staff yet. Add staff first, then add project payments inside each staff page.','user-tie')}</div>
  ${heading('Project-wise cost')}<div class="panel flush">${pl.length?`<div class="table-wrap"><table><thead><tr><th>Project</th><th>Staff</th><th>Agreed</th><th>Paid</th><th>Pending</th><th>Team</th><th>Editing</th><th>Travel</th><th>Photography</th><th>Other</th></tr></thead><tbody>${pl.map(r=>`<tr><td>${r.id?`<a href="#" data-pcm="${r.id}"><b>${esc(r.t)}</b></a>`:`<b>${esc(r.t)}</b>`}</td><td>${r.n}</td><td>${inr(r.total)}</td><td>${inr(r.paid)}</td><td>${inr(r.due)}</td><td>${inr(r.c.team)}</td><td>${inr(r.c.editing)}</td><td>${inr(r.c.travel)}</td><td>${inr(r.c.photography)}</td><td>${inr(r.c.other)}</td></tr>`).join('')}</tbody></table></div>`:empty('No project payments yet.','wallet')}</div>`;
}
function activityView(){
  $('#main').innerHTML=`<div class="top"><div><p class="eyebrow">Record</p><h1>Activity log</h1></div></div><p class="fcount">Every change by admin, full-access staff and staff — with who did it and when. Records cannot be edited.</p><div class="panel">${actList(400)}</div>`;
}

/* ---------- staff portal: assigned events only, no prices, no client contact ---------- */
function staffPayHtml(){const l=[...db.staffPay].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  return`<div class="top"><div><p class="eyebrow">Accounts</p><h1>My payments</h1></div></div>${spStats(spTotals(l),'',false)}<p class="fcount">Tap any number or row to open its details. You can add your own expenses; every entry shows who added it and when.</p>${ledger(l,0)}${cards(l,d=>spCard(d,0),'No project payment has been added for you yet.','wallet')}`}
function staffView(){
  const s=db.self;if(!s){$('#app').innerHTML='<div class="portal-loading"><span class="spinner"></span></div>';return}
  shell();
  const es=[...db.events].sort(evSort),td=todayS(),up=es.filter(e=>e.date>=td&&e.status!=='Cancelled'&&!isDone(e)),ym=td.slice(0,7);
  const reqs=[...db.reqs].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  const stats=`<div class="stats s4">${stat('Assigned events',es.length,1,'calendar-days','s:ev')}${stat('Upcoming',up.length,0,'calendar-check','s:ev')}${stat('This month',es.filter(e=>(e.date||'').startsWith(ym)).length,0,'calendar-week','s:ev')}${stat('Role',esc(s.role||'Staff'),0,'user-tie')}</div>`;
  const body={
    home:()=>`<div class="top"><div><p class="eyebrow">${esc(s.role||'Staff')}</p><h1>Hello, ${esc(s.name)}</h1></div></div>${stats}${up[0]?`<div class="panel next"><h3>Your next event</h3>${evCard(up[0],2)}</div>`:''}${heading('Upcoming events',up.length>6?`<button class="btn sm outline" data-go="events">View all</button>`:'')}${cards(up.slice(0,6),e=>evCard(e,2),'No upcoming events assigned to you yet.','calendar-days')}`,
    events:()=>`<div class="top"><div><p class="eyebrow">Schedule</p><h1>All my events</h1></div></div>${es.length?evSplit(es,2):empty('No events assigned to you yet.','calendar-days')}`,
    pay:()=>staffPayHtml(),
    contact:()=>`<div class="top"><div><p class="eyebrow">Studio</p><h1>Message / request</h1></div></div><div class="panel"><h3>Write to the studio</h3><p class="hint" style="margin-top:0">Tell the studio something, or ask for access to a project.</p><textarea id="rt" rows="5" maxlength="1000" placeholder="Type your message here...">${esc(draft)}</textarea><div class="row-actions mt"><button class="btn btn-gold sm" id="rs">${ico('paper-plane')} Send to admin</button></div></div>${heading('Your messages')}${reqs.length?`<div class="cards">${reqs.map(r=>reqCard(r,0)).join('')}</div>`:empty('You have not sent any message yet.','message')}`
  };
  $('#main').innerHTML=(body[view]||body.home)();wire();
  const rt=$('#rt');if(rt){rt.oninput=()=>draft=rt.value;
    $('#rs').onclick=async()=>{const t=rt.value.trim();if(!t)return toast('Please type your message');
      try{await addDoc(collection(fs,'staffRequests'),{staffId:me.uid,name:s.name,role:s.role||'Staff',text:t.slice(0,1000),status:'open',createdAt:Date.now()});draft='';toast('Sent to admin')}catch(x){toast(nice(x))}}}
}

/* ---------- client portal (view only) + one-time Google verification ---------- */
function verifyView(){
  const c=db.self;
  $('#app').innerHTML=`<section class="auth"><div class="auth-art"><div class="auth-art-in"><p class="eyebrow">One-time check</p><h1>Confirm it's <em>really you.</em></h1><p class="lead">Verify once with your Google account. This makes sure the login is only used by you.</p></div></div><div class="auth-form"><div class="card-auth"><p class="eyebrow">Step 1 of 1</p><h2>Verify your account</h2><p class="mt-s">Mobile: <b>${esc(c.phone)}</b></p><div class="err" id="err" role="alert"></div><button class="btn btn-gold full" id="gv">${ico('google','brands')}&nbsp; Verify with Google</button><p class="hint">We never see your Google password. Only your email is confirmed.</p><p class="hint"><button class="lnk" id="lo">${ico('right-from-bracket')} Logout</button></p></div></div></section>`;
  $('#lo').onclick=()=>signOut(auth);
  $('#gv').onclick=async()=>{const u=auth.currentUser,pr=new GoogleAuthProvider();
    try{const linked=u.providerData.some(p=>p.providerId==='google.com');
      const r=linked?await reauthenticateWithPopup(u,pr):await linkWithPopup(u,pr);
      await u.getIdToken(true);
      const g=r.user.providerData.find(p=>p.providerId==='google.com');
      await updateDoc(doc(fs,'clients',me.uid),{verified:true,verifiedAt:Date.now(),googleEmail:g?g.email:''});
    }catch(x){const k=x.code||'';$('#err').textContent=/credential-already-in-use/.test(k)?'This Google account is already linked to another client.':/user-mismatch/.test(k)?'Please use the same Google account you verified with earlier.':/popup/.test(k)?'The popup was closed or blocked. Please try again.':nice(x)}};
}
function clientView(){
  const c=db.self;if(!c){$('#app').innerHTML='<div class="portal-loading"><span class="spinner"></span></div>';return}
  if(!c.verified)return verifyView();
  shell();
  const ps=db.projects,es=[...db.events].sort(evSort),t=tot(ps),upc=es.filter(e=>!isDone(e)&&e.status!=='Cancelled');
  const delivery=c.link?`<div class="delivery">${ico('photo-film')}<div><h3>Your photos &amp; videos are ready</h3><p>Open your private delivery link to view and download everything.</p></div><a class="btn btn-gold" href="${esc(c.link)}" target="_blank" rel="noopener">Open delivery link</a></div>`:`<div class="delivery soon">${ico('hourglass-half')}<div><h3>Delivery link not ready yet</h3><p>It will appear here as soon as your photos and films are delivered.</p></div></div>`;
  const ds=[...db.deliveries].sort(delivSort),dview=ds.length?`<div class="sec-h"><h3>Your photos &amp; videos</h3></div><div class="dgrid">${ds.map(x=>delivCard(x,0)).join('')}</div>`:delivery;
  const stats=`<div class="stats s4">${stat('Projects',ps.length,1,'camera-retro')}${stat('Total',inr(t.total),0,'file-invoice')}${stat('Paid',inr(t.paid),0,'circle-check')}${stat('Pending',inr(t.due),1,'hourglass-half')}</div>`;
  const body={
    home:()=>`<div class="top"><div><p class="eyebrow">Client portal</p><h1>Hello, ${esc(c.name)}</h1></div></div>${stats}
      ${upc.length?heading('Upcoming events',upc.length>3?`<button class="btn sm outline" data-go="events">View all</button>`:'')+cards(upc.slice(0,3),e=>evCard(e,0)):''}${dview}${reviewCard()}
      ${heading('Your projects',ps.length>2?`<button class="btn sm outline" data-go="projects">View all</button>`:'')}${cards(ps.slice(0,2),p=>projCard(p,0),'Your project has not been added yet.','camera-retro')}${studioCard()}`,
    projects:()=>`<div class="top"><div><p class="eyebrow">Overview</p><h1>My projects</h1></div></div>${cards(ps,p=>projCard(p,0),'Your project has not been added yet.','camera-retro')}`,
    events:()=>`<div class="top"><div><p class="eyebrow">Schedule</p><h1>My events</h1></div></div>${es.length?evSplit(es,0):empty('No events scheduled yet.','calendar-days')}`,
    payments:()=>`<div class="top"><div><p class="eyebrow">Billing</p><h1>Payments</h1></div></div>${stats}<div class="panel mt"><h3>Payment history</h3>${payLog(ps)}</div>`,
    delivery:()=>`<div class="top"><div><p class="eyebrow">Delivery</p><h1>Photos &amp; videos</h1></div></div>${dview}${reviewCard()}<div class="panel mt"><h3>Your account</h3><div class="kvs">${kv('Name',c.name)}${kv('Mobile',c.phone)}${kv('Email',c.email)}${kv('Verified Google account',c.googleEmail)}</div></div>${studioCard()}`
  };
  $('#main').innerHTML=(body[view]||body.home)();wire();
}
function render(){
  const y=window.scrollY;
  document.body.classList.toggle('in-portal',!!me&&(me.role==='admin'||me.role==='staff'||db.self?.verified));
  if(!me)authView();else if(me.role==='admin')adminView();else if(me.role==='staff')staffView();else clientView();
  const yr=$('#year');if(yr)yr.textContent=new Date().getFullYear();
  if(y&&me)window.scrollTo({top:y,behavior:'instant'});
  const mm=$('#modal');if(me&&mm&&!mm.hidden&&mm.dataset.term)termsModal(mm.dataset.term,true);else if(me&&mm&&!mm.hidden&&mm.dataset.sp)spModal(mm.dataset.sp,true);else if(me&&mm&&!mm.hidden&&mm.dataset.pj)projModal(mm.dataset.pj,true);   // keep an open payment tracker live
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&navOpen)setNav(false)});
if(!ready)render();