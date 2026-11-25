import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
const $=id=>document.getElementById(id);
const STORE="pulparindosClub.v2";
const initial={nickname:"",streak:0,lastCheckin:"",points:0,missions:[],badges:[]};
let state={...initial,...JSON.parse(localStorage.getItem(STORE)||"{}")};
const save=()=>{localStorage.setItem(STORE,JSON.stringify(state));renderStats();};
const dayKey=date=>{const d=new Date(date);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
const dayDiff=(a,b)=>Math.round((new Date(b+"T12:00:00")-new Date(a+"T12:00:00"))/86400000);
function awardBadge(id){if(!state.badges.includes(id))state.badges.push(id);}
function renderStats(){
 $("streakStat").textContent=state.streak+" días";$("streakBig").textContent=state.streak;
 $("pointsStat").textContent=state.points;$("badgeStat").textContent=state.badges.length;
 $("streakMessage").textContent=state.lastCheckin===dayKey(new Date())?"¡Participación de hoy registrada! Vuelve en tu próximo día activo.":state.streak?"Tu racha sigue creciendo. Registra tu participación en tu próximo día activo.":"Registra tu participación para comenzar tu racha.";
 $("checkinButton").disabled=state.lastCheckin===dayKey(new Date());
 $("checkinButton").textContent=$("checkinButton").disabled?"PARTICIPACIÓN REGISTRADA":"REGISTRAR MI PARTICIPACIÓN";
 $("streakDots").querySelectorAll("span").forEach((el,i)=>el.classList.toggle("done",i<state.streak%8||(state.streak>0&&state.streak%8===0)));
 const definitions=[["first","🌟","Primera visita","Registra tu participación"],["streak3","🔥","Racha de 3","Participa 3 días activos"],["memory","🧠","Buena memoria","Encuentra todas las parejas"],["business","💡","Mente de negocio","Resuelve el reto de costos"]];
 $("badgeGrid").replaceChildren();
 definitions.forEach(([id,icon,title,desc])=>{const item=document.createElement("div");item.className="badge-item "+(state.badges.includes(id)?"unlocked":"locked");const emoji=document.createElement("span");emoji.textContent=icon;const b=document.createElement("b");b.textContent=title;const small=document.createElement("small");small.textContent=desc;item.append(emoji,b,small);$("badgeGrid").append(item);});
 $("nicknameInput").value=state.nickname||"";
}
$("entryQuote");
$("enterButton").addEventListener("click",()=>{$("entry").classList.add("leaving");startMusic();});
$("checkinButton").addEventListener("click",()=>{
 const today=dayKey(new Date());if(state.lastCheckin===today)return;
 if(state.lastCheckin){const gap=dayDiff(state.lastCheckin,today);let activeDays=0;for(let i=1;i<gap;i++){const d=new Date(state.lastCheckin+"T12:00:00");d.setDate(d.getDate()+i);if(d.getDay()!==0&&d.getDay()!==6)activeDays++;}state.streak=activeDays===0?state.streak+1:1;}else state.streak=1;
 state.lastCheckin=today;state.points+=5;state.missions=state.missions.includes("checkin")?state.missions:[...state.missions,"checkin"];awardBadge("first");if(state.streak>=3)awardBadge("streak3");save();
});
$("nicknameForm").addEventListener("submit",e=>{e.preventDefault();const name=$("nicknameInput").value.trim().replace(/[<>]/g,"").slice(0,16);if(!name)return;state.nickname=name;if(!state.missions.includes("nickname")){state.missions.push("nickname");state.points+=5;}save();$("nicknameMessage").textContent="¡Listo, "+name+"! Tu apodo quedó guardado en este dispositivo.";});
document.querySelectorAll("[data-mission]").forEach(btn=>btn.addEventListener("click",()=>{
 const id=btn.dataset.mission;if(id==="nickname"){$("nicknameInput").focus();$("nicknameInput").scrollIntoView({behavior:"smooth",block:"center"});return;}
 if(id==="business"){$("quizQuestion").scrollIntoView({behavior:"smooth",block:"center"});$("quizFeedback").textContent="Responde la pregunta de abajo para completar el reto.";return;}
}));
const symbols=["🍬","⭐","🌶️","🍭","🍬","⭐","🌶️","🍭"];let cards=[],opened=[],locked=false,matches=0;
function newMemory(){cards=[...symbols].sort(()=>Math.random()-.5);opened=[];locked=false;matches=0;$("memoryStatus").textContent="Encuentra los 4 pares.";drawMemory();}
function drawMemory(){$("memoryBoard").replaceChildren();cards.forEach((symbol,i)=>{const b=document.createElement("button");b.className="memory-card";b.textContent=opened.includes(i)||b.dataset.matched==="yes"?symbol:"?";if(opened.includes(i)||cards[i]===null)b.classList.add("revealed");if(cards[i]===null){b.classList.add("matched");b.textContent=symbols[i%4];}b.setAttribute("aria-label","Tarjeta "+(i+1));b.addEventListener("click",()=>flip(i,b));$("memoryBoard").append(b);});}
function flip(i,button){if(locked||opened.includes(i)||cards[i]===null)return;opened.push(i);button.textContent=cards[i];button.classList.add("revealed");if(opened.length===2){const [a,b]=opened;if(cards[a]===cards[b]){cards[a]=null;cards[b]=null;matches++;opened=[];if(matches===4){$("memoryStatus").textContent="¡Completaste el juego! +10 puntos";if(!state.missions.includes("memory")){state.missions.push("memory");state.points+=10;}awardBadge("memory");save();}else $("memoryStatus").textContent="¡Pareja encontrada!";}else{locked=true;$("memoryStatus").textContent="No son pareja. ¡Intenta otra vez!";setTimeout(()=>{opened.forEach(index=>{const el=$("memoryBoard").children[index];if(el){el.textContent="?";el.classList.remove("revealed");}});opened=[];locked=false;},750);}}}
$("memoryStart").addEventListener("click",newMemory);
$("quizAnswers").addEventListener("click",e=>{const btn=e.target.closest("button[data-answer]");if(!btn)return;const correct=btn.dataset.answer==="1.5";$("quizFeedback").textContent=correct?"¡Correcto! $3 - $1.50 = $1.50 antes de otros gastos. +5 puntos.":"Casi. Resta el costo al precio: $3 - $1.50.";if(correct&&!state.missions.includes("business")){state.missions.push("business");state.points+=5;awardBadge("business");save();}document.querySelectorAll("#quizAnswers button").forEach(b=>b.disabled=true);});
newMemory();renderStats();
// Música original generada en el navegador: no depende de archivos MP3 externos.
let audioCtx=null,musicTimer=null,musicStep=0;
const melody=[659,784,988,784,587,659,784,659,523,659,784,659,587,523,440,523];
function startMusic(){try{if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();audioCtx.resume();if(musicTimer)return;const playNote=()=>{const now=audioCtx.currentTime;const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type="square";osc.frequency.value=melody[musicStep%melody.length];gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.045,now+.015);gain.gain.exponentialRampToValueAtTime(.0001,now+.17);osc.connect(gain);gain.connect(audioCtx.destination);osc.start(now);osc.stop(now+.18);if(musicStep%4===0){const bass=audioCtx.createOscillator(),bg=audioCtx.createGain();bass.type="triangle";bass.frequency.value=melody[musicStep%melody.length]/2;bg.gain.setValueAtTime(.0001,now);bg.gain.exponentialRampToValueAtTime(.025,now+.01);bg.gain.exponentialRampToValueAtTime(.0001,now+.22);bass.connect(bg);bg.connect(audioCtx.destination);bass.start(now);bass.stop(now+.23);}musicStep++;};playNote();musicTimer=setInterval(playNote,210);$("musicStatus").textContent="REPRODUCIENDO";$("nowPlaying").textContent="CLUB MIX · ORIGINAL";$("nextPlaying").textContent="MELODÍA DEL CLUB";$("musicState").textContent="Ⅱ";}catch{$("musicStatus").textContent="AUDIO NO DISPONIBLE";}}
function stopMusic(){if(musicTimer){clearInterval(musicTimer);musicTimer=null;}if(audioCtx)audioCtx.suspend();$("musicStatus").textContent="EN PAUSA";$("musicState").textContent="▶";}
$("musicToggle").addEventListener("click",()=>musicTimer?stopMusic():startMusic());
$("adminOpen").addEventListener("click",()=>$("adminModal").classList.remove("hidden"));
$("adminClose").addEventListener("click",()=>$("adminModal").classList.add("hidden"));
$("adminModal").addEventListener("click",e=>{if(e.target===$("adminModal"))$("adminModal").classList.add("hidden");});
const configReady=Object.values(firebaseConfig).every(v=>v&&!String(v).startsWith("PEGA_AQUI"));
let auth,db;
if(configReady){
 const app=initializeApp(firebaseConfig);auth=getAuth(app);db=getFirestore(app);
 onAuthStateChanged(auth,user=>{$("adminPanel").classList.toggle("hidden",!user);$("loginForm").classList.toggle("hidden",!!user);if(user)listenProducts();});
 $("loginForm").addEventListener("submit",async e=>{e.preventDefault();$("loginMessage").textContent="Comprobando acceso…";try{await signInWithEmailAndPassword(auth,$("email").value,$("password").value);$("loginMessage").textContent="Sesión iniciada.";}catch{$("loginMessage").textContent="No se pudo iniciar sesión. Revisa los datos y Firebase.";}});
 $("logoutButton").addEventListener("click",()=>signOut(auth));
 $("productForm").addEventListener("submit",async e=>{e.preventDefault();const user=auth.currentUser;if(!user)return;try{await addDoc(collection(db,"productos"),{nombre:$("productName").value.trim(),precio:Number($("productPrice").value),existencias:Number($("productStock").value),activo:true,creadoEn:serverTimestamp(),creadoPor:user.uid});$("productForm").reset();}catch{$("loginMessage").textContent="No se pudo guardar. Revisa las reglas de Firestore.";}});
}else{$("loginMessage").textContent="Firebase todavía no está conectado. El club y los minijuegos funcionan en este dispositivo; el panel de administración necesita Firebase.";$("loginForm").addEventListener("submit",e=>{e.preventDefault();$("loginMessage").textContent="Primero conecta Firebase para habilitar el acceso de administrador.";});}
function listenProducts(){const q=query(collection(db,"productos"),orderBy("creadoEn","desc"));onSnapshot(q,snapshot=>{const list=$("productsList");if(snapshot.empty){list.textContent="Todavía no hay productos.";return;}list.replaceChildren();snapshot.forEach(doc=>{const p=doc.data(),row=document.createElement("div"),name=document.createElement("span"),stock=document.createElement("b");row.className="product-row";name.textContent=p.nombre+" · $"+Number(p.precio).toFixed(2);stock.textContent="Existencias: "+p.existencias;row.append(name,stock);list.append(row);});},()=>{$("productsList").textContent="No se pudieron leer los productos.";});}
