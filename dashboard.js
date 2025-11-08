import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Jalankan setelah DOM siap
document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const logoutBtn = document.getElementById("logoutBtn");
  const popup = document.getElementById("popupForm");
  const tambahProdukBtn = document.getElementById("tambah-produk");
  const batalPopupBtn = document.getElementById("batalPopup");
  const simpanProdukBtn = document.getElementById("simpanProduk");
  const produkContainer = document.getElementById("produk-container");

  // Sidebar toggle
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });

  // Logout
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });

  // Popup tambah produk
  tambahProdukBtn.addEventListener("click", () => popup.classList.remove("hidden"));
  batalPopupBtn.addEventListener("click", () => popup.classList.add("hidden"));

  // Simpan produk ke Firestore
  simpanProdukBtn.addEventListener("click", async () => {
    const foto = document.getElementById("foto").files[0];
    const judul = document.getElementById("judul").value.trim();
    const deskripsi = document.getElementById("deskripsi").value.trim();
    const harga = document.getElementById("harga").value.trim();

    if (!foto || !judul || !deskripsi || !harga) return alert("Lengkapi semua data!");

    try {
      const storageRef = ref(storage, `produk/${Date.now()}_${foto.name}`);
      await uploadBytes(storageRef, foto);
      const fotoURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, "produk"), {
        judul,
        deskripsi,
        harga,
        foto: fotoURL,
        createdAt: new Date(),
      });

      alert("Produk berhasil disimpan!");
      popup.classList.add("hidden");
      loadProduk();
    } catch (err) {
      alert("Gagal menyimpan produk!");
      console.error(err);
    }
  });

  // Load produk dari Firestore
  async function loadProduk() {
    produkContainer.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "produk"));
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const card = document.createElement("div");
      card.className = "produk-card";
      card.innerHTML = `
        <img src="${data.foto}" alt="${data.judul}">
        <h3>${data.judul}</h3>
        <p>${data.deskripsi}</p>
        <p><b>Rp${data.harga}</b></p>
        <button data-id="${docSnap.id}" class="hapus">🗑️ Hapus</button>
      `;
      produkContainer.appendChild(card);
    });

    // Hapus produk
    document.querySelectorAll(".hapus").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.getAttribute("data-id");
        await deleteDoc(doc(db, "produk", id));
        loadProduk();
      });
    });
  }

  // Cek login
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "index.html";
    } else {
      loadProduk();
    }
  });
});
