/* =========================================================
   SHUBHAM PRODUCTION — Client & Admin Portal (login.html)
   The site header / footer are plain HTML in login.html.
   This file only renders what sits between them:
   login screen -> client portal -> admin dashboard.
   ========================================================= */
import {initializeApp,deleteApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut,updatePassword,deleteUser,GoogleAuthProvider,linkWithPopup,reauthenticateWithPopup,setPersistence,browserSessionPersistence,browserLocalPersistence} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore,collection,doc,getDoc,addDoc,updateDoc,deleteDoc,onSnapshot,query,where,writeBatch} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ====== Firebase config (Firebase console > Project settings > Your apps > Web app) ====== */
const firebaseConfig={apiKey:"AIzaSyDKAU2yXKvGUV6EvO1xrPp2MGP_IpUkYqo",authDomain:"shubhamproduction-540e8.firebaseapp.com",projectId:"shubhamproduction-540e8",storageBucket:"shubhamproduction-540e8.firebasestorage.app",messagingSenderId:"84744399932",appId:"1:84744399932:web:d05e6a0367d2b35d9f6739"};
/* ========================================================================================= */

/* ====== GOOGLE REVIEW LINK ======
   Google Business Profile > "Ask for reviews" / "Get more reviews" > copy the link
   (looks like https://g.page/r/XXXXXXXX/review) and paste it below. */
const REVIEW_URL='https://g.page/r/PASTE_YOUR_REVIEW_LINK/review';
/* ================================= */

const $=s=>document.querySelector(s),IDLE=5*60*1000,LAST='sp_last'; // localStorage only keeps the last admin activity time
const ready=!firebaseConfig.apiKey.startsWith('PASTE');
const fbApp=ready?initializeApp(firebaseConfig):null,auth=ready?getAuth(fbApp):null,fs=ready?getFirestore(fbApp):null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inr=n=>'₹'+Number(n||0).toLocaleString('en-IN');
const genPass=()=>Math.random().toString(36).slice(2,6).toUpperCase()+Math.floor(1000+Math.random()*9000);
const em=p=>p.replace(/\D/g,'')+'@client.sp.app';
const toast=m=>{const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2800)};
const WA_NUMBER='918802389087';
const WA='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent('Hello Shubham Production, I need help with the client portal.');
const PAGE=location.href.split('#')[0].split('?')[0];
const reviewHref=REVIEW_URL.includes('PASTE')?'https://www.google.com/search?q='+encodeURIComponent('Shubham Production Faridabad reviews'):REVIEW_URL;
const REVIEW_TIPS=[
  'Shubham Production captured our wedding beautifully. The team was friendly, punctual and never made us feel awkward in front of the camera. Every emotion is there in our photos — highly recommended!',
  'Loved our pre-wedding shoot and the final delivery. The photos were edited with great detail and delivered on time. Thank you Shubham Production for making our memories timeless.'
];

let me=null,view='home',mode='login',month='',idleT,unsubs=[],setupDone=true,signingUp=false,authErr='',navOpen=false,q='';
let db={clients:[],projects:[],events:[],deliveries:[],secrets:{},notes:{},self:null};
const cname=id=>(db.clients.find(c=>c.id===id)||{}).name||'—';
const pay=p=>{const t=+p.amount||0,pd=(p.payments||[]).reduce((a,x)=>a+(+x.amount||0),0);return{total:t,paid:pd,due:Math.max(0,t-pd)}};
const nice=e=>/invalid-credential|wrong-password|user-not-found/.test(e.code||'')?'Incorrect login ID or password.':/email-already/.test(e.code||'')?'This account already exists.':/too-many-requests/.test(e.code||'')?'Too many attempts. Please wait a few minutes and try again.':/network/.test(e.code||'')?'Network problem. Check your connection and try again.':/permission/.test(e.message||'')?'Permission denied. Please check the Firestore rules.':e.message;

/* ---------- 12-hour time helpers ---------- */
const fmt12=t=>{if(!t)return'';const[h,m]=String(t).split(':').map(Number);if(isNaN(h))return'';return(h%12||12)+':'+String(m||0).padStart(2,'0')+' '+(h<12?'AM':'PM')};
const fmtDay=d=>d?new Date(d+'T00:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'}):'No date';
const t12Html=(k,v)=>{let h='',mi='00',a='AM';
  if(v){const[H,M]=String(v).split(':').map(Number);h=String(H%12||12);mi=String(M||0).padStart(2,'0');a=H<12?'AM':'PM'}
  const mins=[...new Set([...Array(12)].map((_,i)=>String(i*5).padStart(2,'0')).concat(mi))].sort();
  return`<div class="t12"><input type="hidden" name="${k}" value="${esc(v||'')}"><select aria-label="Hour"><option value="">--</option>${[...Array(12)].map((_,i)=>`<option ${String(i+1)===h?'selected':''}>${i+1}</option>`).join('')}</select><span>:</span><select aria-label="Minute">${mins.map(x=>`<option ${x===mi?'selected':''}>${x}</option>`).join('')}</select><select aria-label="AM or PM">${['AM','PM'].map(x=>`<option ${x===a?'selected':''}>${x}</option>`).join('')}</select></div>`};

/* ---------- session (Firebase Auth) ----------
   Admin  : session-only login (this browser tab/window only, gone when the browser closes) + auto logout after 5 min idle.
   Client : stays logged in on that client's own device/browser. Every browser keeps its own separate session. */
