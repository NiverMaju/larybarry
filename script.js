const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

// Bolhas
const bubbleField = $('#bubbleField');
for (let i=0;i<22;i++) {
  const b=document.createElement('span'); b.className='bubble';
  const size=8+Math.random()*28; b.style.width=b.style.height=`${size}px`;
  b.style.left=`${Math.random()*100}%`; b.style.animationDuration=`${8+Math.random()*12}s`;
  b.style.animationDelay=`${Math.random()*10}s`; bubbleField.appendChild(b);
}

// Menu e animações de entrada
$('#menuToggle').addEventListener('click',()=>{const nav=$('#mainNav');nav.classList.toggle('open');$('#menuToggle').setAttribute('aria-expanded',nav.classList.contains('open'));});
$$('#mainNav a').forEach(a=>a.addEventListener('click',()=>$('#mainNav').classList.remove('open')));
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
$$('.reveal').forEach(el=>io.observe(el));

// Galeria
const lightbox=$('#lightbox');
$$('#gallery button').forEach(btn=>btn.addEventListener('click',()=>{const img=$('img',btn);$('#lightboxImage').src=img.src;$('#lightboxCaption').textContent=btn.dataset.caption||img.alt;lightbox.showModal();}));
$('#closeLightbox').addEventListener('click',()=>lightbox.close());
lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close()});

// Jogo de comida
let foodScore=0;
$('#feedButton').addEventListener('click',()=>{
  if(foodScore>=5)return;
  const food=document.createElement('span');food.className='food-drop';food.textContent=['🥬','🍃','🫛'][Math.floor(Math.random()*3)];
  food.style.left=`${10+Math.random()*75}%`;$('#foodTank').appendChild(food);foodScore++;$('#foodScore').textContent=foodScore;
  if(foodScore===5){$('#foodMessage').textContent='Dupla alimentada! 🎉';$('#feedButton').textContent='Missão cumprida!';}
  setTimeout(()=>food.remove(),2100);
});

// Jogo de encontrar Barry
let findTimer=null,findTime=20,findScore=0;
function spawnBarry(){
  $('.target-barry')?.remove();const target=document.createElement('span');target.className='target-barry';target.textContent='🦐';
  target.style.left=`${7+Math.random()*78}%`;target.style.top=`${7+Math.random()*66}%`;
  target.addEventListener('click',()=>{findScore++;$('#findScore').textContent=findScore;if(findScore>=5){clearInterval(findTimer);target.remove();$('#startFindButton').textContent='Você encontrou Barry! 🏆';return;}spawnBarry();});
  $('#findTank').appendChild(target);
}
$('#startFindButton').addEventListener('click',()=>{clearInterval(findTimer);findTime=20;findScore=0;$('#findTime').textContent=findTime;$('#findScore').textContent=0;$('#startFindButton').textContent='Barry está escondido...';spawnBarry();findTimer=setInterval(()=>{findTime--;$('#findTime').textContent=findTime;if(findTime<=0){clearInterval(findTimer);$('.target-barry')?.remove();$('#startFindButton').textContent=findScore>=5?'Você venceu! 🏆':'Tempo esgotado — tentar novamente';}},1000);});

// Comunidade e chat local. Para ficar público em todos os aparelhos, preencher firebaseConfig.
const firebaseConfig={apiKey:'COLE_AQUI',authDomain:'COLE_AQUI',projectId:'COLE_AQUI',storageBucket:'COLE_AQUI',messagingSenderId:'COLE_AQUI',appId:'COLE_AQUI'};
let avatar='🦐';
$$('.avatar-option').forEach(btn=>btn.addEventListener('click',()=>{$$('.avatar-option').forEach(x=>x.classList.remove('active'));btn.classList.add('active');avatar=btn.dataset.avatar;}));
const state={profile:JSON.parse(localStorage.getItem('lb_profile')||'null'),posts:JSON.parse(localStorage.getItem('lb_posts')||'[]'),messages:JSON.parse(localStorage.getItem('lb_messages')||'[]')};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
function save(){localStorage.setItem('lb_profile',JSON.stringify(state.profile));localStorage.setItem('lb_posts',JSON.stringify(state.posts));localStorage.setItem('lb_messages',JSON.stringify(state.messages));}
function renderPosts(){const feed=$('#postFeed');feed.innerHTML=state.posts.length?state.posts.slice().reverse().map((p,i)=>`<article class="post"><div class="post-head"><strong>${p.avatar} ${esc(p.name)}</strong><small>${esc(p.date)}</small></div><p>${esc(p.text)}</p><button data-like="${state.posts.length-1-i}">❤️ ${p.likes||0}</button></article>`).join(''):'<div class="empty">Ainda não há recados. Seja a primeira pessoa!</div>';$$('[data-like]',feed).forEach(b=>b.addEventListener('click',()=>{state.posts[+b.dataset.like].likes=(state.posts[+b.dataset.like].likes||0)+1;save();renderPosts();}));}
function renderMessages(){const box=$('#messages');box.innerHTML=state.messages.length?state.messages.slice(-80).map(m=>`<div class="message ${state.profile&&m.id===state.profile.id?'mine':''}"><div class="message-head"><span>${m.avatar}</span><strong>${esc(m.name)}</strong><time>${esc(m.time)}</time></div><p>${esc(m.text)}</p></div>`).join(''):'<div class="empty">O chat ainda está vazio.</div>';box.scrollTop=box.scrollHeight;}
$('#joinForm').addEventListener('submit',e=>{e.preventDefault();const name=$('#memberName').value.trim();if(!name)return;state.profile={id:crypto.randomUUID(),avatar,name,phrase:$('#memberPhrase').value.trim()};save();$('#communityStatus').textContent=`Você entrou como ${name}!`;});
$('#postButton').addEventListener('click',()=>{if(!state.profile)return alert('Entre na comunidade antes de publicar.');const text=$('#postText').value.trim();if(!text)return;state.posts.push({avatar:state.profile.avatar,name:state.profile.name,text,date:new Date().toLocaleString('pt-BR'),likes:0});$('#postText').value='';save();renderPosts();});
$('#chatForm').addEventListener('submit',e=>{e.preventDefault();if(!state.profile)return alert('Entre na comunidade antes de conversar.');const text=$('#chatInput').value.trim();if(!text)return;state.messages.push({id:state.profile.id,avatar:state.profile.avatar,name:state.profile.name,text,time:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})});$('#chatInput').value='';save();renderMessages();});
renderPosts();renderMessages();

