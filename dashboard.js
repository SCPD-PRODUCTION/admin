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
    if (!name || !desc || !pri