const touch=()=>localStorage.setItem(LAST,Date.now());
let lastTouch=0;
function resetIdle(){
  if(me?.role!=='admin')return;
  const n=Date.now();if(n-lastTouch>1000){lastTouch=n;touch()}
  clearTimeout(idleT);idleT=setTimeout(()=>{authErr='You were logged out after 5 minutes of inactivity.';signOut(auth)},IDLE)
}
['click','keydown','touchstart','mousemove','scroll'].forEach(e=>addEventListener(e,resetIdle,{passive:true}));
// background tabs throttle timers, so re-check the moment the tab comes back
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&me?.role==='admin'&&Date.now()-(+localStorage.getItem(LAST)||0)>IDLE){authErr='You were logged out after 5 minutes of inactivity.';signOut(auth)}});
const stop=()=>{unsubs.forEach(u=>u());unsubs=[]};
const listen=(q,fn)=>unsubs.push(onSnapshot(q,s=>{fn(s);render()},e=>toast(nice(e))));
async function enter(u){
  stop();db={clients:[],projects:[],events:[],deliveries:[],secrets:{},notes:{},self:null};view='home';navOpen=false;
  if(!u){me=null;clearTimeout(idleT);try{setupDone=(await getDoc(doc(fs,'config','setup'))).exists()}catch{}return render()}
  const a=await getDoc(doc(fs,'admins',u.uid));
  if(a.exists()){
    if(Date.now()-(+localStorage.getItem(LAST)||0)>IDLE){authErr='Your session expired. Please log in again.';return signOut(auth)}
    me={role:'admin',uid:u.uid,name:a.data().name,photo:a.data().photo||''};resetIdle();
    listen(collection(fs,'clients'),s=>db.clients=s.docs.map(d=>({id:d.id,...d.data()})));
    listen(collection(fs,'clientSecrets'),s=>{db.secrets={};s.docs.forEach(d=>{db.secrets[d.id]=d.data().pw;db.notes[d.id]=d.data().note||''})});
    listen(collection(fs,'projects'),s=>db.projects=s.docs.map(d=>({id:d.id,...d.data()})));
    listen(collection(fs,'events'),s=>db.events=s.docs.map(d=>({id:d.id,...d.data()})));
    listen(collection(fs,'deliveries'),s=>db.deliveries=s.docs.map(d=>({id:d.id,...d.data()})));
  }else{
    const c=await getDoc(doc(fs,'clients',u.uid));
    if(!c.exists()){authErr='This account is not linked to the portal.';return signOut(auth)}
    me={role:'client',uid:u.uid,name:c.data().name};
    listen(doc(fs,'clients',u.uid),s=>db.self=s.data());
    listen(query(collection(fs,'projects'),where('clientId','==',u.uid)),s=>db.projects=s.docs.map(d=>({id:d.id,...d.data()})));
    listen(query(collection(fs,'events'),where('clientId','==',u.uid)),s=>db.events=s.docs.map(d=>({id:d.id,...d.data()})));
    listen(query(collection(fs,'deliveries'),where('clientId','==',u.uid)),s=>db.deliveries=s.docs.map(d=>({id:d.id,...d.data()})));
  }
  render();
}
if(ready)onAuthStateChanged(auth,u=>{if(!signingUp)enter(u)});

/* ---------- small UI helpers ---------- */
const TYPES=['Wedding','Pre-wedding','Engagement','Haldi','Mehendi','Sangeet','Reception','Birthday','Baby shoot','Maternity','Corporate','Fashion','Product','Cinematic film','Other'];
const EST=['Pending','Confirmed','Success','Cancelled'];
const SERV=['Photography','Videography','Photo + Video','Drone','Photo + Video + Drone','Other'];
const todayS=()=>new Date().toLocaleDateString('en-CA');
let cid=null;
const evSort=(a,b)=>((a.date||'')+(a.time||'')).localeCompare((b.date||'')+(b.time||''));
const pname=id=>(db.projects.find(p=>p.id===id)||{}).title||'—';
const tot=ps=>ps.reduce((a,p)=>{const x=pay(p);a.total+=x.total;a.paid+=x.paid;a.due+=x.due;return a},{total:0,paid:0,due:0});
const ico=(n,b)=>`<i class="fa-${b||'solid'} fa-${n}" aria-hidden="true"></i>`;
const pill=(t,c)=>`<span class="pill ${c||''}">${esc(t)}</span>`;
const stPill=s=>pill(s,{Ongoing:'warn',Pending:'warn',Confirmed:'ok',Success:'dark',Completed:'dark',Cancelled:'bad'}[s]||'');
const btn=(a,id,t,ic)=>`<button class="btn sm outline" data-${a}="${id}">${ic?ico(ic)+' ':''}${t}</button>`;
const kv=(k,v)=>v?`<div><small>${k}</small><span>${esc(v)}</span></div>`:'';
const stat=(l,v,d,ic)=>`<div class="kpi ${d?'dark':''}">${ic?`<i class="fa-solid fa-${ic} kpi-ic" aria-hidden="true"></i>`:''}<small>${l}</small><b>${v}</b></div>`;
const mLabel=m=>{const[y,mo]=m.split('-');return new Date(+y,+mo-1,1).toLocaleString('en-IN',{month:'short',year:'2-digit'})};
const bars=rows=>{const m=Math.max(1,...rows.map(r=>r[1]));return rows.map(r=>`<div class="bar-row"><span>${esc(r[0])}</span><div class="track"><i style="width:${r[1]/m*100}%"></i></div><b>${r[1]}</b></div>`).join('')};
const empty=(t,ic)=>`<div class="empty">${ico(ic||'folder-open')}<p>${t}</p></div>`;
const cards=(a,fn,msg,ic)=>a.length?`<div class="cards">${a.map(fn).join('')}</div>`:empty(msg,ic);
const heading=(t,act)=>`<div class="sec-h"><h3>${t}</h3>${act||''}</div>`;
const initial=n=>esc(String(n||'?').trim().slice(0,1).toUpperCase());
const av=(n,ph,cls)=>`<span class="avatar ${cls||''}">${ph?`<img src="${esc(ph)}" alt="">`:initial(n)}</span>`;
const projCard=(p,adm)=>{const x=pay(p),pc=x.total?Math.min(100,Math.round(x.paid/x.total*100)):0;
  return`<article class="card"><div class="card-h"><div><h3>${esc(p.title)}</h3><small>${adm?esc(cname(p.clientId))+' · ':''}${esc(p.service)}</small></div>${stPill(p.status)}</div>${p.details?`<p>${esc(p.details)}</p>`:''}<div class="meta">${kv('Start',p.startDate)}${kv('Delivery by',p.deliveryDate)}${kv('Deliverables',p.deliverables)}</div><div class="prog paybox ${x.due?'':'is-clear'}"><div class="pay-grid"><div><small>Total</small><b>${inr(x.total)}</b></div><div class="pg"><small>Received</small><b>${inr(x.paid)}</b></div><div class="pd"><small>Pending</small><b>${inr(x.due)}</b></div></div><div class="track"><i style="width:${pc}%"></i></div><div class="pay-state">${x.due?`${pc}% paid`:`${ico('circle-check')} Fully paid`}</div></div>${adm?`<div class="row-actions">${btn('pp',p.id,'Add payment','plus')}${(p.payments||[]).length?btn('pu',p.id,'Undo last payment','rotate-left'):''}${btn('pe',p.id,'Edit','pen')}${btn('pd',p.id,'Delete','trash')}</div>`:''}</article>`};
