import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// SIDEBAR TOGGLE
const sidebar = document.getElementById("sidebar");
document.getElementById("menuToggle").addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

// LOGOUT
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

// CEK LOGIN
onAuthStateChanged(auth, user => {
  if (!user) window.location.href = "index.html";
});

// TAMBAH PRODUK POPUP
const popup = document.getElementById("popupForm");
document.getElementById("tambah-produk").addEventListener("click", () => popup.classList.remove("hidden"));
document.getElementById("batalPopup").addEventListener("click", () => popup.classList.add("hidden"));

// SIMPAN PRODUK
document.getElementById("simpanProduk").addEventListener("click", async () => {
  const foto = document.getElementById("foto").files[0];
  const judul = document.getElementById("judul").value;
  const deskripsi = document.getElementById("deskripsi").value;
  const harga = document.getElementById("harga").value;

  if (!foto || !judul || !deskripsi || !harga) return alert("Lengkapi semua data!");

  const storageRef = ref(storage, `produk/${foto.name}`);
  await uploadBytes(storageRef, foto);
  const url = await getDownloadURL(storageRef);

  await addDoc(collection(db, "produk"), {
    judul,
    deskripsi,
    harga,
    foto: url,
    createdAt: new Date()
  });

  alert("Produk berhasil disimpan!");
  popup.classList.add("hidden");
  loadProduk();
});

// LOAD PRODUK
async function loadProduk() {
  const produkContainer = document.getElementById("produk-container");
  produkContainer.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "produk"));
  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const card = document.createElement("div");
    card.className = "produk-card";
    card.innerHTML = `
      <img src="${data.foto}" alt="${data.judul}">
      <h3>${data.judul}</h3>
      <p>${data.deskripsi}</p>
      <p><b>Rp${data.harga}</b></p>
      <button data-id="${docSnap.id}" class="hapus">Hapus</button>
    `;
    produkContainer.appendChild(card);
  });

  document.querySelectorAll(".hapus").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.getAttribute("data-id");
      await deleteDoc(doc(db, "produk", id));
      loadProduk();
    });
  });
}

loadProduk();
