// =============================
// 🔹 Sidebar toggle
// =============================
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

// =============================
// 🔹 Tombol Logout
// =============================
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", () => {
  window.location.href = "index.html"; // kembali ke halaman login
});

// =============================
// 🔹 Klik judul DASHBOARD
// =============================
const dashboardTitle = document.getElementById("dashboardTitle");
dashboardTitle.addEventListener("click", () => {
  window.location.href = "dashboard.html"; // reload dashboard utama
});

// =============================
// 🔹 Tombol Tambah Produk (di sidebar & tengah)
// =============================
const addProductBtn = document.getElementById("addProductBtn");
const centerAddProduct = document.getElementById("centerAddProduct");

// Fungsi menampilkan form tambah produk
function showAddProductForm() {
  const formHTML = `
    <div class="product-form">
      <h2>Tambah Produk</h2>
      <input type="text" id="productName" placeholder="Nama Produk" required><br>
      <textarea id="productDesc" placeholder="Deskripsi Produk" rows="4" required></textarea><br>
      <input type="number" id="productPrice" placeholder="Harga Produk (contoh: 25000)" required><br>
      <input type="file" id="productImage" accept="image/*" required><br>
      <button id="saveProduct">Simpan Produk</button>
    </div>
  `;

  // Ganti isi konten utama dengan form
  document.querySelector(".main-content").innerHTML = formHTML;

  // Tambahkan event listener untuk tombol simpan
  document.getElementById("saveProduct").addEventListener("click", async () => {
    const name = document.getElementById("productName").value.trim();
    const desc = document.getElementById("productDesc").value.trim();
    const price = parseFloat(document.getElementById("productPrice").value);
    const fileInput = document.getElementById("productImage");
    const file = fileInput.files[0];

    // Validasi form
    if (!name || !desc || !price || !file) {
      alert("Semua kolom wajib diisi!");
      return;
    }

    // Convert gambar ke Base64
    const reader = new FileReader();
    reader.onload = function (e) {
      const imageBase64 = e.target.result;

      // Ambil data lama dari localStorage
      let produkList = JSON.parse(localStorage.getItem("produkList")) || [];

      // Tambahkan produk baru
      produkList.push({
        nama: name,
        deskripsi: desc,
        harga: price,
        gambar: imageBase64,
        dibuat: new Date().toLocaleString(),
      });

      // Simpan kembali ke localStorage
      localStorage.setItem("produkList", JSON.stringify(produkList));

      alert("✅ Produk berhasil disimpan!");
      window.location.href = "produk.html"; // pindah ke halaman produk
    };

    reader.readAsDataURL(file);
  });
}

// Event listener tombol
addProductBtn.addEventListener("click", showAddProductForm);
centerAddProduct.addEventListener("click", showAddProductForm);

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

// =============================
// 🔹 Menampilkan Daftar Produk
// =============================
async function showProductList() {
  const produkContainerHTML = `
    <h2 style="color:gold; margin-bottom:20px;">Daftar Produk</h2>
    <div class="produk-slider-container">
      <!-- Tombol Kiri -->
      <button class="slider-btn prevBtn">&#8592;</button>
      <div class="produk-container horizontal-scroll" id="produkList"></div>
      <!-- Tombol Kanan -->
      <button class="slider-btn nextBtn">&#8594;</button>
    </div>
  `;
  
  document.querySelector(".main-content").innerHTML = produkContainerHTML;

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
            <!-- Tombol Hapus Produk -->
            <button class="hapus-btn" title="Hapus Produk"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>
    `;
  });

  // Setup Tombol Geser Kanan/Kiri
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
// 🔹 Hubungkan Tombol
// =============================
if (addProductBtn) addProductBtn.addEventListener("click", showAddProductForm);
if (centerAddProduct) centerAddProduct.addEventListener("click", showAddProductForm);
if (viewProductsBtn) viewProductsBtn.addEventListener("click", showProductList);
if (centerViewProducts) centerViewProducts.addEventListener("click", showProductList);