const evCard=(e,adm)=>{const d=e.date?new Date(e.date+'T00:00'):null;
  return`<article class="card ev"><div class="date">${d?`<b>${d.getDate()}</b><span>${d.toLocaleString('en-IN',{month:'short'})}</span>`:''}</div><div class="ev-b"><div class="card-h"><div><h3>${esc(e.type)}</h3><small>${adm?esc(cname(e.clientId))+' · ':''}${esc(pname(e.projectId))}</small></div>${stPill(e.status)}</div><div class="meta">${kv('Time',[fmt12(e.time),fmt12(e.endTime)].filter(Boolean).join(' – '))}${kv('Venue',e.place)}${kv('Team',e.team)}${kv('On-site contact',e.contact)}</div>${e.notes?`<p>${esc(e.notes)}</p>`:''}${adm?`<div class="row-actions">${btn('ee',e.id,'Edit','pen')}${btn('ed',e.id,'Delete','trash')}</div>`:''}</div></article>`};
const payLog=ps=>{const r=ps.flatMap(p=>(p.payments||[]).map(x=>({...x,p:p.title}))).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  return r.length?`<div class="table-wrap"><table><thead><tr><th>Date</th><th>Project</th><th>Amount</th><th>Mode</th><th>Note</th></tr></thead><tbody>${r.map(x=>`<tr><td>${esc(x.date)}</td><td>${esc(x.p)}</td><td><b>${inr(x.amount)}</b></td><td>${esc(x.mode)}</td><td>${esc(x.note)}</td></tr>`).join('')}</tbody></table></div>`:empty('No payments recorded yet.','receipt')};

/* ---------- delivery cards (photo preview + heading + link) ---------- */
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
    ?`<div class="dcard adm">${th}<div class="dtitle"><b>${esc(d.title)}</b><span class="dl">${esc(d.link)}</span></div><div class="row-actions">${btn('de',d.id,'Edit','pen')}${btn('dd',d.id,'Delete','trash')}</div></div>`
    :`<a class="dcard" href="${esc(safeUrl(d.link))}" target="_blank" rel="noopener">${th}<div class="dtitle"><b>${esc(d.title)}</b><span>Open ${ico('arrow-up-right-from-square')}</span></div></a>`};

/* ---------- Google review card (client) ---------- */
const reviewCard=()=>`<section class="review" id="rvCard" role="link" tabindex="0" aria-label="Write a review on Google">
  <div class="review-top"><div class="stars">${'<i class="fa-solid fa-star" aria-hidden="true"></i>'.repeat(5)}</div><div class="review-txt"><h3>Loved your experience? Leave us a Google review</h3><p>Tap this card to open our Google profile and write your review.</p></div><span class="btn btn-gold sm">${ico('star')}&nbsp; Write a review</span></div>
  <div class="review-tips"><h4>Not sure what to write? Use one of these</h4>
  ${REVIEW_TIPS.map((t,i)=>`<div class="tip"><p>“${esc(t)}”</p><button type="button" class="btn sm outline" data-copy="${i}">${ico('copy','regular')} Copy</button></div>`).join('')}
  <div class="photo-tip">${ico('camera')}<p><b>Add photos to your review.</b> Upload 2–3 of your favourite shots from your album along with your review — reviews with photos feel real, get noticed more and help other couples trust us.</p></div></div></section>`;
const copyTip=i=>{const t=REVIEW_TIPS[+i];(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('Copied — paste it in your Google review')).catch(()=>toast('Could not copy. Please select the text and copy it.'))};

/* ---------- login / sign up ---------- */
function authView(){
  const setup=!ready;
  $('#app').innerHTML=`<section class="auth"><div class="auth-art"><div class="auth-art-in"><p class="eyebrow">Studio Portal</p><h1>Shoots, payments and deliveries, <em>in one place.</em></h1><p class="lead">Clients follow their project, events and delivery link. The studio manages everything from one dashboard.</p></div>
  <ul class="auth-points"><li>${ico('calendar-days')}<span><b>Event schedule</b>Dates, venues and team for every function.</span></li><li>${ico('indian-rupee-sign')}<span><b>Payments</b>What is paid, what is pending, always up to date.</span></li><li>${ico('photo-film')}<span><b>Delivery</b>Your photos and films, one tap away.</span></li></ul></div>
  <div class="auth-form"><div class="card-auth"><p class="eyebrow">${mode==='login'?'Secure login':'First-time setup'}</p><h2>${mode==='login'?'Welcome back':'Create admin account'}</h2>
  ${setupDone?'':`<div class="tabs"><button data-m="login" class="${mode==='login'?'on':''}">Login</button><button data-m="signup" class="${mode==='signup'?'on':''}">Sign up</button></div>`}
  <form id="af" novalidate>${mode==='login'?`<label for="id">Email or mobile number</label><div class="field">${ico('user')}<input id="id" required autocomplete="username" inputmode="email" placeholder="Admin email / client mobile"></div><label for="pw">Password</label><div class="field">${ico('lock')}<input id="pw" type="password" required autocomplete="current-password" placeholder="Your password"><button type="button" class="eye" id="eye" aria-label="Show password">${ico('eye')}</button></div>`:`<label for="nm">Name</label><div class="field">${ico('user')}<input id="nm" required></div><label for="id">Email</label><div class="field">${ico('envelope','regular')}<input id="id" type="email" required></div><label for="pw">Password (min 6)</label><div class="field">${ico('lock')}<input id="pw" type="password" minlength="6" required><button type="button" class="eye" id="eye" aria-label="Show password">${ico('eye')}</button></div>`}
  <div class="err" id="err" role="alert">${setup?'Firebase config is missing in js/portal.js.':esc(authErr)}</div><button class="btn btn-gold full" ${setup?'disabled':''}>${mode==='login'?'Login':'Create account'}</button></form>
  <p class="hint">${mode==='login'?'Studio admins log in with email. Clients log in with their registered mobile number and the password shared by the studio.':'This is only for the first admin. Sign up closes automatically afterwards.'}</p>
  <p class="hint help">Trouble logging in? <a href="${WA}" target="_blank" rel="noopener">${ico('whatsapp','brands')} Message us on WhatsApp</a></p></div></div></section>`;
  authErr='';
  document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{mode=b.dataset.m;authView()});
  const eye=$('#eye');if(eye)eye.onclick=()=>{const p=$('#pw'),s=p.type==='password';p.type=s?'text':'password';eye.innerHTML=ico(s?'eye-slash':'eye');eye.setAttribute('aria-label',s?'Hide password':'Show password')};
  $('#af').onsubmit=async e=>{e.preventDefault();const id=$('#id').value.trim(),pw=$('#pw').value,err=$('#err'),sb=e.target.querySelector('button.full');err.textContent='';
    if(!id||!pw){err.textContent='Please fill in all fields.';return}
    sb.disabled=true;
    try{
      // admin (email) = session-only login, client (mobile) = remembered on that client's own device
      await setPersistence(auth,id.includes('@')?browserSessionPersistence:browserLocalPersistence);
      if(mode==='signup'){
        signingUp=true;touch();const cr=await createUserWithEmailAndPassword(auth,id.toLowerCase(),pw);
        try{const b=writeBatch(fs);b.set(doc(fs,'admins',cr.user.uid),{name:$('#nm').value.trim(),email:id.toLowerCase()});b.set(doc(fs,'config','setup'),{at:Date.now()});await b.commit()}
        catch(x){await deleteUser(cr.user);throw x}
        signingUp=false;setupDone=true;await enter(cr.user);
      }else{touch();await signInWithEmailAndPassword(auth,id.includes('@')?id.toLowerCase():em(id),pw)}
    }catch(x){signingUp=false;err.textContent=nice(x);sb.disabled=false}
  };
}

