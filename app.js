import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, query, orderBy, doc, updateDoc, deleteDoc, runTransaction } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
const $=id=>document.getElementById(id);
const STORE="pulparindosClub.v3";
let state={nickname:"",points:0,badges:[],...(JSON.parse(localStorage.getItem(STORE)||"{}"))};
const save=()=>localStorage.setItem(STORE,JSON.stringify(state));
const money=n=>"$"+Number(n||0).toFixed(2);
const safe=s=>String(s??"").trim().slice(0,80);
const ready=Object.values(firebaseConfig).every(v=>v&&!String(v).startsWith("PEGA_AQUI"));
let auth=null,db=null,products=[],sales=[],debts=[],unsubscribers=[],publicProductsUnsub=null;
function message(id,text){$(id).textContent=text;}
$("enterButton").addEventListener("click",()=>{$("entry").classList.add("out");});
$("adminOpen").addEventListener("click",()=>{$("adminModal").classList.remove("hidden");});
$("adminClose").addEventListener("click",()=>{$("adminModal").classList.add("hidden");});
$("adminModal").addEventListener("click",e=>{if(e.target===$("adminModal"))$("adminModal").classList.add("hidden");});
$("nicknameInput").value=state.nickname;
function renderProfile(){
 $("welcomeName").textContent=state.nickname?"¡Hola, "+state.nickname+"!":"¡Hola, visitante!";
 $("pointsStat").textContent=state.points;
 $("badgeStat").textContent=state.badges.length;
 $("nicknameInput").value=state.nickname;
 const defs=[["memory","🧠","Buena memoria","Completa el juego"],["business","💡","Cuenta inteligente","Resuelve el reto"]];
 $("badgeGrid").replaceChildren();
 defs.forEach(([id,emoji,title,desc])=>{const card=document.createElement("article");card.className="badge-item "+(state.badges.includes(id)?"unlocked":"");const icon=document.createElement("span");icon.textContent=emoji;const b=document.createElement("b");b.textContent=title;const small=document.createElement("small");small.textContent=state.badges.includes(id)?"¡Desbloqueada!":desc;card.append(icon,b,small);$("badgeGrid").append(card);});
}
$("nicknameForm").addEventListener("submit",e=>{e.preventDefault();const n=safe($("nicknameInput").value).replace(/[<>]/g,"").slice(0,16);if(!n)return;state.nickname=n;save();renderProfile();message("nicknameMessage","Apodo guardado en este dispositivo.");});
const symbols=["🍬","⭐","🌶️","🍭","🍬","⭐","🌶️","🍭"];let deck=[],opened=[],matched=new Set(),busy=false;
function startMemory(){deck=[...symbols].sort(()=>Math.random()-.5);opened=[];matched=new Set();busy=false;message("memoryStatus","Encuentra los cuatro pares.");drawMemory();}
function drawMemory(){
 $("memoryBoard").replaceChildren();
 deck.forEach((symbol,i)=>{const b=document.createElement("button");b.className="memory-card";b.textContent=matched.has(i)||opened.includes(i)?symbol:"?";if(matched.has(i))b.classList.add("matched");else if(opened.includes(i))b.classList.add("revealed");b.setAttribute("aria-label","Tarjeta "+(i+1));b.addEventListener("click",()=>flip(i));$("memoryBoard").append(b);});
}
function flip(i){if(busy||matched.has(i)||opened.includes(i))return;opened.push(i);drawMemory();if(opened.length===2){const [a,b]=opened;if(deck[a]===deck[b]){matched.add(a);matched.add(b);opened=[];if(matched.size===8){message("memoryStatus","¡Ganaste! +10 puntos.");if(!state.badges.includes("memory")){state.badges.push("memory");state.points+=10;save();renderProfile();}}else message("memoryStatus","¡Pareja encontrada!");drawMemory();}else{busy=true;message("memoryStatus","No son pareja. Intenta otra vez.");setTimeout(()=>{opened=[];busy=false;drawMemory();},750);}}}
$("memoryStart").addEventListener("click",startMemory);startMemory();
$("quizAnswers").addEventListener("click",e=>{const b=e.target.closest("[data-answer]");if(!b)return;const ok=b.dataset.answer==="1.5";message("quizFeedback",ok?"¡Correcto! Quedan $1.50 antes de otros gastos. +5 puntos.":"Intenta restar el costo al precio: $3 - $1.50.");if(ok&&!state.badges.includes("business")){state.badges.push("business");state.points+=5;save();renderProfile();}document.querySelectorAll("#quizAnswers button").forEach(x=>x.disabled=true);});
renderProfile();
function setTab(name){document.querySelectorAll(".admin-tab").forEach(x=>x.classList.toggle("hidden",x.id!=="tab-"+name));document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.tab===name));}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>setTab(b.dataset.tab)));
function renderProducts(){
 const list=$("productsList"),select=$("saleProduct"),publicList=$("publicProducts");
 list.replaceChildren();select.replaceChildren();publicList.replaceChildren();
 const active=products.filter(p=>p.activo!==false);
 if(!products.length){list.innerHTML='<div class="empty-admin">Todavía no agregas dulces.</div>';publicList.innerHTML='<div class="empty-state">Todavía no hay productos en el catálogo.</div>';select.add(new Option("Primero agrega productos",""));return;}
 active.forEach(p=>{
  const row=document.createElement("div");row.className="admin-row";
  const info=document.createElement("span");info.textContent=p.nombre+" · "+money(p.precio)+" · Stock: "+(p.existencias??0);
  const actions=document.createElement("div");actions.className="row-actions";
  const edit=document.createElement("button");edit.className="mini-action";edit.textContent="Editar";edit.addEventListener("click",()=>editProduct(p));
  const remove=document.createElement("button");remove.className="mini-action";remove.textContent="Eliminar";remove.addEventListener("click",()=>removeProduct(p));
  actions.append(edit,remove);row.append(info,actions);list.append(row);
  select.add(new Option(p.nombre+" — "+money(p.precio)+" (stock "+(p.existencias??0)+")",p.id));
  const card=document.createElement("article");card.className="public-product";const title=document.createElement("b");title.textContent=p.nombre;const price=document.createElement("span");price.textContent=money(p.precio);card.append(title,price);publicList.append(card);
 });
 if(!active.length){publicList.innerHTML='<div class="empty-state">No hay dulces disponibles por ahora.</div>';select.add(new Option("No hay productos activos",""));}
 updateSaleTotal();
}
function renderSales(){const el=$("salesList");el.replaceChildren();if(!sales.length){el.textContent="Aún no hay ventas registradas.";return;}sales.slice(0,15).forEach(s=>{const row=document.createElement("div");row.className="admin-row";const a=document.createElement("span");a.textContent=(s.producto||"Dulce")+" × "+s.cantidad+" · "+(s.cliente||"Sin nombre");const b=document.createElement("b");b.textContent=money(s.total);row.append(a,b);el.append(row);});}
function renderDebts(){const el=$("debtsList");el.replaceChildren();const pending=debts.filter(d=>Number(d.saldo)>0);$("debtTotal").textContent=money(pending.reduce((a,d)=>a+Number(d.saldo||0),0));if(!debts.length){el.textContent="No hay deudas registradas.";return;}debts.forEach(d=>{const row=document.createElement("div");row.className="admin-row debt-row";const meta=document.createElement("div");meta.className="debt-meta";const person=document.createElement("b");person.textContent=d.persona||"Sin nombre";const balance=document.createElement("b");balance.textContent=money(d.saldo);meta.append(person,balance);const p=document.createElement("p");p.textContent=(d.concepto||"Deuda")+" · Inicial: "+money(d.monto)+" · Abonado: "+money(Number(d.monto)-Number(d.saldo));row.append(meta,p);if(Number(d.saldo)>0){const actions=document.createElement("div");actions.className="row-actions";const pay=document.createElement("button");pay.className="mini-action";pay.textContent="Registrar abono";pay.addEventListener("click",()=>addPayment(d));const paid=document.createElement("button");paid.className="mini-action";paid.textContent="Marcar pagado";paid.addEventListener("click",()=>settleDebt(d));actions.append(pay,paid);row.append(actions);}else{const done=document.createElement("small");done.textContent="PAGADO";done.style.color="green";row.append(done);}el.append(row);});}
function listenData(){
 unsubscribers.forEach(fn=>fn());unsubscribers=[];
 unsubscribers.push(onSnapshot(query(collection(db,"ventas"),orderBy("creadoEn","desc")),snap=>{sales=snap.docs.map(d=>({id:d.id,...d.data()}));renderSales();},()=>message("loginMessage","No se pudieron leer ventas. Revisa las reglas.")));
 unsubscribers.push(onSnapshot(query(collection(db,"deudas"),orderBy("creadoEn","desc")),snap=>{debts=snap.docs.map(d=>({id:d.id,...d.data()}));renderDebts();},()=>message("loginMessage","No se pudieron leer deudas. Revisa las reglas.")));
}
async function editProduct(p){const name=prompt("Nombre del dulce:",p.nombre);if(name===null)return;const price=prompt("Precio de venta:",p.precio);if(price===null)return;const stock=prompt("Existencias:",p.existencias??0);if(stock===null)return;const n=safe(name),v=Number(price),q=Number(stock);if(!n||!Number.isFinite(v)||v<=0||!Number.isInteger(q)||q<0){alert("Revisa nombre, precio y existencias.");return;}try{await updateDoc(doc(db,"productos",p.id),{nombre:n,precio:v,existencias:q});}catch{alert("No se pudo actualizar el producto.");}}
async function removeProduct(p){if(!confirm("¿Eliminar "+p.nombre+" del catálogo?"))return;try{await deleteDoc(doc(db,"productos",p.id));}catch{alert("No se pudo eliminar.");}}
$("productForm").addEventListener("submit",async e=>{e.preventDefault();if(!auth?.currentUser)return;const nombre=safe($("productName").value),precio=Number($("productPrice").value),existencias=Number($("productStock").value);if(!nombre||!Number.isFinite(precio)||precio<=0||!Number.isInteger(existencias)||existencias<0)return;try{await addDoc(collection(db,"productos"),{nombre,precio,existencias,activo:true,creadoEn:serverTimestamp(),creadoPor:auth.currentUser.uid});$("productForm").reset();}catch{message("loginMessage","No se pudo guardar el producto. Revisa las reglas de Firestore.");}});
function updateSaleTotal(){const p=products.find(x=>x.id===$("saleProduct").value);$("saleTotal").textContent=money((p?.precio||0)*Number($("saleQty").value||0));}
$("saleProduct").addEventListener("change",updateSaleTotal);$("saleQty").addEventListener("input",updateSaleTotal);
$("saleForm").addEventListener("submit",async e=>{e.preventDefault();const p=products.find(x=>x.id===$("saleProduct").value),qty=Number($("saleQty").value),customer=safe($("saleCustomer").value)||"Sin nombre";if(!p||!Number.isInteger(qty)||qty<1)return;if(Number(p.existencias)<qty){alert("No hay existencias suficientes.");return;}const total=Number((Number(p.precio)*qty).toFixed(2)),isDebt=$("salePayment").value==="fiado";try{await runTransaction(db,async tx=>{const ref=doc(db,"productos",p.id),snap=await tx.get(ref);if(!snap.exists()||Number(snap.data().existencias)<qty)throw new Error("STOCK");tx.update(ref,{existencias:Number(snap.data().existencias)-qty});const saleRef=doc(collection(db,"ventas"));tx.set(saleRef,{producto:p.nombre,productoId:p.id,cantidad:qty,precioUnitario:Number(p.precio),total,cliente:customer,estado:isDebt?"fiado":"pagado",creadoEn:serverTimestamp(),creadoPor:auth.currentUser.uid});if(isDebt){const debtRef=doc(collection(db,"deudas"));tx.set(debtRef,{persona:customer,concepto:"Dulces fiados: "+p.nombre+" × "+qty,monto:total,saldo:total,abonos:0,creadoEn:serverTimestamp(),creadoPor:auth.currentUser.uid});}});$("saleForm").reset();$("saleQty").value=1;updateSaleTotal();alert("Venta registrada correctamente.");}catch(err){alert(err.message==="STOCK"?"Las existencias cambiaron. Revisa el stock e intenta de nuevo.":"No se pudo registrar la venta. Revisa Firestore.");}});
$("debtForm").addEventListener("submit",async e=>{e.preventDefault();const persona=safe($("debtPerson").value),concepto=safe($("debtConcept").value),monto=Number($("debtAmount").value);if(!persona||!concepto||!Number.isFinite(monto)||monto<=0)return;try{await addDoc(collection(db,"deudas"),{persona,concepto,monto,saldo:monto,abonos:0,creadoEn:serverTimestamp(),creadoPor:auth.currentUser.uid});$("debtForm").reset();}catch{alert("No se pudo registrar la deuda.");}});
async function addPayment(d){const raw=prompt("¿Cuánto abonó? Saldo actual: "+money(d.saldo));if(raw===null)return;const amount=Number(raw);if(!Number.isFinite(amount)||amount<=0||amount>Number(d.saldo)){alert("Escribe un abono válido que no supere el saldo.");return;}try{await updateDoc(doc(db,"deudas",d.id),{saldo:Number((Number(d.saldo)-amount).toFixed(2)),abonos:Number(d.abonos||0)+amount,ultimoAbonoEn:serverTimestamp()});}catch{alert("No se pudo guardar el abono.");}}
async function settleDebt(d){if(!confirm("¿Marcar como pagada la deuda de "+money(d.saldo)+"?"))return;try{await updateDoc(doc(db,"deudas",d.id),{abonos:Number(d.abonos||0)+Number(d.saldo),saldo:0,pagadaEn:serverTimestamp()});}catch{alert("No se pudo actualizar la deuda.");}}
if(ready){
 const app=initializeApp(firebaseConfig);auth=getAuth(app);db=getFirestore(app);
 publicProductsUnsub=onSnapshot(query(collection(db,"productos"),orderBy("creadoEn","desc")),snap=>{products=snap.docs.map(d=>({id:d.id,...d.data()}));renderProducts();},()=>{});
 onAuthStateChanged(auth,user=>{$("adminPanel").classList.toggle("hidden",!user);$("loginForm").classList.toggle("hidden",!!user);if(user){message("loginMessage","Sesión iniciada.");listenData();}else{unsubscribers.forEach(fn=>fn());unsubscribers=[];sales=[];debts=[];renderSales();renderDebts();}});
 $("loginForm").addEventListener("submit",async e=>{e.preventDefault();message("loginMessage","Verificando acceso…");try{await signInWithEmailAndPassword(auth,$("email").value,$("password").value);}catch{message("loginMessage","No se pudo iniciar sesión. Revisa el correo, contraseña y Firebase.");}});
 $("logoutButton").addEventListener("click",()=>signOut(auth));
}else{message("loginMessage","Firebase aún no está conectado. El sitio público y los juegos funcionan; para guardar productos, ventas y deudas entre dispositivos falta conectar Firebase.");$("loginForm").addEventListener("submit",e=>{e.preventDefault();message("loginMessage","Primero hay que conectar Firebase para activar el panel.");});}
renderProducts();renderSales();renderDebts();