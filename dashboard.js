import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

// --- INIT FIREBASE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- WAIT UNTIL DOM READY ---
window.addEventListener("load", () => {

  // ELEMENTS
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const logoutBtn = document.getElementById("logoutBtn");
  const tambahProdukBtn = document.getElementById("tambah-produk");
  const popup = document.getElementById("popupForm");
  const batalPopupBtn = document.getElementById("batalPopup");
  const simpanProdukBtn = document.getElementById("simpanProduk");
  const produkContainer = document.getElementById("produk-container");

  // --- SIDEBAR TOGGLE ---
  if (menuToggle) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebar.classList.toggle("active");
    });
  }

  // --- LOGOUT BUTTON ---
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        await signOut(auth);
        window.location.href = "index.html";
      } catch (err) {
        alert("Gagal logout: " + err.message);
      }
    });
  }

  // --- POPUP TAMBAH PRODUK ---
  if (tambahProdukBtn) {
    tambahProdukBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      popup.classList.remove("hidden");
    });
  }

  if (batalPopupBtn) {
    batalPopupBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      popup.classList.add("hidden");
    });
  }

  if (simpanProdukBtn) {
    simpanProdukBtn.addEventListener("click", async () => {
      const foto = document.getElementById("foto").files[0];
      const judul = document.getElementById("judul").value.trim();
      const deskripsi = document.getElementById("deskripsi").value.trim();
      const harga = document.getElementById("harga").value.trim();

      if (!foto || !judul || !deskripsi || !harga) {
        alert("⚠️ Lengkapi semua data sebelum menyimpan!");
        return;
      }

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

        alert("✅ Produk berhasil disimpan!");
        popup.classList.add("hidden");
        loadProduk();
      } catch (error) {
        console.error(error);
        alert("❌ Gagal menyimpan produk.");
      }
    });
  }

  // --- LOAD PRODUK ---
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

    document.querySelectorAll(".hapus").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = e.target.getAttribute("data-id");
        await deleteDoc(doc(db, "produk", id));
        loadProduk();
      });
    });
  }

  // --- AUTH STATE ---
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "index.html";
    } else {
      loadProduk();
    }
  });
});