/* ---------- modal form ---------- */
function form(title,fields,vals,onSave){
  const m=$('#modal');m.hidden=false;document.body.classList.add('modal-open');
  const close=()=>{m.hidden=true;document.body.classList.remove('modal-open')};
  m.innerHTML=`<form class="modal-card"><div class="modal-h"><h3>${title}</h3><button type="button" class="x" id="cx" aria-label="Close">${ico('xmark')}</button></div><div class="modal-b">${fields.map(f=>`<label>${f.l}</label>${f.t==='select'?`<select name="${f.k}">${f.o.map(o=>`<option value="${esc(o[0])}" ${String(vals[f.k]??'')===String(o[0])?'selected':''}>${esc(o[1])}</option>`).join('')}</select>`:f.t==='time12'?t12Html(f.k,vals[f.k]):f.t==='img'?imgHtml(f.k,vals[f.k],f.max):f.t==='area'?`<textarea name="${f.k}" rows="3">${esc(vals[f.k])}</textarea>`:`<input name="${f.k}" type="${f.t||'text'}" value="${esc(vals[f.k])}" ${f.r?'required':''} ${f.ro?'readonly':''} ${f.dl?`list="dl_${f.k}"`:''}>${f.dl?`<datalist id="dl_${f.k}">${f.dl.map(x=>`<option value="${esc(x)}">`).join('')}</datalist>`:''}`}`).join('')}</div><div class="acts"><button type="button" class="btn outline" id="cx2">Cancel</button><button class="btn btn-gold">Save</button></div></form>`;
  $('#cx').onclick=$('#cx2').onclick=close;
  m.onclick=e=>{if(e.target===m)close()};
  m.onkeydown=e=>{if(e.key==='Escape')close()};
  // 12-hour time pickers: hour + minute + AM/PM -> stored as 24h "HH:MM" in the hidden input
  m.querySelectorAll('.t12').forEach(w=>w.onchange=()=>{const[h,mi,a]=[...w.querySelectorAll('select')].map(s=>s.value);w.querySelector('input').value=h?String(+h%12+(a==='PM'?12:0)).padStart(2,'0')+':'+mi:''});
  // photo upload: resized in the browser and stored with the card
  m.querySelectorAll('.imgf').forEach(w=>{const fi=w.querySelector('input[type=file]'),h=w.querySelector('input[type=hidden]'),im=w.querySelector('img');
    fi.onchange=async()=>{const f=fi.files[0];if(!f)return;try{h.value=await shrink(f,+w.dataset.max||800);im.src=h.value;im.hidden=false}catch{toast('Could not read this image')}};
    w.querySelector('[data-rm]').onclick=()=>{h.value='';im.hidden=true;im.removeAttribute('src');fi.value=''}});
  const first=m.querySelector('input:not([readonly]):not([type=hidden]):not([type=file]),select,textarea');if(first)first.focus();
  m.querySelector('form').onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('.acts .btn:last-child');b.disabled=true;
    try{await onSave(Object.fromEntries(new FormData(e.target)));close();toast('Saved')}catch(x){toast(nice(x));b.disabled=false}};
}
async function withSecondary(fn){const a=initializeApp(firebaseConfig,'sec'+Date.now());try{return await fn(getAuth(a))}finally{await signOut(getAuth(a)).catch(()=>{});deleteApp(a)}}

