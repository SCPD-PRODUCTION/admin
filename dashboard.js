// Sidebar toggle
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  window.location.href = "index.html";
});

// Klik Dashboard → kembali ke halaman utama
document.getElementById("dashboardTitle").addEventListener("click", () => {
  window.location.href = "dashboard.html";
});

// Tombol Tambah Produk
const addProductBtn = document.getElementById("addProductBtn");
const centerAddProduct = document.getElementById("centerAddProduct");

function showAddProductForm() {
  const formHTML = `
    <div class="product-form">
      <h2>Tambah Produk</h2>
      <input type="text" id="productName" placeholder="Nama Produk" required><br>
      <textarea id="productDesc" placeholder="Deskripsi Produk" rows="4"></textarea><br>
      <input type="file" id="productImage" accept="image/*" required><br>
      <button id="saveProduct">Simpan Produk</button>
    </div>
  `;
  document.querySelector(".main-content").innerHTML = formHTML;

  document.getElementById("saveProduct").addEventListener("click", async () => {
    const name = document.getElementById("productName").value;
    const desc = document.getElementById("productDesc").value;
    const fileInput = document.getElementById("productImage");
    const file = fileInput.files[0];

    if (!name || !desc || !file) {
      alert("Semua kolom wajib diisi!");
      return;
    }

    // Convert gambar ke Base64
    const reader = new FileReader();
    reader.onload = function(e) {
      const imageBase64 = e.target.result;

      // Ambil produk yang sudah ada dari localStorage
      let produkList = JSON.parse(localStorage.getItem("produkList")) || [];

      // Tambahkan produk baru
      produkList.push({
        nama: name,
        deskripsi: desc,
        gambar: imageBase64,
        dibuat: new Date().toLocaleString()
      });

      // Simpan kembali ke localStorage
      localStorage.setItem("produkList", JSON.stringify(produkList));

      alert("Produk berhasil disimpan!");
      window.location.href = "produk.html";
    };
    reader.readAsDataURL(file);
  });
}

addProductBtn.addEventListener("click", showAddProductForm);
centerAddProduct.addEventListener("click", showAddProductForm);