const firebaseReady=!Object.values(firebaseConfig).some(v=>v.includes('COLE_AQUI'));
if(firebaseReady){
  try{
    const {initializeApp}=await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js');
    const {getFirestore,collection,addDoc,onSnapshot,serverTimestamp,query,orderBy,limit}=await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js');
    const app=initializeApp(firebaseConfig),db=getFirestore(app);$('#communityStatus').textContent='Modo público conectado.';$('#chatMode').textContent='Ao vivo';
    $('#joinForm').onsubmit=async e=>{e.preventDefault();const name=$('#memberName').value.trim();if(!name)return;state.profile={id:crypto.randomUUID(),avatar,name,phrase:$('#memberPhrase').value.trim()};localStorage.setItem('lb_profile',JSON.stringify(state.profile));$('#communityStatus').textContent=`Você entrou como ${name}!`;};
    $('#postButton').onclick=async()=>{if(!state.profile)return alert('Entre na comunidade antes de publicar.');const text=$('#postText').value.trim();if(!text)return;await addDoc(collection(db,'larybarry_posts'),{avatar:state.profile.avatar,name:state.profile.name,text,likes:0,date:new Date().toLocaleString('pt-BR'),createdAt:serverTimestamp()});$('#postText').value='';};
    onSnapshot(query(collection(db,'larybarry_posts'),orderBy('createdAt','asc'),limit(100)),snap=>{state.posts=snap.docs.map(d=>d.data());renderPosts();});
    $('#chatForm').onsubmit=async e=>{e.preventDefault();if(!state.profile)return alert('Entre na comunidade antes de conversar.');const text=$('#chatInput').value.trim();if(!text)return;await addDoc(collection(db,'larybarry_chat'),{id:state.profile.id,avatar:state.profile.avatar,name:state.profile.name,text,time:new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),createdAt:serverTimestamp()});$('#chatInput').value='';};
    onSnapshot(query(collection(db,'larybarry_chat'),orderBy('createdAt','asc'),limit(100)),snap=>{state.messages=snap.docs.map(d=>d.data());renderMessages();});
  }catch(err){console.error(err);$('#communityStatus').textContent='Não foi possível conectar ao modo público; o modo local continua funcionando.';}
}

// Diário do aquário
const defaultDiary = [
  {date:'2026-07-16', title:'A chegada de Lary e Barry', text:'A dupla chegou juntinha e começou a conhecer o novo lar. Em poucos minutos, já estava explorando cada cantinho do aquário.', emoji:'🦐'},
  {date:'2026-07-16', title:'Grudadinhos no aquecedor', text:'Lary e Barry ficaram lado a lado no aquecedor, como dois melhores amigos que não queriam se separar. Foi uma das primeiras fotos oficiais da dupla.', emoji:'📸'},
  {date:'2026-07-16', title:'O encontro com Gary', text:'Gary observou os novos moradores bem de perto. Assim começou a amizade entre o caramujo mais famoso do aquário e os dois pequenos exploradores.', emoji:'🐌'},
  {date:'2026-07-17', title:'Cada um escolheu seu cantinho', text:'Um deles gostou da casinha e o outro preferiu ficar entre as plantas. Mesmo explorando lugares diferentes, a dupla sempre volta a se encontrar.', emoji:'🌿'}
];
let diaryEntries = JSON.parse(localStorage.getItem('lb_diary') || 'null') || defaultDiary;
function formatDiaryDate(value){
  const [y,m,d]=value.split('-');
  return new Date(Number(y),Number(m)-1,Number(d)).toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
}
function renderDiary(){
  const timeline=$('#diaryTimeline');
  if(!timeline)return;
  const ordered=[...diaryEntries].sort((a,b)=>b.date.localeCompare(a.date));
  timeline.innerHTML=ordered.length?ordered.map(item=>`<article class="diary-entry"><div class="diary-entry-head"><span class="diary-entry-icon">${esc(item.emoji)}</span><div><time datetime="${esc(item.date)}">${formatDiaryDate(item.date)}</time><h3>${esc(item.title)}</h3></div></div><p>${esc(item.text)}</p></article>`).join(''):'<div class="diary-empty">O diário está esperando a primeira aventura.</div>';
}
const diaryDate=$('#diaryDate');
if(diaryDate) diaryDate.value=new Date().toISOString().slice(0,10);
$('#diaryForm')?.addEventListener('submit',e=>{
  e.preventDefault();
  diaryEntries.push({date:diaryDate.value,title:$('#diaryTitle').value.trim(),text:$('#diaryText').value.trim(),emoji:$('#diaryEmoji').value});
  localStorage.setItem('lb_diary',JSON.stringify(diaryEntries));
  e.target.reset(); diaryDate.value=new Date().toISOString().slice(0,10); renderDiary();
  $('#diaryTitle').focus();
});
renderDiary();
