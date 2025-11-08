import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

const produkGrid = document.getElementById("produkGrid");
const popupForm = document.getElementById("popupForm");
const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");

menuToggle.addEventListener("click", () => sidebar.classList.toggle("active"));

document.getElementById("tambahProduk").addEventListener("click", () => popupForm.style.display = "flex");
window.closePopup = () => popupForm.style.display = "none";

document.getElementById("simpanProduk").addEventListener("click", async () => {
  const file = document.getElementById("foto").files[0];
  const judul = document.getElementById("judul").value;
  const deskripsi = document.getElementById("deskripsi").value;
  const harga = document.getElementById("harga").value;

  if (!file || !judul) return alert("Lengkapi semua field!");

  const storageRef = ref(storage, 'produk/' + file.name);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  await addDoc(collection(db, "produk"), { judul, deskripsi, harga, url });
  alert("Produk berhasil ditambahkan!");
  location.reload();
});

async function loadProduk() {
  const querySnapshot = await getDocs(collection(db, "produk"));
  produkGrid.innerHTML = "";
  querySnapshot.forEach((docu) => {
    const data = docu.data();
    produkGrid.innerHTML += `
      <div class="produk-card">
        <img src="${data.url}" width="100%" />
        <h3>${data.judul}</h3>
        <p>${data.deskripsi}</p>
        <p><b>Rp${data.harga}</b></p>
        <button onclick="hapusProduk('${docu.id}')">Hapus</button>
      </div>`;
  });
}
window.hapusProduk = async (id) => {
  await deleteDoc(doc(db, "produk", id));
  alert("Produk dihapus!");
  location.reload();
};
loadProduk();

window.showSection = (id) => {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
};

window.logout = async () => {
  await signOut(auth);
  window.location.href = "index.html";
};