/* ---------- admin actions ---------- */
const projF=()=>[{k:'title',l:'Project name',r:1},{k:'clientId',l:'Client',t:'select',o:[['','— select —'],...db.clients.map(c=>[c.id,c.name])]},{k:'service',l:'Service',t:'select',o:SERV.map(x=>[x,x])},{k:'details',l:'Details',t:'area'},{k:'deliverables',l:'Deliverables (album, reels, edited photos...)',t:'area'},{k:'startDate',l:'Start date',t:'date'},{k:'deliveryDate',l:'Delivery deadline',t:'date'},{k:'amount',l:'Total amount (₹)',t:'number'},{k:'status',l:'Status',t:'select',o:['Ongoing','Completed'].map(x=>[x,x])}];
const saveP=(d,id)=>{if(!d.clientId)throw Error('Please select a client');const x={...d,amount:+d.amount||0};return id?updateDoc(doc(fs,'projects',id),x):addDoc(collection(fs,'projects'),{...x,payments:[]})};
const addProject=(pre={})=>db.clients.length?form('New project',projF(),{status:'Ongoing',service:'Photography',amount:0,...pre},d=>saveP(d)):toast('Add a client first');
const editProject=p=>form('Edit project',projF(),p,d=>saveP(d,p.id));
const delProject=async id=>{if(!confirm('This deletes the project and all its events. Continue?'))return;try{const w=writeBatch(fs);db.events.filter(e=>e.projectId===id).forEach(e=>w.delete(doc(fs,'events',e.id)));w.delete(doc(fs,'projects',id));await w.commit()}catch(x){toast(nice(x))}};
const addPayment=p=>form('Add payment',[{k:'amount',l:'Amount received (₹)',t:'number',r:1},{k:'date',l:'Date',t:'date',r:1},{k:'mode',l:'Mode',t:'select',o:['UPI','Cash','Bank transfer','Cheque','Other'].map(x=>[x,x])},{k:'note',l:'Note'}],{date:todayS(),mode:'UPI'},d=>updateDoc(doc(fs,'projects',p.id),{payments:[...(p.payments||[]),{amount:+d.amount||0,date:d.date,mode:d.mode,note:d.note||''}]}));
const undoPayment=p=>confirm('Remove the last payment?')&&updateDoc(doc(fs,'projects',p.id),{payments:(p.payments||[]).slice(0,-1)}).catch(x=>toast(nice(x)));
const evF=()=>[{k:'projectId',l:'Project',t:'select',o:[['','— select —'],...db.projects.map(p=>[p.id,`${p.title} (${cname(p.clientId)})`])]},{k:'type',l:'Event type',t:'select',o:TYPES.map(x=>[x,x])},{k:'date',l:'Date',t:'date',r:1},{k:'time',l:'Start time',t:'time12'},{k:'endTime',l:'End time',t:'time12'},{k:'place',l:'Venue / place'},{k:'contact',l:'On-site contact (name, number)'},{k:'team',l:'Team (names, comma separated)',t:'area'},{k:'notes',l:'Notes for client (dress code, call time...)',t:'area'},{k:'status',l:'Status',t:'select',o:EST.map(x=>[x,x])}];
const saveE=(d,id)=>{const p=db.projects.find(x=>x.id===d.projectId);if(!p)throw Error('Please select a project');const x={...d,clientId:p.clientId};return id?updateDoc(doc(fs,'events',id),x):addDoc(collection(fs,'events'),x)};
const addEvent=(pre={})=>db.projects.length?form('New event',evF(),{type:'Wedding',status:'Pending',...pre},d=>saveE(d)):toast('Create a project first');
const editEvent=e=>form('Edit event',evF(),e,d=>saveE(d,e.id));
const delEvent=id=>confirm('Delete this event?')&&deleteDoc(doc(fs,'events',id)).catch(x=>toast(nice(x)));
const DF=()=>[{k:'title',l:'Heading (Pre-wedding, Haldi, Mehendi...)',r:1,dl:DL_SUGG},{k:'link',l:'Delivery link (Drive / Photos / YouTube...)',t:'url',r:1},{k:'thumb',l:'Preview photo',t:'img'}];
const saveD=(d,clientId,id)=>{if(!/^https?:\/\//i.test(d.link||''))throw Error('Link must start with http:// or https://');const x={title:d.title.trim(),link:d.link.trim(),thumb:d.thumb||'',clientId};return id?updateDoc(doc(fs,'deliveries',id),x):addDoc(collection(fs,'deliveries'),{...x,createdAt:Date.now()})};
const addDeliv=clientId=>form('New delivery card',DF(),{},d=>saveD(d,clientId));
const editDeliv=d=>form('Edit delivery card',DF(),d,x=>saveD(x,d.clientId,d.id));
const delDeliv=id=>confirm('Delete this delivery card?')&&deleteDoc(doc(fs,'deliveries',id)).catch(x=>toast(nice(x)));
const CF=ro=>[{k:'name',l:'Client name',r:1},{k:'phone',l:'Login mobile number',r:1,ro},{k:'altPhone',l:'Alternate / WhatsApp number'},{k:'email',l:'Email',t:'email'},{k:'address',l:'Address / city',t:'area'},{k:'link',l:'Data delivery link',t:'url'},{k:'pw',l:'Password (min 6)',r:1},{k:'note',l:'Private note (only visible to you)',t:'area'},{k:'photo',l:'Profile photo',t:'img',max:320}];
const cData=d=>({name:d.name,altPhone:d.altPhone||'',email:d.email||'',address:d.address||'',link:d.link||'',photo:d.photo||''});
const addClient=()=>form('New client',CF(0),{pw:genPass()},async d=>{
  const ph=d.phone.replace(/\D/g,'');if(db.clients.some(c=>c.phone===ph))throw Error('This number is already registered');
  const uid=await withSecondary(async a=>(await createUserWithEmailAndPassword(a,em(ph),d.pw)).user.uid);
  const b=writeBatch(fs);b.set(doc(fs,'clients',uid),{...cData(d),phone:ph,verified:false});b.set(doc(fs,'clientSecrets',uid),{pw:d.pw,note:d.note||''});await b.commit()});
const editClient=c=>{const old=db.secrets[c.id];form('Edit client',CF(1),{...c,pw:old,note:db.notes[c.id]},async d=>{
  if(d.pw!==old)await withSecondary(async a=>{const u=await signInWithEmailAndPassword(a,em(c.phone),old);await updatePassword(u.user,d.pw)});
  await updateDoc(doc(fs,'clientSecrets',c.id),{pw:d.pw,note:d.note||''});await updateDoc(doc(fs,'clients',c.id),cData(d))})};
const delClient=async c=>{if(!confirm('This deletes the client, their projects and events. Continue?'))return;
  try{await withSecondary(async a=>{const u=await signInWithEmailAndPassword(a,em(c.phone),db.secrets[c.id]);await deleteUser(u.user)}).catch(()=>{});
    const w=writeBatch(fs);db.projects.filter(p=>p.clientId===c.id).forEach(p=>w.delete(doc(fs,'projects',p.id)));db.events.filter(e=>e.clientId===c.id).forEach(e=>w.delete(doc(fs,'events',e.id)));db.deliveries.filter(x=>x.clientId===c.id).forEach(x=>w.delete(doc(fs,'deliveries',x.id)));w.delete(doc(fs,'clients',c.id));w.delete(doc(fs,'clientSecrets',c.id));await w.commit();view='clients';render()}catch(x){toast(nice(x))}};
const shareLogin=c=>{const n=String(c.altPhone||c.phone).replace(/\D/g,'').slice(-10);
  const msg=`Hello ${c.name}, your Shubham Production client portal login:\nWebsite: ${PAGE}\nMobile: ${c.phone}\nPassword: ${db.secrets[c.id]}\nYou can see your events, payments and delivery link here.`;
  window.open('https://wa.me/91'+n+'?text='+encodeURIComponent(msg),'_blank','noopener')};
function wire(){
  const on=(a,fn)=>document.querySelectorAll(`[data-${a}]`).forEach(b=>b.onclick=e=>{e.preventDefault();fn(b.dataset[a])});
  const P=id=>db.projects.find(x=>x.id===id),C=id=>db.clients.find(x=>x.id===id);
  on('pe',id=>editProject(P(id)));on('pd',delProject);on('pp',id=>addPayment(P(id)));on('pu',id=>undoPayment(P(id)));
  on('ee',id=>editEvent(db.events.find(x=>x.id===id)));on('ed',delEvent);
  on('co',id=>{cid=id;go('client')});
  on('ce',id=>editClient(C(id)));on('cd',id=>delClient(C(id)));on('cw',id=>shareLogin(C(id)));
  on('rp',id=>{const t=document.querySelector(`[data-pwcell="${id}"]`),s=t.dataset.shown==='1';t.textContent=s?'••••••':(db.secrets[id]||'—');t.dataset.shown=s?'0':'1'});
  on('go',v=>go(v));
  on('copy',copyTip);on('de',id=>editDeliv(db.deliveries.find(x=>x.id===id)));on('dd',delDeliv);
  const rc=$('#rvCard');
  if(rc){rc.onclick=e=>{if(e.target.closest('[data-copy]'))return;window.open(reviewHref,'_blank','noopener')};rc.onkeydown=e=>{if(e.key==='Enter'&&e.target===rc)window.open(reviewHref,'_blank','noopener')}}
}

/* ---------- shell (sidebar + hamburger) shared by admin and client ---------- */
const ADMIN_NAV=[['home','Dashboard','chart-pie'],['projects','Projects','camera-retro'],['events','Events','calendar-days'],['clients','Clients','users']];
const CLIENT_NAV=[['home','Overview','house'],['projects','My Projects','camera-retro'],['events','My Events','calendar-days'],['payments','Payments','indian-rupee-sign'],['delivery','Photos & Videos','photo-film']];
const TITLES={home:'Dashboard',projects:'Projects',events:'Events',clients:'Clients',client:'Client',payments:'Payments',delivery:'Photos & Videos'};
function go(v){view=v;navOpen=false;window.scrollTo({top:0,behavior:'instant'});render()}
function setNav(o){navOpen=o;$('#side')?.classList.toggle('open',o);$('#scrim')?.classList.toggle('show',o);const t=$('#sideToggle');if(t){t.classList.toggle('active',o);t.setAttribute('aria-expanded',String(o))}document.body.classList.toggle('side-open',o)}
function shell(){
  const adm=me.role==='admin',nav=adm?ADMIN_NAV:CLIENT_NAV,cur=view==='client'?'clients':view,ph=adm?me.photo:(db.self||{}).photo;
  const title=adm?(view==='home'?'Dashboard':TITLES[view]):(view==='home'?'Overview':TITLES[view]||'');
  $('#app').innerHTML=`<div class="shell"><aside class="side ${navOpen?'open':''}" id="side" aria-label="Portal menu"><div class="side-top"><button class="side-close" id="sideClose" aria-label="Close menu">${ico('xmark')}</button><div class="side-user">${av(me.name,ph)}<div><small>${adm?'Admin console':'Client portal'}</small><b>${esc(me.name)}</b>${adm?'<button class="lnk" id="myPh">Change photo</button>':''}</div></div></div>
  <nav class="side-nav">${nav.map(n=>`<button class="${cur===n[0]?'on':''}" data-go="${n[0]}">${ico(n[2])}<span>${n[1]}</span></button>`).join('')}</nav>
  <div class="side-foot"><a href="index.html">${ico('globe')}<span>View website</span></a>${adm?'':`<a href="${WA}" target="_blank" rel="noopener">${ico('whatsapp','brands')}<span>Need help? WhatsApp</span></a>`}<button id="lo">${ico('right-from-bracket')}<span>Logout</span></button></div></aside>
  <div class="scrim ${navOpen?'show':''}" id="scrim"></div>
  <div class="pcol"><div class="pbar"><button class="pbar-toggle ${navOpen?'active':''}" id="sideToggle" aria-label="Open portal menu" aria-expanded="${navOpen}"><span></span><span></span><span></span></button><div class="pbar-title"><small>${adm?'Admin':'Client portal'}</small><b>${title}</b></div><div class="pbar-user">${av(me.name,ph,'sm')}<span class="pbar-name">${esc(me.name)}</span></div></div><main id="main" class="pmain"></main></div></div>`;
  $('#sideToggle').onclick=()=>setNav(!navOpen);$('#scrim').onclick=()=>setNav(false);$('#sideClose').onclick=()=>setNav(false);$('#lo').onclick=()=>signOut(auth);
  const mp=$('#myPh');if(mp)mp.onclick=()=>form('Your profile photo',[{k:'photo',l:'Photo',t:'img',max:320}],{photo:me.photo||''},async d=>{await updateDoc(doc(fs,'admins',me.uid),{photo:d.photo||''});me.photo=d.photo||'';render()});
  document.body.classList.toggle('side-open',navOpen);
}

/* ---------- admin views ---------- */
function adminView(){
  shell();
  ({home,projects,events,clients,client:clientPage})[view]();wire();
}
function home(){
  const t=tot(db.projects),td=todayS(),ym=td.slice(0,7);
  const up=db.events.filter(e=>e.date>=td&&e.status!=='Cancelled').sort(evSort);
  const ms=[...Array(6)].map((_,i)=>{const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-5+i);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')});
  const due={};db.projects.forEach(p=>{const x=pay(p).due;if(x)due[p.clientId]=(due[p.clientId]||0)+x});
  const dl=Object.entries(due).sort((a,b)=>b[1]-a[1]).slice(0,5),ty=TYPES.map(s=>[s,db.events.filter(e=>e.type===s).length]).filter(r=>r[1]).sort((a,b)=>b[1]-a[1]).slice(0,6);
  $('#main').innerHTML=`<div class="top"><div><p class="eyebrow">Overview</p><h1>Studio dashboard</h1></div><div class="row-actions"><button class="btn btn-gold sm" data-go="clients">${ico('user-plus')} New client</button></div></div>
  <div class="stats">${stat('Clients',db.clients.length,1,'users')}${stat('Projects',db.projects.length,0,'camera-retro')}${stat('Events this month',db.events.filter(e=>(e.date||'').startsWith(ym)).length,0,'calendar-check')}${stat('Upcoming events',up.length,0,'calendar-days')}${stat('Total billed',inr(t.total),0,'file-invoice')}${stat('Received',inr(t.paid),0,'circle-check')}${stat('Payment pending',inr(t.due),1,'hourglass-half')}${stat('Collection rate',(t.total?Math.round(t.paid/t.total*100):0)+'%',0,'chart-line')}</div>
  <div class="grid2"><div class="panel"><h3>Events per month</h3>${bars(ms.map(m=>[mLabel(m),db.events.filter(e=>(e.date||'').startsWith(m)).length]))}</div><div class="panel"><h3>Events by status</h3>${bars(EST.map(s=>[s,db.events.filter(e=>e.status===s).length]))}</div></div>
  <div class="grid2"><div class="panel"><h3>Top pending payments</h3>${dl.length?`<table class="mini">${dl.map(r=>`<tr><td><a href="#" data-co="${r[0]}">${esc(cname(r[0]))}</a></td><td class="r">${pill(inr(r[1]),'warn')}</td></tr>`).join('')}</table>`:empty('No pending payments.','circle-check')}</div><div class="panel"><h3>Events by type</h3>${ty.length?bars(ty):empty('Add events to see this chart.','chart-simple')}</div></div>
  ${heading('Upcoming events',up.length>6?`<button class="btn sm outline" data-go="events">View all</button>`:'')}${cards(up.slice(0,6),e=>evCard(e,1),'No upcoming events.','calendar-days')}`;
}

/* ---- filter helpers ---- */
const sel=(id,label,opts,val)=>`<label class="f"><small>${label}</small><select id="${id}">${opts.map(o=>`<option value="${esc(o[0])}" ${o[0]===val?'selected':''}>${esc(o[1])}</option>`).join('')}</select></label>`;
const clientOpts=()=>[['','All clients'],...db.clients.map(c=>[c.id,c.name]).sort((a,b)=>a[1].localeCompare(b[1]))];

/* ---- projects (with filters) ---- */
const PF0={q:'',status:'',client:'',service:'',pay:''};let pf={...PF0};
function projFiltered(){const s=pf.q.toLowerCase();
  return db.projects.filter(p=>{
    if(pf.status&&p.status!==pf.status)return false;
    if(pf.client&&p.clientId!==pf.client)return false;
    if(pf.service&&p.service!==pf.service)return false;
    const x=pay(p);
    if(pf.pay==='due'&&!(x.due>0))return false;
    if(pf.pay==='paid'&&!(x.total>0&&x.due===0))return false;
    if(s&&![p.title,p.details,p.deliverables,p.service,cname(p.clientId)].join(' ').toLowerCase().includes(s))return false;
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

/* ---- events (with filters, grouped by date) ---- */
const EF0={q:'',when:'',month:'',date:'',status:'',type:'',client:'',project:'',sort:'asc'};let ef={...EF0};
function evFiltered(){
  const td=todayS(),wk=new Date();wk.setDate(wk.getDate()+7);const w=wk.toLocaleDateString('en-CA'),s=ef.q.toLowerCase();
  return db.events.filter(e=>{
    const d=e.date||'';
    if(ef.date&&d!==ef.date)return false;
    if(!ef.date&&ef.month&&!d.startsWith(ef.month))return false;
    if(ef.status&&e.status!==ef.status)return false;
    if(ef.type&&e.type!==ef.type)return false;
    if(ef.client&&e.clientId!==ef.client)return false;
    if(ef.project&&e.projectId!==ef.project)return false;
    if(ef.when==='today'&&d!==td)return false;
    if(ef.when==='upcoming'&&!(d>=td))return false;
    if(ef.when==='week'&&!(d>=td&&d<=w))return false;
    if(ef.when==='past'&&!(d<td))return false;
    if(s&&![e.type,e.place,e.team,e.contact,e.notes,cname(e.clientId),pname(e.projectId)].join(' ').toLowerCase().includes(s))return false;
    return true}).sort((a,b)=>ef.sort==='desc'?evSort(b,a):evSort(a,b))}
function fillEv(){
  const l=evFiltered(),g=[];
  l.forEach(e=>{const k=e.date||'';const last=g[g.length-1];if(last&&last.d===k)last.a.push(e);else g.push({d:k,a:[e]})});
  $('#evcount').textContent=`${l.length} of ${db.events.length} event${db.events.length===1?'':'s'}`;
  $('#evlist').innerHTML=l.length?g.map(x=>`<div class="day-h"><b>${esc(fmtDay(x.d))}</b><span>${x.a.length} event${x.a.length===1?'':'s'}</span></div><div class="cards">${x.a.map(e=>evCard(e,1)).join('')}</div>`).join(''):empty(db.events.length?'No event matches these filters.':'No events yet.','calendar-days');
  wire();
}
function events(){
  const pj=[['','All projects'],...db.projects.filter(p=>!ef.client||p.clientId===ef.client).map(p=>[p.id,p.title])];
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
function clients(){
  const list=db.clients.filter(c=>!q||(c.name+' '+c.phone).toLowerCase().includes(q.toLowerCase()));
  $('#main').innerHTML=`<div class="top"><div><p class="eyebrow">People</p><h1>Clients</h1></div><div class="filter"><div class="field search">${ico('magnifying-glass')}<input id="qs" type="search" placeholder="Search name or number" value="${esc(q)}" aria-label="Search clients"></div><button class="btn btn-gold sm" id="add">${ico('user-plus')} Add client</button></div></div>
  <div class="panel flush">${list.length?`<div class="table-wrap"><table><thead><tr><th>Name</th><th>Login number</th><th>Password</th><th>Verification</th><th>Projects</th><th>Pending</th><th></th></tr></thead><tbody>${list.map(c=>`<tr><td><a href="#" data-co="${c.id}"><b>${esc(c.name)}</b></a></td><td>${esc(c.phone)}</td><td><code data-pwcell="${c.id}" data-shown="0">••••••</code> <button class="lnk" data-rp="${c.id}" aria-label="Show or hide password">${ico('eye')}</button></td><td>${c.verified?pill('Verified','ok'):pill('Pending','warn')}</td><td>${db.projects.filter(p=>p.clientId===c.id).length}</td><td>${inr(tot(db.projects.filter(p=>p.clientId===c.id)).due)}</td><td><div class="row-actions">${btn('co',c.id,'Open')}${btn('cd',c.id,'Delete','trash')}</div></td></tr>`).join('')}</tbody></table></div>`:empty(db.clients.length?'No client matches your search.':'No clients yet. Use “Add client”, enter a mobile number and a password is generated for you.','users')}</div>`;
  $('#add').onclick=addClient;
  const qs=$('#qs');qs.oninput=e=>{q=e.target.value;const p=e.target.selectionStart;render();const n=$('#qs');n.focus();n.setSelectionRange(p,p)};
}
function clientPage(){
  const c=db.clients.find(x=>x.id===cid);if(!c){view='clients';return render()}
  const ps=db.projects.filter(p=>p.clientId===c.id),es=db.events.filter(e=>e.clientId===c.id).sort(evSort),ds=db.deliveries.filter(x=>x.clientId===c.id).sort(delivSort),t=tot(ps);
  $('#main').innerHTML=`<button class="btn sm outline back" data-go="clients">${ico('arrow-left')} All clients</button><div class="top"><div class="who-box">${av(c.name,c.photo,'lg')}<div><h1>${esc(c.name)}</h1><p>${c.verified?pill('Verified','ok'):pill('Verification pending','warn')}</p></div></div><div class="row-actions">${btn('cw',c.id,'Send login on WhatsApp','whatsapp').replace('fa-solid fa-whatsapp','fa-brands fa-whatsapp')}${btn('ce',c.id,'Edit client','pen')}${c.verified?'<button class="btn sm outline" id="rv">Ask to re-verify</button>':''}${btn('cd',c.id,'Delete','trash')}</div></div>
  <div class="stats s4">${stat('Projects',ps.length,1,'camera-retro')}${stat('Billed',inr(t.total),0,'file-invoice')}${stat('Paid',inr(t.paid),0,'circle-check')}${stat('Pending',inr(t.due),1,'hourglass-half')}</div>
  <div class="panel"><h3>Client details</h3><div class="kvs">${kv('Login number',c.phone)}${kv('Password',db.secrets[c.id])}${kv('Alternate / WhatsApp',c.altPhone)}${kv('Email',c.email)}${kv('Address',c.address)}${kv('Verified Google account',c.googleEmail)}${kv('Verified on',c.verifiedAt?new Date(c.verifiedAt).toLocaleDateString('en-IN'):'')}${c.link?`<div><small>Delivery link</small><a href="${esc(c.link)}" target="_blank" rel="noopener">Open link</a></div>`:''}${kv('Private note',db.notes[c.id])}</div></div>
  ${heading('Delivery links',`<button class="btn sm btn-gold" id="adl">${ico('plus')} Add delivery card</button>`)}${ds.length?`<div class="dgrid">${ds.map(x=>delivCard(x,1)).join('')}</div>`:empty('No delivery cards yet. Add Pre-wedding, Wedding, Haldi, Mehendi etc. with a link and a preview photo.','photo-film')}
  ${heading('Projects',`<button class="btn sm btn-gold" id="ap">${ico('plus')} Add project</button>`)}${cards(ps,p=>projCard(p,1),'This client has no projects yet.','camera-retro')}
  ${heading('Events',`<button class="btn sm btn-gold" id="ae">${ico('plus')} Add event</button>`)}${cards(es,e=>evCard(e,1),'No events yet.','calendar-days')}
  <div class="panel mt"><h3>Payment history</h3>${payLog(ps)}</div>`;
  $('#ap').onclick=()=>addProject({clientId:c.id});$('#adl').onclick=()=>addDeliv(c.id);$('#ae').onclick=()=>addEvent({projectId:ps[0]?.id||''});
  const rv=$('#rv');if(rv)rv.onclick=()=>updateDoc(doc(fs,'clients',c.id),{verified:false}).then(()=>toast('The client will need to verify again')).catch(x=>toast(nice(x)));
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
  const ps=db.projects,es=[...db.events].sort(evSort),t=tot(ps),td=todayS(),next=es.find(e=>e.date>=td&&e.status!=='Cancelled');
  const delivery=c.link?`<div class="delivery">${ico('photo-film')}<div><h3>Your photos &amp; videos are ready</h3><p>Open your private delivery link to view and download everything.</p></div><a class="btn btn-gold" href="${esc(c.link)}" target="_blank" rel="noopener">Open delivery link</a></div>`:`<div class="delivery soon">${ico('hourglass-half')}<div><h3>Delivery link not ready yet</h3><p>It will appear here as soon as your photos and films are delivered.</p></div></div>`;
  const ds=[...db.deliveries].sort(delivSort),dview=ds.length?`<div class="sec-h"><h3>Your photos &amp; videos</h3></div><div class="dgrid">${ds.map(x=>delivCard(x,0)).join('')}</div>`:delivery;
  const stats=`<div class="stats s4">${stat('Projects',ps.length,1,'camera-retro')}${stat('Total',inr(t.total),0,'file-invoice')}${stat('Paid',inr(t.paid),0,'circle-check')}${stat('Pending',inr(t.due),1,'hourglass-half')}</div>`;
  const body={
    home:()=>`<div class="top"><div><p class="eyebrow">Client portal</p><h1>Hello, ${esc(c.name)}</h1></div></div>${stats}
      ${next?`<div class="panel next"><h3>Your next event</h3>${evCard(next,0)}</div>`:''}${dview}${reviewCard()}
      ${heading('Your projects',ps.length>2?`<button class="btn sm outline" data-go="projects">View all</button>`:'')}${cards(ps.slice(0,2),p=>projCard(p,0),'Your project has not been added yet.','camera-retro')}`,
    projects:()=>`<div class="top"><div><p class="eyebrow">Overview</p><h1>My projects</h1></div></div>${cards(ps,p=>projCard(p,0),'Your project has not been added yet.','camera-retro')}`,
    events:()=>`<div class="top"><div><p class="eyebrow">Schedule</p><h1>My events</h1></div></div>${cards(es,e=>evCard(e,0),'No events scheduled yet.','calendar-days')}`,
    payments:()=>`<div class="top"><div><p class="eyebrow">Billing</p><h1>Payments</h1></div></div>${stats}<div class="panel mt"><h3>Payment history</h3>${payLog(ps)}</div>`,
    delivery:()=>`<div class="top"><div><p class="eyebrow">Delivery</p><h1>Photos &amp; videos</h1></div></div>${dview}${reviewCard()}<div class="panel mt"><h3>Your account</h3><div class="kvs">${kv('Name',c.name)}${kv('Mobile',c.phone)}${kv('Email',c.email)}${kv('Verified Google account',c.googleEmail)}</div></div>`
  };
  $('#main').innerHTML=(body[view]||body.home)();wire();
}
function render(){
  const y=window.scrollY;
  document.body.classList.toggle('in-portal',!!me&&(me.role==='admin'||db.self?.verified));
  if(!me)authView();else if(me.role==='admin')adminView();else clientView();
  const yr=$('#year');if(yr)yr.textContent=new Date().getFullYear();
  if(y&&me)window.scrollTo({top:y,behavior:'instant'});
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&navOpen)setNav(false)});
if(!ready)render();