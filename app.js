import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const quotes = [
  "No necesitas tenerlo todo para empezar. Necesitas una visión y la decisión de avanzar.",
  "La disciplina convierte una buena idea en algo que puede crecer.",
  "No compitas por aparentar. Construye algo que puedas sostener.",
  "Cada gran proyecto tuvo un primer paso que parecía pequeño.",
  "Piensa en grande, administra con inteligencia y cumple lo que prometes.",
  "El progreso real se nota en lo que haces, no solamente en lo que dices."
];
const songs = [
  { title: "FRANCIA", artist: "Tito Double P", file: "assets/audio/francia.mp3" },
  { title: "4X4", artist: "Omar Camacho, Angel Almaguer, Victor Mendivil y $HUPE", file: "assets/audio/4x4.mp3" },
  { title: "EL LOKERON", artist: "Tito Double P", file: "assets/audio/el-lokeron.mp3" },
  { title: "SUZUKI", artist: "Fuerza Regida", file: "assets/audio/suzuki.mp3" }
];
let songIndex = 0;
let audioStarted = false;
let auth;
let db;
const $ = id => document.getElementById(id);
const randomQuote = () => quotes[Math.floor(Math.random() * quotes.length)];

$("entryQuote").textContent = randomQuote();
$("dailyQuote").textContent = randomQuote();
$("newQuote").addEventListener("click", () => { $("dailyQuote").textContent = randomQuote(); });

function updateSongLabels() {
  const current = songs[songIndex];
  const next = songs[(songIndex + 1) % songs.length];
  $("nowPlaying").textContent = current.title;
  $("nextPlaying").textContent = "SIGUIENTE: " + next.title;
}
function playSong() {
  const audio = $("audioPlayer");
  audio.src = songs[songIndex].file;
  audio.play().then(() => {
    audioStarted = true;
    $("musicStatus").textContent = "REPRODUCIENDO";
    $("musicState").textContent = "Ⅱ";
  }).catch(() => {
    $("musicStatus").textContent = "AUDIO NO DISPONIBLE";
    $("musicState").textContent = "▶";
  });
  updateSongLabels();
}
$("audioPlayer").addEventListener("ended", () => {
  songIndex = (songIndex + 1) % songs.length;
  playSong();
});
$("enterButton").addEventListener("click", () => {
  $("entry").classList.add("leaving");
  playSong();
});
$("musicToggle").addEventListener("click", () => {
  const audio = $("audioPlayer");
  if (!audioStarted || audio.paused) {
    if (!audio.src) playSong();
    else audio.play().then(() => {
      audioStarted = true;
      $("musicStatus").textContent = "REPRODUCIENDO";
      $("musicState").textContent = "Ⅱ";
    }).catch(() => {});
  } else {
    audio.pause();
    $("musicStatus").textContent = "EN PAUSA";
    $("musicState").textContent = "▶";
  }
});
updateSongLabels();

$("adminOpen").addEventListener("click", () => $("adminModal").classList.remove("hidden"));
$("adminClose").addEventListener("click", () => $("adminModal").classList.add("hidden"));
$("adminModal").addEventListener("click", event => {
  if (event.target === $("adminModal")) $("adminModal").classList.add("hidden");
});

const configReady = Object.values(firebaseConfig).every(value => value && !String(value).startsWith("PEGA_AQUI"));
if (configReady) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  onAuthStateChanged(auth, user => {
    $("adminPanel").classList.toggle("hidden", !user);
    $("loginForm").classList.toggle("hidden", !!user);
    if (user) listenProducts();
  });
  $("loginForm").addEventListener("submit", async event => {
    event.preventDefault();
    $("loginMessage").textContent = "Comprobando acceso…";
    try {
      await signInWithEmailAndPassword(auth, $("email").value, $("password").value);
      $("loginMessage").textContent = "Sesión iniciada.";
    } catch {
      $("loginMessage").textContent = "No se pudo iniciar sesión. Revisa el correo, contraseña y configuración de Firebase.";
    }
  });
  $("logoutButton").addEventListener("click", () => signOut(auth));
  $("productForm").addEventListener("submit", async event => {
    event.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
    try {
      await addDoc(collection(db, "productos"), {
        nombre: $("productName").value.trim(),
        precio: Number($("productPrice").value),
        existencias: Number($("productStock").value),
        activo: true,
        creadoEn: serverTimestamp(),
        creadoPor: user.uid
      });
      $("productForm").reset();
    } catch {
      $("loginMessage").textContent = "No se pudo guardar. Revisa las reglas de Firestore.";
    }
  });
} else {
  $("loginMessage").textContent = "Firebase todavía no está conectado. Consulta README.md para configurarlo.";
  $("loginForm").addEventListener("submit", event => {
    event.preventDefault();
    $("loginMessage").textContent = "Primero conecta Firebase siguiendo los pasos del README.";
  });
}

function listenProducts() {
  const productsQuery = query(collection(db, "productos"), orderBy("creadoEn", "desc"));
  onSnapshot(productsQuery, snapshot => {
    const list = $("productsList");
    if (snapshot.empty) {
      list.textContent = "Todavía no hay productos.";
      return;
    }
    list.replaceChildren();
    snapshot.forEach(documentSnapshot => {
      const product = documentSnapshot.data();
      const row = document.createElement("div");
      row.className = "product-row";
      const name = document.createElement("span");
      name.textContent = product.nombre + " · $" + Number(product.precio).toFixed(2);
      const stock = document.createElement("b");
      stock.textContent = "Existencias: " + product.existencias;
      row.append(name, stock);
      list.append(row);
    });
  }, () => { $("productsList").textContent = "No se pudieron leer los productos. Revisa las reglas."; });
}