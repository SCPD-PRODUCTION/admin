// =============================
// 🔹 Firebase Import (v9 Modular)
// =============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

// =============================
// 🔹 Firebase Config
// =============================
const firebaseConfig = {
  apiKey: "AIzaSyC5gAbdlbVL3t6oreb_ZZhAUT1YJVTKwPU",
  authDomain: "scpd-production.firebaseapp.com",
  databaseURL: "https://scpd-production-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "scpd-production",
  storageBucket: "scpd-production.appspot.com",
  messagingSenderId: "72136560829",
  appId: "1:72136560829:web:1c14d8087f9c3b88ade7d4",
  measurementId: "G-LGXCFVNFTH",
};

// =============================
// 🔹 Inisialisasi Firebase
// =============================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// =============================
// 🔹 Menampilkan Daftar Produk
// =============================
async function showProductList() {
  const produkList = document.getElementById("produkList");
  
  // Mengambil produk dari Firestore
  const querySnapshot = await getDocs(collection(db, "produk"));

  if (querySnapshot.empty) {
    produkList.innerHTML = `<p style="color:gray;">Belum ada produk</p>`;
    return;
  }

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    produkList.innerHTML += `
      <div class="produk-card fade-in" data-id="${docSnap.id}" data-path="${data.filePath}">
        <img src="${data.gambar}" alt="${data.nama}">
        <div class="produk-info">
          <h3>${data.nama}</h3>
          <p>${data.deskripsi}</p>
        </div>
        <div class="produk-footer">
          <span class="harga">Rp ${data.harga}</span>
          <div class="produk-actions">
            <a href="https://wa.me/6281234567890" target="_blank" class="beli-btn">Beli</a>
            <!-- Tombol Hapus Produk -->
            <button class="hapus-btn" title="Hapus Produk"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>
    `;
  });

  // Tombol Geser Kanan/Kiri untuk Scroll Produk
  setupScrollButtons();

  // Fungsi Hapus Produk
  document.querySelectorAll(".hapus-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const card = e.target.closest(".produk-card");
      const id = card.getAttribute("data-id");
      const path = card.getAttribute("data-path");

      if (confirm("🗑️ Yakin ingin menghapus produk ini?")) {
        try {
          await deleteDoc(doc(db, "produk", id));
          if (path) {
            const fileRef = ref(storage, path);
            await deleteObject(fileRef);
          }
          card.remove();
          alert("✅ Produk berhasil dihapus!");
        } catch (error) {
          alert("❌ Gagal menghapus produk: " + error.message);
        }
      }
    });
  });
}

// =============================
// 🔹 Tombol Geser Kanan/Kiri untuk Produk
// =============================
function setupScrollButtons() {
  const produkContainer = document.querySelector(".produk-container.horizontal-scroll");
  const prevBtn = document.querySelector(".prevBtn");
  const nextBtn = document.querySelector(".nextBtn");

  if (produkContainer && prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => {
      produkContainer.scrollBy({
        left: -300, // Geser ke kiri
        behavior: "smooth",
      });
    });

    nextBtn.addEventListener("click", () => {
      produkContainer.scrollBy({
        left: 300, // Geser ke kanan
        behavior: "smooth",
      });
    });
  }
}

// Menjalankan fungsi untuk menampilkan produk
showProductList();
