// =============================
// 🔹 Sidebar toggle
// =============================
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

// =============================
// 🔹 Klik judul DASHBOARD
// =============================
const dashboardTitle = document.getElementById("dashboardTitle");
dashboardTitle.addEventListener("click", () => {
  window.location.href = "dashboard.html"; // reload dashboard utama
});

// =============================
// 🔹 Firebase Import (v9 Modular)
// =============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Proteksi login
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
  }
});

// =============================
// 🔹 Tombol Logout
// =============================
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  localStorage.clear();
  window.location.href = "index.html";
});

// =============================
// 🔹 Tombol Tambah & Lihat Produk
// =============================
const addProductBtn = document.getElementById("addProductBtn");
const centerAddProduct = document.getElementById("centerAddProduct");
const viewProductsBtn = document.getElementById("viewProductsBtn");
const centerViewProducts = document.getElementById("centerViewProducts");
const main = document.querySelector(".main-content");

// =============================
// 🔹 Fungsi Menampilkan Form Tambah Produk
// =============================
function showAddProductForm() {
  main.innerHTML = `
    <div class="product-form fade-in">
      <h2>Tambah Produk</h2>
      <input type="text" id="productName" placeholder="Nama Produk" required><br>
      <textarea id="productDesc" placeholder="Deskripsi Produk" rows="4" required></textarea><br>
      <input type="number" id="productPrice" placeholder="Harga Produk (contoh: 25000)" required><br>
      <input type="file" id="productImage" accept="image/*" required><br>
      <button id="saveProduct">Simpan Produk</button>
    </div>
  `;

  document.getElementById("saveProduct").addEventListener("click", async () => {
    const name = document.getElementById("productName").value.trim();
    const desc = document.getElementById("productDesc").value.trim();
    const price = parseFloat(document.getElementById("productPrice").value);
    const file = document.getElementById("productImage").files[0];

    if (!name || !desc || !price || !file) {
      alert("⚠️ Semua kolom wajib diisi!");
      return;
    }

    try {
      const saveBtn = document.getElementById("saveProduct");
      saveBtn.disabled = true;
      saveBtn.textContent = "Menyimpan...";

      // Upload gambar ke Firebase Storage
      const fileRef = ref(storage, `produk/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const imageUrl = await getDownloadURL(fileRef);

      // Simpan data ke Firestore
      await addDoc(collection(db, "produk"), {
        nama: name,
        deskripsi: desc,
        harga: price,
        gambar: imageUrl,
        filePath: `produk/${Date.now()}_${file.name}`,
        dibuat: new Date(),
      });

      alert("✅ Produk berhasil disimpan!");
      showProductList();
    } catch (error) {
      alert("❌ Gagal menyimpan produk: " + error.message);
    }
  });
}

// =============================
// 🔹 Fungsi Menampilkan Daftar Produk
// =============================
async function showProductList() {
  main.innerHTML = `
    <h2 style="color:gold; margin-bottom:20px;">Daftar Produk</h2>
    <div class="produk-container" id="produkList"></div>
  `;

  const produkList = document.getElementById("produkList");
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
            <button class="hapus-btn" title="Hapus Produk"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>
    `;
  });

  // =============================
  // 🔹 Fungsi Hapus Produk
  // =============================
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
// 🔹 Hubungkan Tombol
// =============================
if (addProductBtn) addProductBtn.addEventListener("click", showAddProductForm);
if (centerAddProduct) centerAddProduct.addEventListener("click", showAddProductForm);
if (viewProductsBtn) viewProductsBtn.addEventListener("click", showProductList);
if (centerViewProducts) centerViewProducts.addEventListener("click", showProductList);
